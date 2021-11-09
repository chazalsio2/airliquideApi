import _ from "underscore";

import ContactCategory from "../models/ContactCategory";
import DossierNotaire from "../models/DossierNotaire"
import { allowedRoles } from "../models/User";
import Contact from "../models/Contact";
import { generateError, isAdmin, isAdminOrCommercial } from "../lib/utils";

export async function createDossierNotaire(req, res, next) {
  console.log(req.body);
    try {
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
  
      await new DossierNotaire({
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
      }).save();
  
      return res.json({ success: true });
    } catch (e) {
      next(generateError(e.message));
    }
  }