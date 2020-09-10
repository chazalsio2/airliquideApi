import moment from "moment";

import Client from "../models/Client";
import { generateError } from "../lib/utils";
import Project, { projectTypes } from "../models/Project";
import ProjectEvent from "../models/ProjectEvent";

export async function getClients(req, res, next) {
  try {
    const LIMIT_BY_PAGE = 10;
    const { page = "", filter = "" } = req.query;
    const pageNumber = Number(page) || 1;
    const selector = {
      $or: [
        {
          firstname: { $regex: filter, $options: "i" },
        },
        {
          lastname: { $regex: filter, $options: "i" },
        },
        {
          displayName: { $regex: filter, $options: "i" },
        },
        {
          email: { $regex: filter, $options: "i" },
        },
      ],
    };
    const clientCount = await Client.countDocuments(selector).exec();

    const clients = await Client.find(selector, null, {
      limit: LIMIT_BY_PAGE,
      skip: (pageNumber - 1) * LIMIT_BY_PAGE,
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

    const pageCount = Math.ceil(clientCount / LIMIT_BY_PAGE);

    return res.json({
      success: true,
      data: { clients: clientsWithProjects, pageCount, total: clientCount },
    });
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

    const clientData = {
      firstname,
      lastname,
      geographicSector,
      email,
      phone,
      referral,
    };

    const client = await new Client(clientData).save();

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

    const project = await new Project({ clientId, type: projectType }).save();

    await ProjectEvent({
      projectId: project._id,
      type: "project_creation",
    }).save();

    return res.json({ success: true, data: { projectId: project._id } });
  } catch (e) {
    next(generateError(e.message));
  }
}
