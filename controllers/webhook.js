import { sendMessageToSlack } from "../lib/slack";
import Project from "../models/Project";
import Document from "../models/Document";
import ProjectEvent from "../models/ProjectEvent";
import Client from "../models/Material";
import User from "../models/User";
import crypto from "crypto";
import { generateError } from "../lib/utils";
import { sendMandateSignatureConfirmation } from "../lib/email";
import { uploadFileFromStringData } from "../lib/aws";
import EquipmentAssignments from "../models/EquipmentAssignments";
import Material from "../models/Material";



import DocusignManager from "../lib/docusign";
import { sendNewDocWebhook } from "../services/webhook.service";

function computeHash(payload) {
  const hmac = crypto.createHmac("sha256", process.env.DOCUSIGN_CONNECT_SECRET);
  hmac.write(payload);
  hmac.end();
  return hmac.read().toString("base64");
}
export async function getOneUser(req, res, next) {
  try {
    const userid = req.params.userid;

    // Récupérer l'utilisateur par son ID
    const user = await User.findById(userid).lean();

    // Récupérer les assignations d'équipement de l'utilisateur
    user.equipe = await EquipmentAssignments.find({ user_id: user._id }).lean();

    // Obtenir les IDs d'équipements à partir des assignations
    const equipeIds = user.equipe.map((equipement) => equipement.equipmentId);

    // Récupérer les matériaux correspondant aux IDs d'équipements
    user.material = await Material.find({ _id: { $in: equipeIds } }).lean();
    console.log(user.equipe);
    console.log(user.material);

    // Retourner les données de l'utilisateur
    return res.json({ success: true, data: user });

  } catch (e) {
    // Gérer les erreurs ici
    console.error(e);
    return res.status(500).json({ success: false, error: 'Une erreur est survenue' });
  }
}


export async function handleWebhookDocusign(req, res, next) {
  try {
    const envelope = (req.body.docusignenvelopeinformation || {})
      .envelopestatus;

    const verify = req.headers["x-docusign-signature-1"];
    const payload = Buffer.from(req.rawBody, "utf8");
    const computedHash = computeHash(payload);

    if (verify !== computedHash) {
      //
    } else {
      //
    }

    if (envelope) {
      switch (envelope.status) {
        case "Sent": {
          const project = await Project.findOne({
            mandateEnvelopeId: envelope.envelopeid
          }).lean();

          if (!project) {
            console.warn(`No project waiting a mandate signature`);
            return res.json({
              success: false,
              reason: "No project waiting a mandate signature"
            });
          }

          const client = await Client.findOne({
            email: project.clientId
          }).lean();

          if (!client) {
            console.warn(`No client for this project`);
            return res.json({
              success: false,
              reason: "No client for this project"
            });
          }

          sendMessageToSlack({
            message: `L'envelope ${envelope.envelopeid} a été envoyé à ${client.displayName} (${client.email})`
          });
        }

        case "Completed": {
          const project = await Project.findOne({
            mandateEnvelopeId: envelope.envelopeid
          }).lean();

          if (!project) {
            console.warn(`No project waiting a mandate signature`);
            return res.json({
              success: false,
              reason: "No project waiting a mandate signature"
            });
          }

          if (project.status !== "wait_mandate_signature") {
            console.warn(
              `Received signature for project ${project._id} with wrong state (${project.status})`
            );
            return res.json({
              success: false,
              reason: `Received signature for project ${project._id} with wrong state (${project.status})`
            });
          }

          if (project.type === "search" || project.type === "search vip") {
            DocusignManager.getEnvelope(
              envelope.envelopeid,
              async (err, docData) => {
                if (err) {
                  console.error(err);
                } else {
                  const mandateDoc = await new Document({
                    name: "Signature mandat de recherche.pdf",
                    projectId: project._id,
                    contentType: "application/pdf"
                  }).save();
                  const location = await uploadFileFromStringData(
                    `project__${project._id}/${mandateDoc._id}_mandat-de-recherche-signature.pdf`,
                    docData,
                    "application/pdf"
                  );
                  await Document.updateOne(
                    { _id: mandateDoc._id },
                    { $set: { url: location } }
                  ).exec();

                  await sendNewDocWebhook(document._id)


                  await Project.updateOne(
                    { _id: project._id },
                    { $set: { mandateDocId: mandateDoc._id } }
                  ).exec();
                }
              }
            );
          }

          await Project.updateOne(
            { _id: project._id },
            { $set: { status: "wait_purchase_offer" } }
          ).exec();

          await new ProjectEvent({
            projectId: project._id,
            type: "mandate_signature_done"
          }).save();

          const client = await Client.findOne({
            email: project.clientId
          }).lean();

          if (!client) {
            console.warn(`No client for this project`);
            return res.json({
              success: false,
              reason: "No client for this project"
            });
          }
          sendMessageToSlack({
            message: `Un mandat a été signé par ${client.displayName} (${client.email}) (Envelope ${envelope.envelopeid})`
          });

          sendMandateSignatureConfirmation(client);

          const alreadyUser = await User.findOne({
            clientId: client._id
          }).lean();

          let roleToAdd;

          if (project.type === "management") {
            roleToAdd = "client_management_mandate";
          }

          if (project.type === "sales") {
            roleToAdd = "client_sales_mandate";
          }

          if (project.type === "search") {
            roleToAdd = "client_search_mandate";
          }

          if (project.type === "search vip") {
            roleToAdd = "client_search_mandate_vip";
          }

          if (alreadyUser) {
            await User.updateOne(
              { _id: alreadyUser._id },
              {
                $addToSet: { roles: roleToAdd },
                $set: { clientId: client._id }
              }
            ).exec();
          } else {
            const user = await new User({
              email: envelope.email,
              roles: [roleToAdd],
              displayName: client.displayName,
              clientId: client._id
            }).save();
            sendMessageToSlack({
              message: `Un nouvel utilisateur a été ajouté ${user.displayName} (${roleToAdd})`
            });
          }
        }

        default:
          console.info("Envelope status not handled:", envelope.status);
      }
    } else {
      console.warn("Pas d'envelope");
    }
    return res.json({ success: true });
  } catch (e) {
    console.error("Error on webhook", e.message);
    next(generateError(e.message));
  }
}
