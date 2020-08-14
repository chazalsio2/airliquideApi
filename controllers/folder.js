import _ from "underscore";

import { generateError } from "../lib/utils";
import Folder from "../models/Folder";
import Document from "../models/Document";
import { uploadFile } from "../lib/aws";

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

export async function addDocumentInFolder(req, res, next) {
  try {
    const { fileName, fileData, contentType } = req.body;
    const { folderId } = req.params;

    if (!fileName || !fileData || !contentType) {
      return next(generateError("Invalid request", 403));
    }

    const folder = await Folder.findById(folderId).lean();

    if (!folder) {
      return next(generateError("Folder not found", 404));
    }

    const document = await new Document({
      name: fileName,
      authorUserId: req.user._id,
      folderId,
      contentType,
    }).save();

    const location = await uploadFile(
      `folder__${folderId}/${document._id}_${document.name}`,
      fileData,
      contentType
    );
    await Document.updateOne(
      { _id: document._id },
      { $set: { url: location } }
    ).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
