import axios from 'axios'
import moment from 'moment'
import { getProject, getContact,getProperty } from './project.service'
import { getClient } from './client.service'
import { getUser } from './user.service'
import { getDocument } from './document.service'
import { Client } from '../models'
import {DossierNotaire} from '../models'
import {Property,Project,Document,User} from '../models'


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
  console.log(dossiernotaireId.date_regime_matrimonial);
  const dossiernotaire = await DossierNotaire.findById(dossiernotaireId)
  const contact_v = await getContact(dossiernotaire.contact_v_Id)
  const contact_a = await getContact(dossiernotaire.contact_a_Id)
  const project = await getProject(dossiernotaire.projectId)
  const client = await getClient(project.clientId)
  const properties = await getProperty(dossiernotaire.propertiesId)
  const pieces_transmises = dossiernotaire.pieces_transmises;

    const piece = dossiernotaire.pieces_transmises.sort();
    //console.log(pieces_transmises.contains());
   const pieces_transmises_1 = piece[1];
   const pieces_transmises_2 = piece[2];
    console.log("1" + ":" +  pieces_transmises_1);
    console.log("2" + ":" + pieces_transmises_2);

    const conversionEUR = (number) => {
      const conversion = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
      }).format(number)
      return conversion; 
    }

    const conversionPercent = (number) => {
      const conversion = new Intl.NumberFormat('fr-FR', {
        style: 'unit',
        unit: 'percent',
      }).format(number)
      return conversion; 
    }

  if(project.type === "sales"){
    axios({
      method: 'POST',
      url: process.env.ZAPPIER_WEBHOOK_DOSSIER_NOTAIRE,
      data:{
        nom_n_v: contact_v.lastname,
        prenom_n_v:contact_v.firstname,
        tel_n_v: contact_v.phone,
        description_n_v: contact_v.description,
        adresse_n_v : contact_v.address,
        mail_n_v : contact_v.email,
        societe1_v: dossiernotaire.societe1_v,
        societe2_v : dossiernotaire.societe2_,
        nom1_v: client.lastname,
        nom2_v: dossiernotaire.nom2_,
        prenom1_v:client.firstname,
        prenom2_v:dossiernotaire.prenom2_,
        adresse1_v:dossiernotaire.adresse,
        adresse2_v: dossiernotaire.adresse2_,
        mail1_v:dossiernotaire.Mail,
        mail2_v:dossiernotaire.mail2_,
        num_tel1_v:dossiernotaire.phone,
        num_tel2_v:dossiernotaire.num_tel2_,
        date_lieu_naissance1_v:dossiernotaire.date_lieu,
        date_lieu_naissance2_v:dossiernotaire.date_lieu_naissance2_,
        cp_ville1_v:dossiernotaire.cp_ville,
        cp_ville2_v:dossiernotaire.cp_ville2_,
        nationalite1_v:dossiernotaire.nationalite,
        nationalite2_v:dossiernotaire.nationalite2_,
        profession1_v:dossiernotaire.profession,
        profession2_v:dossiernotaire.profession2_,
        /////////////////////////////////////////////////////////////////////////////////////////////////////
        /*regime_matrimonial1_v:`${ client.situation === "single" && ("Célibataire")||
                                  client.situation === "married" && ("Couple vivant maritalement")||
                                  client.situation === "separationofproperty" && ("Couple séparation des biens")||
                                  client.situation === "legalcommunity" && ("Couple communauté légale réduite aux acquêts")||
                                  client.situation === "jointpossession" && ("Indivision")||
                                  client.situation === "company" && ("Société")}`, */
        /*regime_matrimonial2_v:`${client.spouse.situation === "single" && ("Célibataire")||
                              client.spouse.situation === "married" && ("Couple vivant maritalement")||
                              client.spouse.situation === "separationofproperty" && ("Couple séparation des biens")||
                              client.spouse.situation === "legalcommunity" && ("Couple communauté légale réduite aux acquêts")||
                              client.spouse.situation === "jointpossession" && ("Indivision")||
                              client.spouse.situation === "company" && ("Société")}`,*/
        regime_matrimonial1_v:dossiernotaire.regime_matrimonial,
        regime_matrimonial2_v:`${dossiernotaire.prenom2_ && (dossiernotaire.regime_matrimonial)||""}`,
        date_regime1_v:`${dossiernotaire.date_regime_matrimonial && (moment(dossiernotaire.date_regime_matrimonial).format("DD/MM/YYYY"))||""}`,
        date_regime2_v:`${dossiernotaire.date_regime_matrimonial && (moment(dossiernotaire.date_regime_matrimonial).format("DD/MM/YYYY"))||""}`,
        res_fiscale1_v:dossiernotaire.res_fiscale1,
        res_fiscale2_v:dossiernotaire.res_fiscale2,
        //////////////////////////////////////////////////////////
        nom_n_a: contact_a.lastname,
        prenom_n_a:contact_a.firstname,
        tel_n_a: contact_a.phone,
        description_n_a: contact_a.description,
        adresse_n_a: contact_a.address,
        mail_n_a: contact_a.email,
        societe1_a: dossiernotaire.societe1_a,
        societe2_a : dossiernotaire.societe_conj,
        nom1_a: dossiernotaire.nom1_a,
        nom2_a: dossiernotaire.nom_c,
        prenom1_a:dossiernotaire.prenom1_a,
        prenom2_a:dossiernotaire.nom_prenom_c,
        adresse1_a:dossiernotaire.adresse1_a,
        adresse2_a: dossiernotaire.Adress_conj,
        mail1_a:dossiernotaire.mail1_a,
        mail2_a:dossiernotaire.mail1_c,
        cp_ville1_a:dossiernotaire.cp_ville1_a,
        cp_ville2_a:dossiernotaire.cp_ville1_conj,
        date_lieu_naissance1_a:dossiernotaire.date_lieu_naissance1_a||"",
        date_lieu_naissance2_a:`${dossiernotaire.date_lieu_naissance1_conj ? (moment(dossiernotaire.date_lieu_naissance1_conj).format("DD/MM/YYYY")+"  "+dossiernotaire.lieux_naissance_conj):("")}`,
        nationalite1_a:dossiernotaire.nationalite1_a,
        nationalite2_a:dossiernotaire.nationalite_conj,
        profession1_a:dossiernotaire.profession1_a,
        profession2_a:dossiernotaire.profession1_conj,
        regime_matrimonial1_a:dossiernotaire.regime_matrimonial1_a||"",
        regime_matrimonial2_a:`${dossiernotaire.nom_c && (dossiernotaire.regime_matrimonial1_a)||""}`,
        date_regime1_a:`${ dossiernotaire.date_regime_matrimonial && ( moment(dossiernotaire.date_regime_matrimonial).format("DD/MM/YYYY"))||""}`,
        date_regime2_a:`${dossiernotaire.nom_c && ( moment(dossiernotaire.date_regime_matrimonial).format("DD/MM/YYYY"))||""}`,
        num_tel1_a:dossiernotaire.num1_a,
        num_tel2_a:dossiernotaire.tel1_a,
        res_fiscale1_a:dossiernotaire.res_fiscale1_a,
        res_fiscale2_a:dossiernotaire.res_conj,
       /////////////////////////////////////////////////////////
        designation_b:`${properties.type === "apartment" && ("Appartement")||        
         properties.type === "commercial" && ("Local commercial")||
         properties.type === "construction_land" && ("Terrain de construction")||
         properties.type === "home" && ("Maison")||
         properties.type === "parking" && ("Parking / Garage")||
         properties.type === "building" && ("Immeuble")||properties.type}`,
         


        adresse_b: properties.address,
        code_postal_b: properties.city,
        commune_b:properties.city,
        ref_cadastrales_b: dossiernotaire.ref_cadastrales_properties,
        descriptif_b: properties.descriptif_b,
        etat_occupation_b: dossiernotaire.etat_occupation_b,
        nu_meuble_b: `${dossiernotaire.mobilier_p_properties > 0 ? ("meublé"):("nu")}`,
        prix_fai_p: conversionEUR(dossiernotaire.Prix_de_vente_FAI),
        prix_net_p: conversionEUR(dossiernotaire.prix_net_properties),
        mobilier_p: conversionEUR(dossiernotaire.mobilier_p_properties),
        honoraires_v_p: conversionEUR(dossiernotaire.Honoraires_Vendeur_properties),
        charge_v_p: dossiernotaire.charges_Vendeur_properties,
        honoraires_a_p: conversionEUR(dossiernotaire.honoraires_Acquéreur_properties),
        charges_a_p: dossiernotaire.charge_Acquéreur_properties,
        frais_notaires_p: conversionEUR(dossiernotaire.frais_notaires_properties),
        montant_depot_garantie_p:conversionEUR(dossiernotaire.montant_depot_garantie_properties),
        
        //prix_fai_p: properties.salesPrice,
        //prix_net_p: dossiernotaire.prix_net_properties,
        /*mobilier_p: dossiernotaire.mobilier_p_properties,
        honoraires_v_p: properties.visionRFees,
        charge_v_p: dossiernotaire.charges_Vendeur_properties,
        honoraires_a_p: dossiernotaire.honoraires_Acquéreur_properties,
        charges_a_p: dossiernotaire.charge_Acquéreur_properties,
        frais_notaires_p: dossiernotaire.frais_notaires_properties,
        montant_depot_garantie_p:dossiernotaire.montant_depot_garantie_properties,*/
        type_acquisition_p: dossiernotaire.type_acquisition_properties,
        banque_f: dossiernotaire.banque_properties,
        montant_f: conversionEUR(dossiernotaire.montant_properties),
        taux_f: conversionPercent(dossiernotaire.taux_properties),
        duree_f: dossiernotaire.duree_properties,
        occupation_cs:dossiernotaire.occupation_properties,
        substitution_cs:dossiernotaire.Substitution_properties,
        num_mandat:dossiernotaire.num_mandat_properties,
        date_mandat: moment(dossiernotaire.date_mandat_properties).format("DD/MM/YYYY")||"",
        mandant:"le vendeur",
        pieces_transmises_0: `${pieces_transmises[0] && ("")}`,
        entretien_x: `${pieces_transmises.includes("1_Carnet_d'entretien_de_l'immeuble") && ("Carnet_dentretien_de_limmeuble")}`,
        offre_achat_x: `${pieces_transmises.includes("2_Lettre_d'intention_d'achat") && ("Lettre_d'intention_d'achat")}`,
        sci_x: `${pieces_transmises.includes("3_Statuts_de_la_SCI") && ("Statuts_de_la_SCI")}`,
        convention_x: `${pieces_transmises.includes("4_Convention") && ("Convention le cas échéant (Anah...)")}`,
        diag_x: `${pieces_transmises.includes("5_Dossier_de_diagnostic_technique") && ("Dossier_de_diagnostic_technique")}`,
        taxe_fonciere_x: `${pieces_transmises.includes("6_Dernier_de_taxes") && ("Taxe foncière")}`,
        meuble_x: `${pieces_transmises.includes("7_liste_détaillée_et_chiffrée") && ("Equipement et mobiliers/décorations")}`,
        ag_x: `${pieces_transmises.includes("8_3_derniers_PV_d'AG") && ("3_derniers_PV_d'AG")}`,
        dtg_x: `${pieces_transmises.includes("9_Diagnostic_technique_global") && ("Diagnostic_technique_global")}`,
        reg_copro_x: `${pieces_transmises.includes("10_Reglement_de_copropriété") && ("Reglement de copropriété")}`,
        cni_x: `${pieces_transmises.includes("11_Carte_d'identité") && ("Carte d'identité acquéreur et/ou vendeur ")}`,
        bail_x: `${pieces_transmises.includes("12_Baux") && ("Baux si bien occupé")}`,      
        nom_conseiller:dossiernotaire.conseiller_properties,
        tel_conseiller:dossiernotaire.tel_conseiller_properties,
        mail_conseiller: dossiernotaire.email_conseiller_properties,
        carte_conseiller: dossiernotaire.carte_conseiller_properties,
        autre_condition: dossiernotaire.autre_condition,
////////////////////////////////////////////////
       /* nu_meuble_b_sanitation:properties.sanitation,
        nu_meuble_b_doubleGlazing: properties.doubleGlazing,
        nu_meuble_b_electricRollerShutters: properties.electricRollerShutters,
        nu_meuble_b_hotWater: properties.hotWater,
        nu_meuble_b_airConditioner: properties.airConditioner,
        nu_meuble_b_equippedKitchen: properties.equippedKitchen,
        nu_meuble_b_swimmingPool: properties.swimmingPool,
        nu_meuble_b_secureEntrance: properties.secureEntrance,
        nu_meuble_b_intercom: properties.intercom,
        mobilier_p:dossiernotaire.mobilier_p_properties,
        Honoraires_Vendeur_properties: dossiernotaire.Honoraires_Vendeur_properties,
        code_postal_properties: dossiernotaire.code_postal_properties,
        num1_a :dossiernotaire.num1_a,
        email_conseiller_properties:dossiernotaire.email_conseiller_properties,
        tel_conseiller_properties:dossiernotaire.tel_conseiller_properties,}*/
      }
    })
    console.log("cest bon ");
  } 
  if(project.type === "search"){
    axios({
      method: 'POST',
      url: process.env.ZAPPIER_WEBHOOK_DOSSIER_NOTAIRE,
      data:{
        nom_n_a: contact_a.lastname,
        prenom_n_a:contact_a.firstname,
        tel_n_a: contact_a.phone,
        description_n_a: contact_a.description,
        adresse_n_a : contact_a.address,
        mail_n_a : contact_a.email,
        societe1_a: dossiernotaire.societe1_v,
        societe2_a : dossiernotaire.societe2_,
        nom1_a: client.lastname,
        nom2_a: dossiernotaire.nom2_ &&(dossiernotaire.nom2_)||"",
        prenom1_a:client.firstname,
        prenom2_a:dossiernotaire.prenom2_  &&(dossiernotaire.prenom2_)||"",
        adresse1_a:dossiernotaire.adresse,
        adresse2_a: dossiernotaire.adresse2_  &&(dossiernotaire.adresse2_)||"",
        mail1_a:dossiernotaire.Mail,
        mail2_a:dossiernotaire.mail2_  &&(dossiernotaire.mail2_)||"",
        num_tel1_a:dossiernotaire.phone,
        num_tel2_a:dossiernotaire  &&(dossiernotaire.num_tel2_)||"",
        date_lieu_naissance1_a:`${dossiernotaire.date_lieu||""} `,
        date_lieu_naissance2_a:`${dossiernotaire.date_lieu_naissance2_ && (dossiernotaire.date_lieu_naissance2_)|| ""} `,
        cp_ville1_a:dossiernotaire.cp_ville,
        cp_ville2_a:`${dossiernotaire.cp_ville2_ && ( dossiernotaire.cp_ville2_)||""}`,
        nationalite1_a:dossiernotaire.nationalite,
        nationalite2_a:dossiernotaire.nationalite2_ &&(dossiernotaire.nationalite2_)||"",
        profession1_a:dossiernotaire.profession,
        profession2_a:dossiernotaire.profession2_ && (dossiernotaire.profession2_)||"",
        /*regime_matrimonial1_a:`${client.situation && ( client.situation === "single" && ("Célibataire")||
                                  client.situation === "married" && ("Couple vivant maritalement")||
                                  client.situation === "separationofproperty" && ("Couple séparation des biens")||
                                  client.situation === "legalcommunity" && ("Couple communauté légale réduite aux acquêts")||
                                  client.situation === "jointpossession" && ("Indivision")||
                                  client.situation === "company" && ("Société"))}`,
        regime_matrimonial2_a:`${client.situation.spouse && (  dossiernotaire.situation === "single" && ("Célibataire")||
                                  dossiernotaire.situation === "married" && ("Couple vivant maritalement")||
                                  dossiernotaire.situation === "separationofproperty" && ("Couple séparation des biens")||
                                  dossiernotaire.situation === "legalcommunity" && ("Couple communauté légale réduite aux acquêts")||
                                  dossiernotaire.situation === "jointpossession" && ("Indivision")||
                                  dossiernotaire.situation === "company" && ("Société"))||""}`,*/
        regime_matrimonial1_a:dossiernotaire.regime_matrimonial,
        regime_matrimonial2_a:dossiernotaire.regime_matrimonial,
        date_regime1_a:`${dossiernotaire.date_regime_matrimonial && ( moment(dossiernotaire.date_regime_matrimonial).format("DD/MM/YYYY"))||""}`,
        date_regime2_a:`${dossiernotaire.date_regime_matrimonial && ( moment(dossiernotaire.date_regime_matrimonial).format("DD/MM/YYYY"))||""}`,
        res_fiscale1_a:dossiernotaire.res_fiscale1,
        res_fiscale2_a:dossiernotaire.res_fiscale2,
       //////////////////////////////////////////////////////////
       nom_n_v: contact_v.lastname,
       prenom_n_v:contact_v.firstname,
       tel_n_v: contact_v.phone,
       description_n_v: contact_v.description,
       adresse_n_v: contact_v.address,
       mail_n_v: contact_v.email,
       societe1_v: dossiernotaire.societe1_a,
       societe2_v : dossiernotaire.societe_conj,
       nom1_v: dossiernotaire.nom1_a,
       nom2_v: dossiernotaire.nom_c,
       prenom1_v:dossiernotaire.prenom1_a,
       prenom2_v:dossiernotaire.nom_prenom_c,
       adresse1_v:dossiernotaire.adresse1_a,
       adresse2_v: dossiernotaire.Adress_conj,
       mail1_v:dossiernotaire.mail1_a,
       mail2_v:dossiernotaire.mail1_c,
       cp_ville1_v:dossiernotaire.cp_ville1_a,
       cp_ville2_v:dossiernotaire.cp_ville1_conj,
       date_lieu_naissance1_v:`${dossiernotaire.date_lieu_naissance1_a && (dossiernotaire.date_lieu_naissance1_a)|| ""}`,
       date_lieu_naissance2_v:`${dossiernotaire.date_lieu_naissance1_conj && (moment(dossiernotaire.date_lieu_naissance1_conj).format("DD/MM/YYYY"))||""}`+"  "+`${dossiernotaire.lieux_naissance_conj && (dossiernotaire.lieux_naissance_conj)||""}`,
       nationalite1_v:dossiernotaire.nationalite1_a,
       nationalite2_v:dossiernotaire.nationalite_conj,
       profession1_v:dossiernotaire.profession1_a,
       profession2_v:dossiernotaire.profession1_conj,
       regime_matrimonial1_v:dossiernotaire.regime_matrimonial1_a,
       regime_matrimonial2_v:`${dossiernotaire.nom_c &&  (dossiernotaire.regime_matrimonial1_a)||""}`,
       date_regime1_v:`${dossiernotaire.date_regime1_a && (moment(dossiernotaire.date_regime1_a).format("DD/MM/YYYY"))||""}`,
       date_regime2_v:`${dossiernotaire.nom_c && (moment(dossiernotaire.date_regime1_a).format("DD/MM/YYYY"))||""}`,
       num_tel1_v:dossiernotaire.num1_a,
       num_tel2_v:dossiernotaire.tel1_a,
       res_fiscale1_v:dossiernotaire.res_fiscale1_a,
       res_fiscale2_v:dossiernotaire.res_conj,
       /////////////////////////////////////////////////////////
       designation_b:`${properties.type === "apartment" && ("Appartement")||
         properties.type === "commercial" && ("Local commercial")||
         properties.type === "construction_land" && ("Terrain de construction")||
         properties.type === "home" && ("Maison")||
         properties.type === "parking" && ("Parking / Garage")||
         properties.type === "building" && ("Immeuble")||properties.type}`,
       adresse_b: properties.address,
       code_postal_b: properties.city,
       commune_b:properties.city,
       ref_cadastrales_b: dossiernotaire.ref_cadastrales_properties,
       descriptif_b: properties.description,
       etat_occupation_b: dossiernotaire.etat_occupation_b,
       nu_meuble_b: `${dossiernotaire.mobilier_p_properties > 0 ? ("meublé"):("nu")}`,
       prix_fai_p: conversionEUR(dossiernotaire.Prix_de_vente_FAI),
       prix_net_p: conversionEUR(dossiernotaire.prix_net_properties),
       mobilier_p:conversionEUR(dossiernotaire.mobilier_p_properties),
       honoraires_v_p: conversionEUR(dossiernotaire.Honoraires_Vendeur_properties),
       charge_v_p: dossiernotaire.charges_Vendeur_properties,
       honoraires_a_p: conversionEUR(dossiernotaire.honoraires_Acquéreur_properties),
       charges_a_p: dossiernotaire.charge_Acquéreur_properties,
       frais_notaires_p: conversionEUR(dossiernotaire.frais_notaires_properties),
       montant_depot_garantie_p:conversionEUR(dossiernotaire.montant_depot_garantie_properties),
       //prix_fai_p: properties.salesPrice,
       //prix_net_p: dossiernotaire.prix_net_properties,
       /*mobilier_p:dossiernotaire.mobilier_p_properties,
       honoraires_v_p: properties.visionRFees,
       charge_v_p: dossiernotaire.charges_Vendeur_properties,
       honoraires_a_p: dossiernotaire.honoraires_Acquéreur_properties,
       charges_a_p: dossiernotaire.charge_Acquéreur_properties,
       frais_notaires_p: dossiernotaire.frais_notaires_properties,
       montant_depot_garantie_p:dossiernotaire.montant_depot_garantie_properties,*/
       type_acquisition_p: dossiernotaire.type_acquisition_properties,
       banque_f: dossiernotaire.banque_properties,
       montant_f: conversionEUR(dossiernotaire.montant_properties),
       taux_f: conversionPercent(dossiernotaire.taux_properties),
       duree_f: dossiernotaire.duree_properties,
       occupation_cs:dossiernotaire.occupation_properties,
       substitution_cs:dossiernotaire.Substitution_properties,
       num_mandat:dossiernotaire.num_mandat_properties,
       date_mandat: `${moment(dossiernotaire.date_mandat_properties).format("DD/MM/YYYY")||""}`,
       mandant:"l'acheteur",
       pieces_transmises_0: `${pieces_transmises[0] && ("")}`,
       entretien_x: `${pieces_transmises.includes("1_Carnet_d'entretien_de_l'immeuble") && ("Carnet_dentretien_de_limmeuble")}`,
       offre_achat_x: `${pieces_transmises.includes("2_Lettre_d'intention_d'achat") && ("Lettre_d'intention_d'achat")}`,
       sci_x: `${pieces_transmises.includes("3_Statuts_de_la_SCI") && ("Statuts_de_la_SCI")}`,
       convention_x: `${pieces_transmises.includes("4_Convention") && ("Convention le cas échéant (Anah...)")}`,
       diag_x: `${pieces_transmises.includes("5_Dossier_de_diagnostic_technique") && ("Dossier_de_diagnostic_technique")}`,
       taxe_fonciere_x: `${pieces_transmises.includes("6_Dernier_de_taxes") && ("Taxe foncière")}`,
       meuble_x: `${pieces_transmises.includes("7_liste_détaillée_et_chiffrée") && ("Equipement et mobiliers/décorations")}`,
       ag_x: `${pieces_transmises.includes("8_3_derniers_PV_d'AG") && ("3_derniers_PV_d'AG")}`,
       dtg_x: `${pieces_transmises.includes("9_Diagnostic_technique_global") && ("Diagnostic_technique_global")}`,
       reg_copro_x: `${pieces_transmises.includes("10_Reglement_de_copropriété") && ("Reglement de copropriété")}`,
       cni_x: `${pieces_transmises.includes("11_Carte_d'identité") && ("Carte d'identité acquéreur et/ou vendeur ")}`,
       bail_x: `${pieces_transmises.includes("12_Baux") && ("Baux si bien occupé")}`,
       nom_conseiller:dossiernotaire.conseiller_properties,
       tel_conseiller:dossiernotaire.tel_conseiller_properties,
       mail_conseiller: dossiernotaire.email_conseiller_properties,
       carte_conseiller: dossiernotaire.carte_conseiller_properties,
       autre_condition: dossiernotaire.autre_condition,
////////////////////////////////////////////////
       /* nu_meuble_b_sanitation:properties.sanitation,
        nu_meuble_b_doubleGlazing: properties.doubleGlazing,
        nu_meuble_b_electricRollerShutters: properties.electricRollerShutters,
        nu_meuble_b_hotWater: properties.hotWater,
        nu_meuble_b_airConditioner: properties.airConditioner,
        nu_meuble_b_equippedKitchen: properties.equippedKitchen,
        nu_meuble_b_swimmingPool: properties.swimmingPool,
        nu_meuble_b_secureEntrance: properties.secureEntrance,
        nu_meuble_b_intercom: properties.intercom,
        mobilier_p:dossiernotaire.mobilier_p_properties,
        Honoraires_Vendeur_properties: dossiernotaire.Honoraires_Vendeur_properties,
        code_postal_properties: dossiernotaire.code_postal_properties,
        num1_a :dossiernotaire.num1_a,
        email_conseiller_properties:dossiernotaire.email_conseiller_properties,
        tel_conseiller_properties:dossiernotaire.tel_conseiller_properties,}*/
    }
  })
  console.log("cest bon ");
}}

