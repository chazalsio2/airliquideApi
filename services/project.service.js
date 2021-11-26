import { Project } from '../models'
import { Contact } from '../models'


export async function getProject(projectId) {
  const project = await Project.findById(projectId).lean();
  return project
}
export async function getContact(contactId,contactClientId) {
  const contact = await Contact.findById(contactId).lean();
  const contact2 = await Contact.findById(contactClientId).lean();
  return contact, contact2
}
