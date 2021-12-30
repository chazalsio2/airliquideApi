import axios from 'axios'
import moment from 'moment'
import { getProject, getContact,getProperty } from './project.service'
import { getClient } from './client.service'
import { getUser } from './user.service'
import { getDocument } from './document.service'
import { Client } from '../models'
import {DossierNotaire} from '../models'
import {Property} from '../models'


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


export async function sendNewClientWebhook(projectId) {
  const project = await getProject(projectId)
  const client = await getClient(project.clientId)
  axios({
    method: 'POST',
    url: process.env.ZAPPIER_TEST_WEBHOOK_URL,
    data:{
      clientName: client.lastname,
      clientFirstName: client.firstname,
      clientEmail: client.email,
      typeProject: project.type,

    }
  })
}

export async function sendNewDosiierNtaire(dossiernotaireId){
  console.log(dossiernotaireId);
  const dossiernotaire = await DossierNotaire.findById(dossiernotaireId)
  const contact = await getContact(dossiernotaire.contactId)
  const contact_client = await getContact(dossiernotaire.contactClientId)
  const project = await getProject(dossiernotaire.projectId)
  const client = await getClient(project.clientId)
  const properties = await getProperty(dossiernotaire.propertiesId)
  axios({
    method: 'POST',
    url: process.env.ZAPPIER_WEBHOOK_DOSSIER_NOTAIRE,
    data:{
      MESSAGE:'Donnée client vision_r',
      societe: dossiernotaire.societe,
      client_vision_r: dossiernotaire.client_vision_r,
      conjoint_client_vision_r: client.spouse.firstname + ' ' + client.spouse.lastname,
      conjoint_Mail_vision_r : client.spouse.email,
      conjoint_revenu_vision_r : client.spouse.income,
      conjoint_industry_vision_r : client.spouse.industry,
      conjoint_phone_vision_r : client.spouse.phone,
      conjoint_address_vision_r : client.spouse.address,
      conjoint_seniority_vision_r : client.spouse.seniority,
      conjoint_situation_vision_r : client.spouse.situation,
      adresse: dossiernotaire.adresse,
      Mail: dossiernotaire.Mail,
      nom_prenon_contact_client_vision_r: contact.firstname+' '+contact.lastname,
      num_contact_client_vision_r: contact.phone,
      description_contact_client_vision_r: contact.description,
      adress_contact_client_vision_r : contact.address,
      email_contact_client_vision_r : contact.email,
      phone_client_vision_r: dossiernotaire.phone,
      date_lieu: dossiernotaire.date_lieu,
      cp_ville: dossiernotaire.cp_ville,
      nationalite: dossiernotaire.nationalite,
      profession: dossiernotaire.profession,
      regime_matrimonial: dossiernotaire.regime_matrimonial,
      ref_cadastrales_properties: dossiernotaire.ref_cadastrales_properties,
      MESSAGE2:'Donnée acheteur ou vendeur hors vision_r',
      adresse1_a: dossiernotaire.adresse1_a,
      //nom_prenon_contact: contact2.firstname+' '+contact2.lastname,
      cp_ville1_a: dossiernotaire.cp_ville1_a,
      date_lieu_naissance1_a: dossiernotaire.date_lieu_naissance1_a,
      date_regime1_a: dossiernotaire.date_regime1_a,
      mail1_a: dossiernotaire.mail1_a,
      mail1_conjoint: dossiernotaire.mail1_c,
      cp_ville1_conj: dossiernotaire.cp_ville1_conj,
      date_lieu_naissance1_conj: dossiernotaire.date_lieu_naissance1_conj,
      Adress_conj:dossiernotaire.Adress_conj,
      societe_conj:dossiernotaire.societe_conj,
      res_conj:dossiernotaire.res_conj,
      nationalite_conj:dossiernotaire.nationalite_conj,
      nom_prenon_contact_client_hors_vision_r: contact_client.firstname+' '+contact_client.lastname,
      nationalite1_a: dossiernotaire.nationalite1_a,
      nom1_client_hors_vision_r: dossiernotaire.nom1_a,
      prenom1_a_client_hors_vision_r: dossiernotaire.prenom1_a,
      profession1_a: dossiernotaire.profession1_a,
      regime_matrimonial1_a: dossiernotaire.regime_matrimonial1_a,
      societe1_a: dossiernotaire.societe1_a,
      tel1_a: dossiernotaire.tel1_a,
      res_fiscale1_a:dossiernotaire.res_fiscale1_a,
      nom_prenom_c:dossiernotaire.nom_prenom_c,
      Message3:"Donnée propriété",
      prix_net_properties: dossiernotaire.prix_net_properties,
      mobilier_p_properties:dossiernotaire.mobilier_p_properties,
      banque_properties: dossiernotaire.banque_properties,
      carte_conseiller_properties: dossiernotaire.carte_conseiller_properties,
      honoraires_Acquéreur_properties: dossiernotaire.honoraires_Acquéreur_properties,
      charge_Acquéreur_properties: dossiernotaire.charge_Acquéreur_properties,
      frais_notaires_properties: dossiernotaire.frais_notaires_properties,
      type_acquisition_properties: dossiernotaire.type_acquisition_properties,
      montant_properties: dossiernotaire.montant_properties,
      taux_properties:dossiernotaire.taux_properties,
      occupation_properties:dossiernotaire.occupation_properties,
      Substitution_properties:dossiernotaire.Substitution_properties,
      num_mandat_properties:dossiernotaire.num_mandat_properties,
      montant_depot_garantie_properties:dossiernotaire.montant_depot_garantie_properties,
      charges_Vendeur_properties: dossiernotaire.charges_Vendeur_properties,
      Honoraires_Vendeur_properties: dossiernotaire.Honoraires_Vendeur_properties,
      code_postal_properties: dossiernotaire.code_postal_properties,
      conseiller_properties: dossiernotaire.conseiller_properties,
      date_mandat_properties: dossiernotaire.date_mandat_properties,
      duree_properties: dossiernotaire.duree_properties,
      num1_a :dossiernotaire.num1_a,
      email_conseiller_properties:dossiernotaire.email_conseiller_properties,
      tel_conseiller_properties:dossiernotaire.tel_conseiller_properties,
      mandant_properties:dossiernotaire.mandant_properties,
      pieces_transmises: dossiernotaire.pieces_transmises
    }
  })
}

