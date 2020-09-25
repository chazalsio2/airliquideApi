import Properties from "../../ivisionr-app/src/pages/Properties";
import Project from "../models/Project";

export async function checkMatchingForSearchMandate(projectId) {
  // TODO:

  const project = await Project.findById(projectId).exec();

  const properties = await Properties.find({})
}
