import _ from "underscore";
import Project from "../models/Project";
import DossierNotaire from "../models/DossierNotaire"
import { allowedRoles } from "../models/User";
import Contact from "../models/Contact";
import { generateError, isAdmin, isAdminOrCommercial } from "../lib/utils";
import {sendNewDosiierNtaire} from '../services/webhook.service';

export async function createDossierNotaire(req, res, next) {
    try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).lean();
    if (!project) {
      return next(generateError("Project not found", 404));
    }


      const {
        societe1_a,
        societe1_v,
        client_vision_r,
        adresse,
        Mail,
        contact_v_Id,
        contact_a_Id,
        phone,
        date_lieu,
        cp_ville,
        pieces_transmises,
        nationalite,
        date_regime_matrimonial,
        res_fiscale1,
        nom2_,
        prenom2_,
        adresse2_,
        profession,
        regime_matrimonial,
        propertiesId,
        code_postal_properties,
        ref_cadastrales_properties,
        prix_net_properties,
        mobilier_p_properties,
        Honoraires_Vendeur_properties,
        charges_Vendeur_properties,
        honoraires_Acquéreur_properties,
        charge_Acquéreur_properties,
        frais_notaires_properties,
        montant_depot_garantie_properties,
        type_acquisition_properties,
        banque_properties,
        montant_properties,
        cp_ville1_conj,
        taux_properties,
        duree_properties,
        occupation_properties,
        Substitution_properties,
        num_mandat_properties,
        date_mandat_properties,
        mandant_properties,
        conseiller_properties,
        tel_conseiller_properties,
        email_conseiller_properties,
        carte_conseiller_properties,
        contactClientId,
        nom1_a,
        prenom1_a,
        profession1_conj,
        adresse1_a,
        nationalite_conj,
        res_fiscale2,
        date_lieu_naissance1_conj,
        mail1_a,
        mail2_,
        num_tel2_,
        Adress_conj,
        lieux_naissance,
        societe2_v,
        societe2_a,
        etat_occupation_b,
        nom_c,
        lieux_naissance_conj,
        cp_ville2_,
        profession2_,
        societe_conj,
        res_conj,
        cp_ville1_a,
        date_lieu_naissance1_a,
        nationalite1_a,
        profession1_a,
        regime_matrimonial1_a,
        date_regime1_a,
        nationalite2_,
        tel1_a,
        mail1_c,
        num1_a,
        res_fiscale1_a,
        nom_prenom_c
      } = req.body;
  
      if (
        //!contact_a_Id||
        !contact_v_Id||
        !client_vision_r||
        !adresse||
        !Mail||
        !phone||
        !date_lieu||
        !cp_ville||
        !nationalite||
        !profession||
        !res_fiscale1||
        !propertiesId||
        !adresse||
        !Mail||
        !contact_v_Id||
        !phone
        ) {
          throw new Error("Champs manquants");
      }
  
      const contact = await Contact.findById(
        contact_v_Id,contact_a_Id
      ).lean();
  
      if (!contact) {
        throw new Error("Contact not found");
      }
  
      const DossierNotaireData = {
        societe1_a,
        societe1_v,
        nom_c,
        etat_occupation_b,
        client_vision_r,
        adresse,
        Mail,
        contact_v_Id,
        date_regime_matrimonial,
        contact_a_Id,
        phone,
        res_fiscale1,
        lieux_naissance,
        profession1_conj,
        societe2_v,
        societe2_a,
        res_fiscale2,
        date_lieu,
        nom2_,
        adresse2_,
        prenom2_,
        mail2_,
        cp_ville,
        num_tel2_,
        nationalite,
        nationalite2_,
        cp_ville2_,
        profession2_,
        profession,
        regime_matrimonial,
        propertiesId,
        code_postal_properties,
        ref_cadastrales_properties,
        cp_ville1_conj,
        date_lieu_naissance1_conj,
        Adress_conj,
        societe_conj,
        res_conj,
        nationalite_conj,
        pieces_transmises,
        prix_net_properties,
        mobilier_p_properties,
        Honoraires_Vendeur_properties,
        charges_Vendeur_properties,
        honoraires_Acquéreur_properties,
        charge_Acquéreur_properties,
        frais_notaires_properties,
        montant_depot_garantie_properties,
        type_acquisition_properties,
        banque_properties,
        montant_properties,
        taux_properties,
        duree_properties,
        occupation_properties,
        Substitution_properties,
        num_mandat_properties,
        date_mandat_properties,
        num1_a,
        mandant_properties,
        conseiller_properties,
        tel_conseiller_properties,
        email_conseiller_properties,
        carte_conseiller_properties,
        contactClientId,
        nom1_a,
        lieux_naissance_conj,
        prenom1_a,
        adresse1_a,
        mail1_a,
        cp_ville1_a,
        date_lieu_naissance1_a,
        nationalite1_a,
        profession1_a,
        regime_matrimonial1_a,
        date_regime1_a,
        tel1_a,
        mail1_c,
        res_fiscale1_a,
        nom_prenom_c,
      };
      
      const dossiernotaire = await new DossierNotaire(DossierNotaireData).save();

      console.log(dossiernotaire._id);
         await Project.updateOne(
          { _id: projectId },
          { $set: { dossiernotaireId: dossiernotaire._id } }
        ).exec();


         await DossierNotaire.updateOne(
           { _id: dossiernotaire._id },
           { $set: { projectId: projectId }}
         )
          //sendNewDosiierNtaire(dossiernotaire._id);

      return res.json({ success: true,data: { completed: true } });
    } catch (e) {
      next(generateError(e.message));
    }
  }

