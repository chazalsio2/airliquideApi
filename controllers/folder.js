import _ from "underscore";
import { generateError } from "../lib/utils";
import Folder from "../models/Folder";
import Document from "../models/Document";
import { deleteFile, uploadFile } from "../lib/aws";
import { sendNewDocWebhook } from "../services/webhook.service";

const removeDocument = async (documentId) => {
  try {
    const document = await Document.findOne(documentId).lean();
    if (!document) return null;
    await Document.deleteOne({ _id: documentId }).exec();
    await deleteFile(
      `folder__${document.folderId}/${documentId}_${document.name}`
    );
    return null;
  } catch (e) {
    console.error(e);
  }
};

export async function editDocumentFolder(req, res, next) {
  try {
    const { folderId } = req.params;

    if (!folderId) {
      return next(generateError("Invalid request", 403));
    }

    const { name, allowedRoles } = req.body;

    if (!name) {
      return next(generateError("Missing name parameter", 403));
    }

    const authorizedAllowedRoles = [
      "admin",
      "commercial_agent",
      "client_search_mandate",
      "client_sales_mandate",
      "client_management_mandate"
    ];

    if (!_.every(allowedRoles, (role) => authorizedAllowedRoles.indexOf(role) !== -1)) {
      return next(generateError("Invalid roles", 403));
    }

    const folder = await Folder.findById(folderId).lean();

    if (!folder) {
      return next(generateError("Folder not found", 404));
    }

    await Folder.updateOne({ _id: folderId }, { $set: { name, allowedRoles } }).exec();
    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
};

export async function getFolders(req, res, next) {
  try {
    const currentRoles = req.user.roles;
    const isAdmin = currentRoles.indexOf("admin") !== -1;
    const selector = isAdmin
      ? {}
      : {
        allowedRoles: { $in: currentRoles }
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
      "admin",
      "commercial_agent",
      "client_search_mandate",
      "client_sales_mandate",
      "client_management_mandate"
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

export async function removeFolder(req, res, next) {
  try {
    const { folderId } = req.params;

    if (!folderId) {
      return next(generateError("Invalid request", 403));
    }

    const folder = await Folder.findById(folderId).lean();

    if (!folder) {
      return next(generateError("Folder not found", 404));
    }

    await Folder.deleteOne({ _id: folderId }).exec();

    const documents = await Document.find({ folderId }).lean();

    await Promise.all(
      documents.map(async (document) => await removeDocument(document._id))
    );
    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

// no used
export async function removeDocumentInFolder(req, res, next) {
  try {
    const { documentId } = req.body;
    const { folderId } = req.params;

    if (!documentId || !folderId) {
      return next(generateError("Invalid request", 403));
    }

    const folder = await Folder.findById(folderId).lean();

    if (!folder) {
      return next(generateError("Folder not found", 404));
    }

    const document = await Document.findOne({
      _id: documentId,
      folderId
    }).lean();

    if (!document) {
      return next(generateError("Document not found", 404));
    }

    await removeDocument(documentId);

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
      contentType
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

    await sendNewDocWebhook(document._id)

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
