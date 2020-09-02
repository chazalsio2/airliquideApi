import { sendMessageToSlack } from "../lib/slack";
import Project from "../models/Project";
import ProjectEvent from "../models/ProjectEvent";
import Client from "../models/Client";
import User from "../models/User";
import crypto from "crypto";
import { generateError } from "../lib/utils";
import { sendMandateSignatureConfirmation } from "../lib/email";
import { uploadFileFromStringData } from "../lib/aws";

import DocusignManager from "../lib/docusign";

function computeHash(payload) {
  // console.log("computeHash -> payload", payload, typeof payload);
  const hmac = crypto.createHmac("sha256", process.env.DOCUSIGN_CONNECT_SECRET);
  hmac.write(payload);
  hmac.end();
  return hmac.read().toString("base64");
}

export async function handleWebhookDocusign(req, res, next) {
  try {
    const envelope = (req.body.docusignenvelopeinformation || {})
      .envelopestatus;

    const verify = req.headers["x-docusign-signature-1"];
    console.log("verify", verify);
    const payload = Buffer.from(req.rawBody, "utf8");
    const computedHash = computeHash(payload);

    console.log("computedHash", computedHash);
    if (verify !== computedHash) {
      console.log(">>>>Ne match pas");
    } else {
      console.log("MATCH!!!");
    }

    if (envelope) {
      console.log(
        "handleWebhookDocusign -> envelope",
        envelope.recipientstatuses.recipientstatus
      );
      switch (envelope.status) {
        case "Sent": {
          const project = await Project.findOne({
            mandateEnvelopeId: envelope.envelopeid,
          }).lean();

          if (!project) {
            console.warn(`No project waiting a mandate signature`);
            return res.json({
              success: false,
              reason: "No project waiting a mandate signature",
            });
          }

          const client = await Client.findOne({
            email: project.clientId,
          }).lean();

          if (!client) {
            console.warn(`No client for this project`);
            return res.json({
              success: false,
              reason: "No client for this project",
            });
          }

          sendMessageToSlack({
            message: `L'envelope ${envelope.envelopeid} a été envoyé à ${client.displayName} (${client.email})`,
          });
        }

        case "Completed": {
          const project = await Project.findOne({
            mandateEnvelopeId: envelope.envelopeid,
          }).lean();

          if (!project) {
            console.warn(`No project waiting a mandate signature`);
            return res.json({
              success: false,
              reason: "No project waiting a mandate signature",
            });
          }

          if (project.status !== "wait_mandate_signature") {
            console.warn(
              `Received signature for project ${project._id} with wrong state (${project.status})`
            );
            return res.json({
              success: false,
              reason: `Received signature for project ${project._id} with wrong state (${project.status})`,
            });
          }

          if (project.type === "sales") {
            DocusignManager.getEnvelope(
              envelope.envelopeid,
              async (err, docData) => {
                if (err) {
                  console.error(err);
                } else {
                  const mandateDoc = await new Document({
                    name: "Signature mandat de recherche.pdf",
                    projectId: project._id,
                    contentType: "application/pdf",
                  });
                  const location = await uploadFileFromStringData(
                    `project__${project._id}/${mandateDoc._id}_mandat-de-recherche-signature.pdf`,
                    docData,
                    "application/pdf"
                  );
                  await Document.updateOne(
                    { _id: mandateDoc._id },
                    { $set: { url: location } }
                  ).exec();
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
            type: "mandate_signature_done",
          }).save();

          sendMessageToSlack({
            message: `Un mandat a été signé par ${client.displayName} (${client.email}) (Envelope ${envelope.envelopeid})`,
          });

          const client = await Client.findOne({
            email: project.clientId,
          }).lean();

          if (!client) {
            console.warn(`No client for this project`);
            return res.json({
              success: false,
              reason: "No client for this project",
            });
          }

          sendMandateSignatureConfirmation(client);

          const alreadyUser = await User.findOne({
            clientId: client._id,
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

          if (alreadyUser) {
            await User.updateOne(
              { _id: alreadyUser._id },
              {
                $addToSet: { roles: roleToAdd },
                $set: { clientId: client._id },
              }
            ).exec();
          } else {
            const user = await new User({
              email: envelope.email,
              roles: [roleToAdd],
              displayName: client.displayName,
              clientId: client._id,
            }).save();
            sendMessageToSlack({
              message: `Un nouvel utilisateur a été ajouté ${user.displayName} (${roleToAdd})`,
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
