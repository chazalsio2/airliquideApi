import { Project } from '../models'
import { Contact } from '../models'
import { Property } from '../models'



export async function getProject(projectId) {
  const project = await Project.findById(projectId).lean();
  return project
}
export async function getContact(contactId,contactClientId) {
  const contact = await Contact.findById(contactId).lean();
  return contact
}
export async function getProperty(propertyId){
  const property = await Property.findById(propertyId).lean();
  return property
}
