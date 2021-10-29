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
        contactId,
      } = req.body;
  
      if (!contactId) {
        throw new Error("Missing fields");
      }
  
      const contact = await Contact.findById(
        contactId
      ).lean();
  
      if (!contact) {
        throw new Error("Contact category not found");
      }
  
      await new Contact({
        contactId
      }).save();
  
      return res.json({ success: true });
    } catch (e) {
      next(generateError(e.message));
    }
  }