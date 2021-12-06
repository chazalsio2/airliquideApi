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
        societe,
        client_vision_r,
        adresse,
        Mail,
        contactId,
        phone,
        date_lieu,
        cp_ville,
        nationalite,
        profession,
        regime_matrimonial
      } = req.body;
  
      if (
        !client_vision_r||
        !adresse||
        !Mail||
        !contactId||
        !phone||
        !date_lieu||
        !cp_ville||
        !nationalite||
        !profession||
        !regime_matrimonial) {
          throw new Error("Missing fields");
      }
  
      const contact = await Contact.findById(
        contactId
      ).lean();
  
      if (!contact) {
        throw new Error("Contact not found");
      }
  
      const DossierNotaireData = {
        societe,
        client_vision_r,
        adresse,
        Mail,
        contactId,
        phone,
        date_lieu,
        cp_ville,
        nationalite,
        profession,
        regime_matrimonial
      };
      
      const dossiernotaire = await new DossierNotaire(DossierNotaireData).save();

      console.log(dossiernotaire._id);
         await Project.updateOne(
          { _id: projectId },
          { $set: { dossiernotaireId: dossiernotaire._id } }
        ).exec();
      return res.json({ success: true,data: { completed: true } });
    } catch (e) {
      next(generateError(e.message));
    }
  }

export async function editDossierNotaire(req, res, next) {
  
  try {

    const modifier = req.body;
    console.log(modifier);
    const {
      contactClientId,
      societe1_a,
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
  }
}
export async function editFinaleDossierNotaire(req, res, next) {
  
  try {

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

  if ( !propertiesId || !code_postal_properties ) {
    return next(generateError("Cannot update some fields", 403));
  }
  const { dossiernotaireId } = req.params;
  console.log(dossiernotaireId);
  const contact = await DossierNotaire.updateOne(
    { _id: dossiernotaireId },
    { $set: modifier },
  ).exec();

   sendNewDosiierNtaire(dossiernotaireId);

  return res.json({ success: true, data: contact });

  } catch (error) {
    next(generateError(e.message));
  }
}