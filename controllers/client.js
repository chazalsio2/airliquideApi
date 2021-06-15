import moment from "moment";

import Client from "../models/Client";
import { generateError } from "../lib/utils";
import Project, { projectTypes } from "../models/Project";
import ProjectEvent from "../models/ProjectEvent";
import { matchPropertiesForSearchMandate } from "../lib/matching";
import { sendMatchPropertiesEmail } from "../lib/email";

export async function getClients(req, res, next) {
  try {
    const LIMIT_BY_PAGE = 10;
    const { page = "", filter = "" } = req.query;
    const pageNumber = Number(page) || 1;
    const selector = {
      $or: [
        {
          firstname: { $regex: filter, $options: "i" }
        },
        {
          lastname: { $regex: filter, $options: "i" }
        },
        {
          displayName: { $regex: filter, $options: "i" }
        },
        {
          email: { $regex: filter, $options: "i" }
        }
      ]
    };
    const clientCount = await Client.countDocuments(selector).exec();

    const clients = await Client.find(selector, null, {
      limit: LIMIT_BY_PAGE,
      skip: (pageNumber - 1) * LIMIT_BY_PAGE,
      sort: { createdAt: -1 }
    }).lean();

    const clientsWithProjects = await Promise.all(
      clients.map(async (client) => {
        const projects = await Project.find({
          clientId: client._id,
          status: { $nin: ["canceled", "completed"] }
        }).lean();
        client.projects = projects;
        return client;
      })
    );

    const pageCount = Math.ceil(clientCount / LIMIT_BY_PAGE);

    return res.json({
      success: true,
      data: { clients: clientsWithProjects, pageCount, total: clientCount }
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
        // status: { $nin: ["canceled", "completed"] }
      },
      null,
      { sort: { createdAt: -1 } }
    ).lean();

    return res.json({
      success: true,
      data: client
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
      referral
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
      referral
    };

    const client = await new Client(clientData).save();

    if (projectTypes.indexOf(serviceType) !== -1) {
      const project = await new Project({
        clientId: client,
        type: serviceType
      }).save();

      return res.json({
        success: true,
        data: {
          projectId: project._id
        }
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
      type: "project_creation"
    }).save();

    return res.json({ success: true, data: { projectId: project._id } });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function editClient(req, res, next) {
  try {
    const modifier = req.body;
    const {
      birthday,
      email,
      createdAt,
      updatedAt,
      projects,
      referral,
      typeofincome,
      othertypeofincome,
      typeofrentalincome,
      othertypeofrentalincome,
      principalresidence,
      rentamount,
      creditamount,
      personalincome,
      personalindustry,
      personalseniority,
      personalsituation,
      personalstatus,
      rentalIncome
    } = modifier;

    const {
      spousefirstname,
      spouseaddress,
      spouseemail,
      spouseincome,
      spouseindustry,
      spouselastname,
      spousephone,
      spouseseniority,
      spousesituation
    } = req.body;

    if (spousefirstname) {
      modifier.spouse = {
        firstname: spousefirstname,
        lastname: spouselastname,
        email: spouseemail,
        income: spouseincome,
        industry: spouseindustry,
        phone: spousephone,
        address: spouseaddress,
        seniority: spouseseniority,
        situation: spousesituation
      };
    }

    if (email || createdAt || updatedAt || projects || referral) {
      return next(generateError("Cannot update some fields", 403));
    }

    if (birthday) {
      modifier.birthday = moment(birthday).toDate();
    }

    if (rentalIncome) {
      modifier.rentalIncome = rentalIncome;
    }

    if (typeofincome) {
      modifier.typesOfIncome = typeofincome;
      delete modifier.typeofincome;
    }

    if (othertypeofincome) {
      modifier.othersTypesOfIncome = othertypeofincome;
      delete modifier.othertypeofincome;
    }
    if (typeofrentalincome) {
      modifier.typesOfRentalIncome = typeofrentalincome;
      delete modifier.typeofrentalincome;
    }
    if (othertypeofrentalincome) {
      modifier.othersTypesOfRentalIncome = othertypeofrentalincome;
      delete modifier.othertypeofrentalincome;
    }
    if (principalresidence) {
      modifier.principalResidence = principalresidence;
      delete modifier.principalresidence;
    }
    if (rentamount) {
      modifier.rentAmount = rentamount;
      delete modifier.rentamount;
    }
    if (creditamount) {
      modifier.creditAmount = creditamount;
      delete modifier.creditamount;
    }
    if (personalincome) {
      modifier.income = personalincome;
      delete modifier.personalincome;
    }
    if (personalindustry) {
      modifier.industry = personalindustry;
      delete modifier.personalindustry;
    }
    if (personalseniority) {
      modifier.seniority = personalseniority;
      delete modifier.personalseniority;
    }
    if (personalsituation) {
      modifier.situation = personalsituation;
      delete modifier.personalsituation;
    }
    if (personalstatus) {
      modifier.status = personalstatus;
      delete modifier.personalstatus;
    }

    const { clientId } = req.params;
    const opts = { runValidators: true };
    const client = await Client.updateOne(
      { _id: clientId },
      { $set: modifier },
      opts
    ).exec();

    return res.json({ success: true, data: client });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function deleteClient(req, res, next) {
  try {
    const { clientId } = req.params;

    const client = await Client.findById(clientId).lean();

    if (!client) {
      throw new Error("Cannot find client", 404);
    }

    await Client.deleteOne({ _id: clientId }).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function deleteProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).lean();
    
    if (!project) {
      return next(generateError("Project not found", 404));
    }
    
    await Project.deleteOne({ _id: projectId }).exec();
    // project.projects = await Project.deleteOne(
    //   {
    //     projectId: project._id,
    //   }
    // ).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}