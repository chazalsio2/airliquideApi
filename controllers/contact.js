import _, { isArray } from "underscore";

import ContactCategory from "../models/ContactCategory";
import Contact from "../models/Contact";
import { generateError, isAdmin } from "../lib/utils";

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

    // without contactCategoryId

    if (isAdmin) {
      const contacts = await Contact.find({}).lean();
      return res.json({ success: true, data: contacts });
    }

    const authorizedContactCategories = await ContactCategory.find({
      roles: { $in: req.user.roles }
    }).lean();

    const contacts = await Contact.find({
      contactCategoryId: {
        $in: authorizedContactCategories.map((cc) => cc._id)
      }
    }).lean();
    return res.json({ success: true, data: contacts });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getContactCategories(req, res, next) {
  try {
    if (isAdmin) {
      const contactCategories = await ContactCategory.find({}).lean();
      return res.json({ success: true, data: contactCategories });
    }

    const authorizedContactCategories = await ContactCategory.find({
      roles: { $in: req.user.roles }
    }).lean();

    return res.json({ success: true, data: authorizedContactCategories });
  } catch (e) {
    next(generateError(e.message));
  }
}
