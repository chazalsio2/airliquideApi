import axios from 'axios'
import moment from 'moment'
import { getProject, getContact } from './project.service'
import { getClient } from './client.service'
import { getUser } from './user.service'
import { getDocument } from './document.service'
import { Client } from '../models'
import {DossierNotaire} from '../models'


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
    url: process.env.ZAPPIER_TEST_WEBHOOK,
    data:{
      clientName: client.lastname,
      clientFirstName: client.firstname
    }
  })
}

export async function sendNewDosiierNtaire(dossiernotaireId){
  const dossiernotaire = await DossierNotaire.findById(dossiernotaireId)
  const contact = await getContact(dossiernotaire.contactId)
  const contact2 = await getContact(dossiernotaire.contactClientId)
  axios({
    method: 'POST',
    url: process.env.ZAPPIER_TEST_WEBHOOK_URL,
    data:{
      MESSAGE:'Donnée client vision_r',
      societe: dossiernotaire.societe,
      client_vision_r: dossiernotaire.client_vision_r,
      adresse: dossiernotaire.adresse,
      Mail: dossiernotaire.Mail,
      //nom_prenon_contact_client_vision_r: contact.firstname+' '+contact.lastname,
      phone_client_vision_r: dossiernotaire.phone,
      date_lieu: dossiernotaire.date_lieu,
      cp_ville: dossiernotaire.cp_ville,
      nationalite: dossiernotaire.nationalite,
      profession: dossiernotaire.profession,
      regime_matrimonial: dossiernotaire.regime_matrimonial,
      MESSAGE:'Donnée acheteur ou vendeur hors vision_r',
      adresse1_a: dossiernotaire.adresse1_a,
      //nom_prenon_contact: contact2.firstname+' '+contact2.lastname,
      cp_ville1_a: dossiernotaire.cp_ville1_a,
      date_lieu_naissance1_a: dossiernotaire.date_lieu_naissance1_a,
      date_regime1_a: dossiernotaire.date_regime1_a,
      mail1_a: dossiernotaire.mail1_a,
      mail1_conjoint: dossiernotaire.mail1_c,
      nationalite1_a: dossiernotaire.nationalite1_a,
      nom1_client_hors_vision_r: dossiernotaire.nom1_a,
      prenom1_a_client_hors_vision_r: dossiernotaire.prenom1_a,
      profession1_a: dossiernotaire.profession1_a,
      regime_matrimonial1_a: dossiernotaire.regime_matrimonial1_a,
      regime_matrimonial1_a: dossiernotaire.regime_matrimonial1_a,
      societe1_a: dossiernotaire.societe1_a,
      tel1_a: dossiernotaire.tel1_a,
      Message:"Donnée propriété",
      Substitution_properties: dossiernotaire.Substitution_properties,
      banque_properties: dossiernotaire.banque_properties,
      carte_conseiller_properties: dossiernotaire.carte_conseiller_properties,
      charge_properties: dossiernotaire.charge_properties.charge_properties,
      charge_vision_r_properties: dossiernotaire.charge_vision_r_properties,
      code_postal_properties: dossiernotaire.code_postal_properties,
      conseiller_properties: dossiernotaire.conseiller_properties,
      date_mandat_properties: dossiernotaire.date_mandat_properties,
      duree_properties: dossiernotaire.duree_properties








    }
  })
}
