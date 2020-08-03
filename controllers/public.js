import { generateError } from "../lib/utils";
import Client from "../models/Client";
import Project, { projectTypes } from "../models/Project";

export async function publicCreateClient(req, res, next) {
  try {
    const {
      firstname,
      lastname,
      email,
      phone,
      serviceType,
      geographicSector,
    } = req.body;

    if (projectTypes.indexOf(serviceType) === -1) {
      return next(generateError("Invalid service", 403));
    }

    const client = await new Client({
      firstname,
      lastname,
      geographicSector,
      email,
      phone,
    }).save();

    if (projectTypes.indexOf(serviceType) !== -1) {
      const project = await Project({
        clientId: client,
        type: serviceType,
      }).save();

      return res.json({
        success: true,
        data: {
          projectId: project._id,
          completed: false,
        },
      });
    }

    return res.json({ success: true, data: { completed: true } });
  } catch (e) {
    next(generateError(e.message));
  }
}