export async function sendNewDProprieteWebhook(propertyId) {
  console.log(propertyId,"  hello");
  const proprietes = await Property.findById(propertyId)
  axios({
    method:'GET',
    url: process.env.ZAPPIER_WEBHOOK_PROPRIETE,
    data:{
      titre:`${proprietes.type || ""} ${proprietes.livingArea ? proprietes.livingArea+" m²" : ""}  ${proprietes.city || ""} ${proprietes.landArea ? proprietes.landArea+ " m²" : ""}`,
      description:proprietes.description,
      ref:proprietes.ref,
      propertyStatus:proprietes.propertyStatus,
      salesPrice:proprietes.salesPrice,
      landArea: proprietes.landArea,
      livingArea:proprietes.livingArea,
      varangueArea:proprietes.varangueArea,
      photos:proprietes.photos,
      type:proprietes.type,
      virtualVisitLink:proprietes.virtualVisitLink,
      yearOfConstruction:proprietes.yearOfConstruction,
      city:proprietes.city,
      address:proprietes.address,
      roomDescription:proprietes.roomDescription,
      kitchenArea:proprietes.kitchenArea,
      bathroomArea:proprietes.bathroomArea,
      numberOfRooms:proprietes.numberOfRooms,
      floor:proprietes.floor,
      outdoorParking:proprietes.outdoorParking,
      coveredParking:proprietes.coveredParking,
      swimmingPool:proprietes.swimmingPool,
      secureEntrance:proprietes.secureEntrance,
      intercom:proprietes.intercom,
      view:proprietes.view,
      sanitation:proprietes.sanitation,
      doubleGlazing:proprietes.doubleGlazing,
      electricRollerShutters:proprietes.electricRollerShutters,
      hotWater:proprietes.hotWater,
      airConditioner:proprietes.airConditioner,
      equippedKitchen:proprietes.equippedKitchen,
      // DPE,
      numberOfCoOwnershipLots:proprietes.numberOfCoOwnershipLots,
      procedureInProgress:proprietes.procedureInProgress,
      freeOfOccupation:proprietes.freeOfOccupation,
      typeOfInvestment:proprietes.typeOfInvestment,
      rent:proprietes.rent,
      coOwnershipCharge:proprietes.coOwnershipCharge,
      assurancePNO:proprietes.assurancePNO,
      propertyTax:proprietes.propertyTax,
      accounting:proprietes.accounting,
      cga:proprietes.cga,
      divers:proprietes.divers,
      notaryFees:proprietes.notaryFees,
      visionRFees:proprietes.visionRFees,
      works:proprietes.works,
      financialExpense:proprietes.financialExpense,
      equipment:proprietes.equipment,
      agencyFees:proprietes.agencyFees
    }
  })
}
