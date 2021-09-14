import axios from 'axios'
import moment from 'moment'
import { getProject } from './project.service'
import { getClient } from './client.service'
import { getUser } from './user.service'
import { getDocument } from './document.service'

export async function sendAgreementAcceptedWebhook(projectId) {
  const project = await getProject(projectId)
  const client = await getClient(project.clientId)
  const commercial = await getUser(project.commercialId)
  axios({
    method: "POST",
    url: process.env.ZAPPIER_WEBHOOK_URL,
    data: {
      clientName: `${client.firstname} ${client.lastname}`,
      projectUrl: `${process.env.APP_URL}/projects/${project._id}`,
      commercialCommission: (project.commissionAmount / 100).toFixed(2),
      commissionPercent: project.commercialPourcentage,
      commercialName: commercial ? commercial.displayName : null,
      mandateDate: project.mandateDate ? moment(project.mandateDate).toISOString() : null,
      mandateUrl: project.mandateDoc ? project.mandateDoc.url : null,
      salesAgreementDate: project.salesAgreementDate ? moment(project.salesAgreementDate).toISOString() : null,
      salesAgreementUrl: project.salesAgreementDoc ? project.salesAgreementDoc.url : null
    }
  })
}

export async function sendNewDocWebhook(documentId) {
  const document = await getDocument(documentId)
  const client = await getClient(project.clientId)
  const project = await getProject(projectId)
  axios({
    method: "POST",
    url: process.env.ZAPPIER_FILE_WEBHOOK_URL,
    data: {

      clientName: `${client.firstname} ${client.lastname}`, 
      filename: document.name,
      location: document.url,
      typeProject: project.type,
      StatusProject: project.status,
      projectId: document.projectId || null
    }
  })
}
