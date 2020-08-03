import { generateError } from "../lib/utils";
import Project from "../models/Project";
import Client from "../models/Client";
import ProjectEvent from "../models/ProjectEvent";

export async function getProject(req, res, next) {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    const client = await Client.findById(project.clientId).lean();

    project.client = client;

    const events = await ProjectEvent.find({ projectId: project._id }).lean();

    project.events = events;

    return res.json({ success: true, data: project });
  } catch (e) {
    next(generateError(e.message));
  }
}
