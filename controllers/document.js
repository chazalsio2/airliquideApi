import Folder from "../models/Folder";
import Document from "../models/Document";

import { deleteFile } from "../lib/aws";

import { generateError, hasRole, isAdmin } from "../lib/utils";

export async function getDocument(req, res, next) {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return next(generateError("Missing documentId", 401));
    }

    const document = await Document.findById(
      documentId,
      "url name authorDisplayName authorUserId createdAt"
    ).lean();

    if (!document) {
      return next(generateError("Document not found", 404));
    }

    return res.json({ success: true, data: document });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getRootFolder(req, res, next) {
  try {
    const folderSelector = isAdmin(req.user)
      ? {}
      : { roles: { $in: req.user.roles } };

    const folders = await Folder.find(
      folderSelector,
      "name createdAt documentsCount"
    ).lean();

    return res.json({ success: true, data: { documents: [], folders } });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getFolder(req, res, next) {
  try {
    const { folderId } = req.params;

    const folder = await Folder.findById(folderId).lean();

    if (
      !hasRole(req.user, folder.allowedRoles) &&
      !hasRole(req.user, ["admin"])
    ) {
      return next(generateError("Not authorized", 401));
    }

    if (!folder) {
      return next(generateError("Folder not found", 404));
    }

    const docSelector = isAdmin(req.user)
      ? {
          folderId,
        }
      : {
          folderId,
          roles: { $in: req.user.roles },
        };

    const documents = await Document.find(docSelector, null, {
      sort: { createdAt: -1 },
    }).lean();

    // folders is empty because we do not support multi level
    return res.json({
      success: true,
      data: { name: folder.name, folders: [], documents },
    });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId).lean();

    if (!document) {
      return next(generateError("Document not found", 404));
    }

    if (document.url) {
      const filePath = document.folderId
        ? `folder__${document.folderId}/${documentId}_${document.name}`
        : `project__${document.projectId}/${documentId}_${document.name}`;

      await deleteFile(filePath);
    }

    await Document.deleteOne({ _id: documentId }).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
