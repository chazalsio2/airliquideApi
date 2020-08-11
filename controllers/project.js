import { Types } from "mongoose";
import { generateError } from "../lib/utils";
import User from "../models/User";
import Project from "../models/Project";
import Client from "../models/Client";
import Document from "../models/Document";
import ProjectEvent from "../models/ProjectEvent";

export async function getProject(req, res, next) {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    project.client = await Client.findById(project.clientId).lean();
    project.events = await ProjectEvent.find({ projectId: project._id }).lean();
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
      status: { $nin: ["assigned", "canceled"] },
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
      status: { $nin: ["assigned", "canceled"] },
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

    const project = await Project.findById(projectId).lean();

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
          },
        },
      }
    ).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function savePersonalSituation(req, res, next) {
  try {
    const {
      address,
      crd,
      creditamount,
      desiredgrossyield,
      email,
      firstname,
      investalone,
      lastname,
      loans,
      othertypeofrentalincome,
      personalincome,
      personalindustry,
      personalseniority,
      personalsituation,
      personalstatus,
      phone,
      principalresidence,
      savings,
      typeofincome,
      typeofrentalincome,
    } = req.body;

    const { projectId } = req.params;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
