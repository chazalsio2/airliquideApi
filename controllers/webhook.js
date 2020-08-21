import { sendMessageToSlack } from "../lib/slack";
import Project from "../models/Project";
import Client from "../models/Client";
import User from "../models/User";

export async function handleWebhookDocusign(req, res, next) {
  try {
    const envelope = req.body.envelopestatus;

    if (envelope) {
      switch (envelope.status) {
        case "Sent": {
          sendMessageToSlack(
            `L'envelope ${envelope.envelopeid} a été envoyé à ${envelope.username} (${envelope.email})`
          );
        }

        case "Completed": {
          await Project.updateOne(
            { mandateEnvelopeId: envelope.envelopeid },
            { $set: { status: "wait_sales_agreement" } }
          ).exec();

          sendMessageToSlack(
            `Un mandat a été signé par ${envelope.username} (${envelope.email}) (Envelope ${envelope.envelopeid})`
          );

          const client = await Client.findOne({ email: envelope.email }).lean();

          const alreadyUser = await User.findOne({
            clientId: client._id,
          }).lean();

          const project = Project.findOne({
            mandateEnvelopeId: envelope.envelopeid,
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
            sendMessageToSlack(
              `Un nouvel utilisateur a été ajouté ${user.displayName} (${roleToAdd})`
            );
          }
        }

        default:
          console.info("Envelope status not handled:", envelope.status);
      }
    } else {
      console.warning("Pas d'envelope");
    }
    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
