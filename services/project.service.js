import { Project } from '../models'

export async function getProject(projectId) {
  const project = await Project.findById(projectId).lean();
  return project
}
