import _ from "underscore";
import Project from "../models/Project";
import DossierNotaire from "../models/DossierNotaire"
import { allowedRoles } from "../models/User";
import Contact from "../models/Contact";
import { generateError, isAdmin, isAdminOrCommercial } from "../lib/utils";
import {sendNewStatusProject} from '../services/webhook.service';

export async function demandSignature(req, res, next) {
    try {
    const { webhookId } = req.params;

    const project = await Project.findById(webhookId).lean();
    if (!project) {
        return next(generateError("Project not found", 404));
      }

    sendNewStatusProject(project);
}
catch (e) {
  next(generateError(e.message));
}
}