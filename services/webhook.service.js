import axios from 'axios'
import moment from 'moment'
import { getProject } from './project.service'
import { getClient } from './client.service'
import { getUser } from './user.service'
import { getDocument } from './document.service'
import { Client } from '../models'


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
      commercialPhone: commercial ? commercial.phone : null,
      mandateDate: project.mandateDate ? moment(project.mandateDate).toISOString() : null,
      mandateUrl: project.mandateDoc ? project.mandateDoc.url : null,
      salesAgreementDate: project.salesAgreementDate ? moment(project.salesAgreementDate).toISOString() : null,
      salesAgreementUrl: project.salesAgreementDoc ? project.salesAgreementDoc.url : null
    }
  })
}

export async function sendNewDocWebhook(documentId) {
  const document = await getDocument(documentId)
  const project = await getProject(document.projectId)
  const client = await getClient(project.clientId)
  axios({
    method: "POST",
    url: process.env.ZAPPIER_FILE_WEBHOOK_URL,
    data: {
      clientName: client.firstname, 
      filename: document.name,
      email: client.email,
      location: document.url,
      typeProject: project.type,
      StatusProject: project.status,
      projectId: document.projectId || null
    }
  })
}

export async function sendNewClientWebhook(clientId) {
  const client = await Client.findById(clientId)
  axios({
    method: 'POST',
    url: process.env.ZAPPIER_TEST_WEBHOOK_URL,
    data:{
      clientName: client.lastname,
      clientFirstName: client.firstname
    }
  })
}
