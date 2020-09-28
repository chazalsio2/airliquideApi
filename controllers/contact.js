import _, { isArray } from "underscore";

import ContactCategory from "../models/ContactCategory";
import Contact from "../models/Contact";
import { generateError } from "../lib/utils";

export async function getContacts(req, res, next) {
  try {
    const { contactCategoryId } = req.params;

    if (contactCategoryId) {
      const contactCategory = await ContactCategory.findById(
        contactCategoryId
      ).lean();

      if (!contactCategory) {
        throw new Error("Contact category not found");
      }
      const isAuthorized =
        isAdmin(req.user) ||
        _.some(
          req.user.roles,
          (role) => contactCategory.roles.indexOf(role) !== -1
        );

      if (!isAuthorized) {
        throw new Error("Not authorized");
      }

      const contacts = await Contact.find({ contactCategoryId }).lean();

      return res.json({ success: true, data: contacts });
    }

    // withoutCategoryId

    return res.json({ success: true, data: client });
  } catch (e) {
    next(generateError(e.message));
  }
}
