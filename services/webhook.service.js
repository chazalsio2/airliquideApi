import axios from 'axios'
import moment from 'moment'
import { getClient } from './client.service'
import { getUser } from './user.service'

export async function sendAgreementAcceptedWebhook(project) {
  const client = await getClient(project.clientId)
  const commercial = await getUser(project.commercialId)
  axios({
    method: "POST",
    url: process.env.ZAPPIER_WEBHOOK_URL,
    data: {
      clientName: `${client.firstName} ${client.lastName}`,
      projectUrl: `${process.env.APP_URL}/projects/${project._id}`,
      commercialCommission: (project.commissionAmount / 100).toFixed(2),
      commissionPercent: project.commercialPourcentage,
      commercialName: commercial ? `${commercial.firstName} ${commercial.lastName}` : null,
      mandateDate: project.mandateDate ? moment(project.mandateDate).toISOString() : null,
      mandateUrl: project.mandateDoc ? project.mandateDoc.url : null,
      salesAgreementDate: project.salesAgreementDate ? moment(project.salesAgreementDate).toISOString() : null,
      salesAgreementUrl: project.salesAgreementDoc ? project.salesAgreementDoc.url : null
    }
  })
}
