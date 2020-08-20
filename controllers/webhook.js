import { sendMessageToSlack } from "../lib/slack";
import Project from "../models/Project";

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
