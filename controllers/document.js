import Document from "../models/Document";

import { generateError } from "../lib/utils";

export async function getDocuments(req, res, next) {
  try {
    const documents = await Document.find({}).lean();

    return res.json({ success: true, data: documents });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getDocument(req, res, next) {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return next(generateError("Missing documentId", 401));
    }

    const document = await Document.findById(documentId, "url name authorDisplayName authorUserId createdAt").lean();

    if (!document) {
      return next(generateError("Document not found", 404));
    }

    return res.json({ success: true, data: document });
  } catch (e) {
    next(generateError(e.message));
  }
}
