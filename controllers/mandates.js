import { generateError } from "../lib/utils";
import Mandate from "../models/Mandate";
import Client from "../models/Client";
import MandateEvent from "../models/MandateEvent";

export async function getMandate(req, res, next) {
  try {
    const { mandateId } = req.params;

    const mandate = await Mandate.findById(mandateId).lean();

    if (!mandate) {
      return next(generateError("Mandate not found", 404));
    }

    const client = await Client.findById(mandate.clientId).lean();

    mandate.client = client;

    const events = await MandateEvent.find({ mandateId: mandate._id }).lean();

    mandate.events = events;

    return res.json({ success: true, data: mandate });
  } catch (e) {
    next(generateError(e.message));
  }
}
