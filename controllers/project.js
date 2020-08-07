import { generateError } from "../lib/utils";
import Project from "../models/Project";
import Client from "../models/Client";
import Document from "../models/Document";
import ProjectEvent from "../models/ProjectEvent";
import User from "../models/User";
import { Types } from "mongoose";

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