export async function sendNewDProprieteWebhook(propertyId) {
  const proprietes = await Property.findById(propertyId)
  if(proprietes.propertyStatus ==="forsale"){
  axios({
    method:'GET',
    url: process.env.ZAPPIER_WEBHOOK_PROPRIETE,
    data:{
      titre: `${proprietes.type || ""} ${proprietes.livingArea ? proprietes.livingArea+" m²" : ""}  ${proprietes.city || ""} ${proprietes.landArea ? proprietes.landArea+ " m²" : ""}`,
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
}
//coucou
export async function sendNewStatusProject(project) {
  console.log(project);
  const projet = await Project.findById(project._id)
  const client = await Client.findById(project.clientId)
  const conseiller = await User.findById(project.commercialId)

  axios({
    method:'GET',
    url: process.env.ZAPPIER_WEBHOOK_CLE_DE_VIE,
    data:{
      num_id:projet._id,
      nom_clients:client.displayName,
      e_mail:client.email,
      statuts_affaires: projet.status,
      date_dernier_statut: moment(projet.updatedAt).format('DD/MM/YYYY'),
      type:projet.type,
      montant_commission:projet.commissionAmount ? (projet.commissionAmount/100):(""),
      commercial_poucentage:projet.commercialPourcentage ? (projet.commercialPourcentage/100):"",
      commercial_name:conseiller ? conseiller.displayName:"",
      lien_aws: `${projet.status === "wait_loan_offer_validation" &&( projet.loanOfferDoc.url)||
      projet.status === "wait_purchase_offer_validation" &&( projet.purchaseOfferDoc.url)||
      projet.status === "wait_sales_agreement_validation" &&( projet.salesAgreementDoc.url)||
      projet.status === "wait_sales_deed_validation" &&( projet.salesDeedDoc.url)||""}`,
  }})
  console.log("c'est bon");
}
export async function sendNewdocuments(document){
  console.log(document);
  const documents = await Document.findById(document._id)
  axios({
    method:'GET',
    url: process.env.ZAPPIER_WEBHOOK_DOCUMENTS,
    data:{
      idprojet:documents.projectId,
      libellé: documents.name,
      nature: documents.moment_cle,
      montant_HT:documents.montant_hors_taxes,
      montant_TTC:documents.montant_ttc,
      date : moment(documents.updatedAt).format('DD/MM/YYYY'),
      lien_AWS : documents.url
    }
  })
  console.log("c'est documents");
}