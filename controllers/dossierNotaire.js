import _ from "underscore";
import Project from "../models/Project";
import DossierNotaire from "../models/DossierNotaire"
import { allowedRoles } from "../models/User";
import Contact from "../models/Contact";
import { generateError, isAdmin, isAdminOrCommercial } from "../lib/utils";

export async function createDossierNotaire(req, res, next) {
    try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).lean();
    if (!project) {
      return next(generateError("Project not found", 404));
    }


      const {
        societe,
        vendeur,
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
        !societe||
        !vendeur||
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
        vendeur,
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
      console.log(projectId);
      
      const dossiernotaire = await new DossierNotaire(DossierNotaireData).save();
      console.log(dossiernotaire._id);
         await Project.updateOne(
          { _id: projectId },
          { $set: { dossiernotaireId: dossiernotaire._id } }
        ).exec();
  
      await DossierNotaire.updateOne({ _id: dossiernotaire._id }).exec();
  
  
       


      /* if (["search"].indexOf(serviceType) !== -1) {
        const project = await Project({
          clientId: client,
          type: serviceType,
        }).save();*/
  

      return res.json({ success: true,data: { completed: true } });
    } catch (e) {
      next(generateError(e.message));
    }
  }