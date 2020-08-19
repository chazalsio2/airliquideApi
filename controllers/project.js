import { Types } from "mongoose";
import { generateError, isAdminOrCommercial } from "../lib/utils";
import User from "../models/User";
import Project from "../models/Project";
import Client from "../models/Client";
import Document from "../models/Document";
import ProjectEvent from "../models/ProjectEvent";
import { sendProjectWaitingValidationEmail } from "../lib/email";
import { uploadFile } from "../lib/aws";
import { sendMessageToSlack } from "../lib/slack";

export async function getProject(req, res, next) {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    project.client = await Client.findById(project.clientId).lean();
    project.events = await ProjectEvent.find({ projectId: project._id }, null, {
      sort: { createdAt: -1 },
    }).lean();
    project.documents = await Document.find(
      { projectId: Types.ObjectId(project._id) }, // do not work i dont know why
      null,
      {
        sort: { createdAt: -1 },
      }
    ).lean();

    if (project.commercialId) {
      project.commercial = await User.findById(
        project.commercialId,
        "displayName"
      ).lean();
    }

    return res.json({ success: true, data: project });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getProjects(req, res, next) {
  try {
    const projects = await Project.find({
      status: { $nin: ["canceled", "refused", "closed"] },
    }).lean();

    const clientEnrichedPromises = projects.map(async (project) => {
      project.client = await Client.findById(project.clientId).lean();
      if (project.commercialId) {
        project.commercial = await User.findById(
          project.commercialId,
          "displayName"
        ).lean();
      }
      return project;
    });

    const projectsEnriched = await Promise.all(clientEnrichedPromises);

    return res.json({ success: true, data: projectsEnriched });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getProjectsAssigned(req, res, next) {
  try {
    const projects = await Project.find({
      commercialId: req.user._id,
      status: { $nin: ["canceled", "refused", "closed"] },
    }).lean();

    const clientEnrichedPromises = projects.map(async (project) => {
      project.client = await Client.findById(project.clientId).lean();
      if (project.commercialId) {
        project.commercial = await User.findById(
          project.commercialId,
          "displayName"
        ).lean();
      }
      return project;
    });

    const projectsEnriched = await Promise.all(clientEnrichedPromises);

    return res.json({ success: true, data: projectsEnriched });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getProjectsMissingValidation(req, res, next) {
  try {
    const projects = await Project.find({
      status: "draft",
    }).lean();

    const clientEnrichedPromises = projects.map(async (project) => {
      project.client = await Client.findById(project.clientId).lean();
      if (project.commercialId) {
        project.commercial = await User.findById(
          project.commercialId,
          "displayName"
        ).lean();
      }
      return project;
    });

    const projectsEnriched = await Promise.all(clientEnrichedPromises);

    return res.json({ success: true, data: projectsEnriched });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function saveSearchSheet(req, res, next) {
  try {
    const {
      propertyType,
      investmentType,
      otherInvestmentType,
      propertySize,
      propertySizeDetail,
      propertyArea,
      land,
      landArea,
      searchSector,
      searchSectorCities,
      swimmingpool,
      varangue,
      delay,
      budget,
    } = req.body;

    const { projectId } = req.params;
    const project = await Project.findById(projectId).lean();

    if (
      !propertyType ||
      !investmentType ||
      !propertySize ||
      !propertyArea ||
      !land ||
      !searchSector ||
      !swimmingpool ||
      !varangue ||
      !delay ||
      !budget
    ) {
      return next(generateError("Invalid arguments", 401));
    }

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          searchSheet: {
            investmentType:
              investmentType === "other" ? otherInvestmentType : investmentType,
            propertySize,
            propertySizeDetail,
            propertyArea,
            land,
            landArea,
            searchSector,
            swimmingpool,
            varangue,
            delay,
            budget,
            searchSectorCities: searchSectorCities || [],
          },
        },
      }
    ).exec();

    const client = await Client.findById(project.clientId).lean();

    sendMessageToSlack({
      message: `${client.displayName} à compléter sa fiche de recherche : ${process.env.APP_URL}/clients/${client._id}`,
    });

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function confirmSearchMandate(req, res, next) {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    const { readysearchmandate, allowSaveData, timeslots } = req.body;

    if (!readysearchmandate) {
      return next(generateError("Missing argument", 403));
    }

    const client = await Client.findById(project.clientId).lean();

    if (!client) {
      return next(generateError("Client not found", 404));
    }

    await Client.updateOne(
      {
        _id: project.clientId,
      },
      {
        $set: {
          availabilities: timeslots,
          allowSaveData,
        },
      }
    ).exec();

    await Project.updateOne(
      { _id: projectId },
      { $set: { typeOfMandate: readysearchmandate, status: "draft" } }
    ).exec();

    sendProjectWaitingValidationEmail(project);

    await new ProjectEvent({
      projectId: project._id,
      type: "form_completion",
      authorUserId: project.clientId,
    }).save();

    sendMessageToSlack({
      message: `Le mandat de recherche pour le client ${client.displayName} est en attente de validation : ${process.env.APP_URL}/projects/${projectId}`,
    });

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function savePersonalSituation(req, res, next) {
  try {
    const {
      investalone,
      desiredgrossyield,
      firstname,
      lastname,
      phone,
      email,
      address,
      personalincome,
      personalindustry,
      personalseniority,
      personalsituation,
      personalstatus,
      savings,
      loans,
      crd,
      rentamount,
      creditamount,
      principalresidence,
      typeofincome,
      othertypeofincome,
      typeofrentalincome,
      othertypeofrentalincome,
      spousefirstname,
      spouselastname,
      spouseaddress,
      spouseemail,
      spousesituation,
      spouseincome,
      spouseindustry,
      spouseseniority,
    } = req.body;

    const { projectId } = req.params;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    const projectModifier = { investAlone: investalone };

    if (desiredgrossyield) {
      projectModifier.desiredGrossYield = desiredgrossyield;
    }

    await Project.updateOne(
      { _id: projectId },
      { $set: projectModifier }
    ).exec();

    const clientModifier = {
      firstname,
      lastname,
      phone,
      email,
      address,
      savings,
      loans,
      crd,
      typesOfIncome: typeofincome,
      othersTypesOfIncome: othertypeofincome,
      typesOfRentalIncome: typeofrentalincome,
      othersTypesOfRentalIncome: othertypeofrentalincome,
      principalResidence: principalresidence,
      rentAmount: rentamount,
      creditAmount: creditamount,
      income: personalincome,
      industry: personalindustry,
      seniority: personalseniority,
      situation: personalsituation,
      status: personalstatus,
    };

    if (investalone === "couple") {
      clientModifier.spouse = {
        firstname: spousefirstname,
        lastname: spouselastname,
        address: spouseaddress,
        email: spouseemail,
        situation: spousesituation,
        income: spouseincome,
        industry: spouseindustry,
        seniority: spouseseniority,
      };
    }

    await Client.updateOne(
      { _id: project.clientId },
      {
        $set: clientModifier,
      }
    ).exec();

    const client = await Client.findById(project.clientId).lean();

    sendMessageToSlack({
      message: `${client.displayName} à renseigné sa situation personnelle : ${process.env.APP_URL}/clients/${client._id}`,
    });

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function refuseProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { reason } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "draft") {
      return next(generateError("Wrong state", 401));
    }

    await Project.updateOne(
      { _id: projectId },
      { $set: { status: "refused", refusalReason: reason } }
    ).exec();

    await new ProjectEvent({
      projectId,
      type: "project_refused",
      comment: reason,
      authorUserId: req.user._id,
    }).save();

    const client = await Client.findById(project.clientId).lean();

    const user = await User.findById(req.user._id).lean();

    sendMessageToSlack({
      message: `Le mandat de recherche de ${client.displayName} a été refusé par ${user.displayName} : ${process.env.APP_URL}/projects/${project._id}`,
    });

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function acceptProject(req, res, next) {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "draft") {
      return next(generateError("Wrong state", 401));
    }

    await Project.updateOne(
      { _id: projectId },
      { $set: { status: "wait_mandate_signature" } }
    ).exec();

    await new ProjectEvent({
      projectId,
      type: "project_accepted",
      authorUserId: req.user._id,
    }).save();

    const client = await Client.findById(project.clientId).lean();

    const user = await User.findById(req.user._id).lean();

    sendMessageToSlack({
      message: `Le mandat de recherche de ${client.displayName} a été accepté par ${user.displayName} : ${process.env.APP_URL}/projects/${project._id}`,
    });

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function addDocumentToProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { fileName, fileData, contentType } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (!fileName || !fileData || !contentType) {
      return next(generateError("Invalid request", 403));
    }

    const isAuthorized =
      isAdminOrCommercial(req.user) || project.clientId === req.user._id;

    if (!isAuthorized) {
      return next(generateError("Not authorized", 401));
    }

    const document = await new Document({
      name: fileName,
      authorUserId: req.user._id,
      projectId,
      contentType,
    }).save();

    const location = await uploadFile(
      `project__${projectId}/${document._id}_${document.name}`,
      fileData,
      contentType
    );
    await Document.updateOne(
      { _id: document._id },
      { $set: { url: location } }
    ).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function assignCommercial(req, res, next) {
  try {
    const { projectId } = req.params;
    const { commercialId } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.commercialId) {
      return next(generateError("Project already assigned", 403));
    }

    const commercial = await User.findOne({
      _id: commercialId,
      roles: "commercial_agent",
      deactivated: { $ne: true },
    });

    if (!commercial) {
      return next(generateError("Commercial not found", 404));
    }

    await Project.updateOne(
      { _id: projectId },
      { $set: { commercialId } }
    ).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
