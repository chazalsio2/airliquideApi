import Client from "../models/Client";
import { generateError } from "../lib/utils";
import Project, { projectTypes } from "../models/Project";

const allowedServiceTypes = [...projectTypes, "coaching"];

export async function getClients(req, res, next) {
  try {
    // TODO: pagination here

    const clients = await Client.find({}, null, {
      sort: { createdAt: -1 },
    }).lean();

    const clientsWithProjects = await Promise.all(
      clients.map(async (client) => {
        const projects = await Project.find({
          clientId: client._id,
          status: { $nin: ["canceled", "completed"] },
        }).lean();
        client.projects = projects;
        return client;
      })
    );
    return res.json({ success: true, data: clientsWithProjects });
  } catch (e) {
    return next(generateError(e.message));
  }
}

export async function getClient(req, res, next) {
  try {
    const { clientId } = req.params;
    const client = await Client.findById(clientId).lean();

    if (!client) {
      return next(generateError("Client not found", 404));
    }

    client.projects = await Project.find({
      clientId: client._id,
      status: { $nin: ["canceled", "completed"] },
    }).lean();

    return res.json({
      success: true,
      data: client,
    });
  } catch (e) {
    return res.status(500).json({ success: false });
  }
}

export async function createClient(req, res, next) {
  try {
    const {
      firstname,
      lastname,
      email,
      phone,
      serviceType,
      geographicSector,
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
