import { sendMessageToSlack } from "../lib/slack";
import Project from "../models/Project";
import ProjectEvent from "../models/ProjectEvent";
import Client from "../models/Client";
import User from "../models/User";
import crypto from "crypto";
import { generateError } from "../lib/utils";

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
      switch (envelope.status) {
        case "Sent": {
          sendMessageToSlack({
            message: `L'envelope ${envelope.envelopeid} a été envoyé à ${envelope.username} (${envelope.email})`,
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

          await Project.updateOne(
            { projectId: project._id },
            { $set: { status: "wait_purchase_offer" } }
          ).exec();

          await new ProjectEvent({
            projectId: project._id,
            type: "mandate_signature_done",
          }).save();

          sendMessageToSlack({
            message: `Un mandat a été signé par ${envelope.username} (${envelope.email}) (Envelope ${envelope.envelopeid})`,
          });

          const client = await Client.findOne({ email: envelope.email }).lean();

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
