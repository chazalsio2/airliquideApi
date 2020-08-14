import _ from "underscore";

import { generateError } from "../lib/utils";
import Folder from "../models/Folder";

export async function getFolders(req, res, next) {
  try {
    const currentRoles = req.user.roles;
    const isAdmin = currentRoles.indexOf("admin") !== -1;
    const selector = isAdmin
      ? {}
      : {
          allowedRoles: { $in: currentRoles },
        };
    const folders = await Folder.find(selector).lean();

    return res.json({ success: true, data: folders });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function addFolder(req, res, next) {
  try {
    const { roles, name } = req.body;

    if (!roles || !name || !_.isArray(roles) || !roles.length) {
      return next(generateError("Invalid request", 403));
    }

    const allowedRoles = [
      "commercial_agent",
      "client_search_mandate",
      "client_sales_mandate",
      "client_management_mandate",
    ];

    if (!_.every(roles, (role) => allowedRoles.indexOf(role) !== -1)) {
      return next(generateError("Invalid request", 403));
    }

    await new Folder({ name, allowedRoles: roles }).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
