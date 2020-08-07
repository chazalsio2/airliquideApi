import Client from "../models/Client";
import { generateError } from "../lib/utils";
import Project, { projectTypes } from "../models/Project";
import { sendNewClientEmail } from "../lib/email";

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

    client.projects = await Project.find(
      {
        clientId: client._id,
        status: { $nin: ["canceled", "completed"] },
      },
      null,
      { sort: { createdAt: -1 } }
    ).lean();

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
      referral,
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
      referral,
    }).save();

    // sendNewClientEmail(client); // should we send the email here ?

    if (projectTypes.indexOf(serviceType) !== -1) {
      const project = await new Project({
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

export async function addProject(req, res, next) {
  try {
    const { clientId } = req.params;
    const { projectType } = req.body;

    if (
      !clientId ||
      !projectType ||
      !projectTypes.indexOf(projectType) === -1
    ) {
      return next(generateError("Invalid request", 401));
    }

    const client = await Client.findById(clientId).lean();

    if (!client) {
      return next(generateError("Client not found", 404));
    }

    await new Project({ clientId, type: projectType }).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
