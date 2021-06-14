import _ from "underscore";

import ContactCategory from "../models/ContactCategory";
import { allowedRoles } from "../models/User";
import Contact from "../models/Contact";
import { generateError, isAdmin } from "../lib/utils";

export async function removeContact(req, res, next) {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findById(contactId).lean();

    if (!contact) {
      throw new Error("Contact not found", 404);
    }

    await Contact.deleteOne({ _id: contactId }).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

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

export async function createContact(req, res, next) {
  try {
    const {
      firstname,
      lastname,
      phone,
      contactCategoryId,
      description
    } = req.body;

    if (!firstname || !lastname || !phone || !contactCategoryId) {
      throw new Error("Missing fields 6");
      // throw new Error("Missing fields");
    }

    const contactCategory = await ContactCategory.findById(
      contactCategoryId
    ).lean();

    if (!contactCategory) {
      throw new Error("Contact category not found");
    }

    await new Contact({
      firstname,
      lastname,
      phone,
      contactCategoryId,
      description
    }).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function createContactCategory(req, res, next) {
  try {
    const { name, description, roles } = req.body;

    if (!name || !roles) {
      throw new Error("Missing fields 7");
      // throw new Error("Missing fields");
    }

    if (
      !roles.length ||
      !_.every(roles, (role) => allowedRoles.indexOf(role) !== -1)
    ) {
      throw new Error("Invalid roles");
    }

    await new ContactCategory({ name, description, roles }).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
