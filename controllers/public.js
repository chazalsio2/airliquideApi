import { generateError } from "../lib/utils";
import Client from "../models/Client";
import Mandate, { mandateTypes } from "../models/Mandate";

const allowedServiceTypes = [...mandateTypes, "coaching"];

export async function publicCreateClient(req, res, next) {
  try {
    const {
      firstname,
      lastname,
      email,
      phone,
      serviceType,
      geographicSector
    } = req.body;

    if (allowedServiceTypes.indexOf(serviceType) === -1) {
      return next(generateError("Invalid service", 403));
    }

    const client = await new Client({
      firstname,
      lastname,
      geographicSector,
      email,
      phone,
    }).save();

    if (mandateTypes.indexOf(serviceType) !== -1) {
      const mandate = await Mandate({
        clientId: client,
        type: serviceType,
      }).save();

      return res.json({
        success: true,
        data: {
          mandateId: mandate._id,
          completed: false,
        },
      });
    }

    return res.json({ success: true, data: { completed: true } });
  } catch (e) {
    next(generateError(e.message));
  }
}