export async function editDossierNotaire(req, res, next) {
  
/*  try {

    const modifier = req.body;
    console.log(modifier);
    const {
      contactClientId,
      nom1_a,
      prenom1_a,
      adresse1_a,
      mail1_a,
      cp_ville1_a,
      date_lieu_naissance1_a,
      nationalite1_a,
      profession1_a,
      regime_matrimonial1_a,
      date_regime1_a,
      tel1_a,
      mail1_c,
      res_fiscale1_a

    } = modifier;

  if ( !contactClientId ) {
    return next(generateError("Cannot update some fields", 403));
  }
  const { dossiernotaireId } = req.params;
  console.log(dossiernotaireId);
  const contact = await DossierNotaire.updateOne(
    { _id: dossiernotaireId },
    { $set: modifier },
  ).exec();

  return res.json({ success: true, data: contact });

  } catch (error) {
    next(generateError(e.message));
  }*/
}
export async function editFinaleDossierNotaire(req, res, next) {
  
 /* try {

    const modifier = req.body;
    console.log(modifier);
    const {
      propertiesId,
      code_postal_properties,
      ref_cadastrales_properties,
      prix_net_properties,
      mobilier_p_properties,
      Honoraires_Vendeur_properties,
      charges_Vendeur_properties,
      honoraires_Acquéreur_properties,
      charge_Acquéreur_properties,
      frais_notaires_properties,
      montant_depot_garantie_properties,
      type_acquisition_properties,
      banque_properties,
      montant_properties,
      taux_properties,
      duree_properties,
      occupation_properties,
      Substitution_properties,
      num_mandat_properties,
      date_mandat_properties,
      mandant_properties,
      conseiller_properties,
      tel_conseiller_properties,
      email_conseiller_properties,
      carte_conseiller_properties

    } = modifier;

  if ( !propertiesId ) {
    return next(generateError("Cannot update some fields", 403));
  }
  const { dossiernotaireId } = req.params;
  console.log(dossiernotaireId);
  const contact = await DossierNotaire.updateOne(
    { _id: dossiernotaireId },
    { $set: modifier },
  ).exec();


  return res.json({ success: true, data: contact });

  } catch (error) {
    next(generateError(e.message));
  }*/
}