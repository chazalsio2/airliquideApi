import Folder from "../models/Folder";
import Document from "../models/Document";

import { deleteFile } from "../lib/aws";

import { generateError, hasRole, isAdmin } from "../lib/utils";
import Project from "../models/Project";

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
      : { allowedRoles: { $in: req.user.roles } };

    const folders = await Folder.find(
      folderSelector,
      "name createdAt documentsCount allowedRoles"
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
        folderId
      }
      : {
        folderId
      };

    const documents = await Document.find(docSelector, null, {
      sort: { createdAt: -1 }
    }).lean();

    // folders is empty because we do not support multi level
    return res.json({
      success: true,
      data: { name: folder.name, folders: [], documents }
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

    const useAsMandate = await Project.countDocuments({
      mandateDocId: documentId
    }).lean();

    if (useAsMandate) {
      return next(
        generateError("You cannot remove a document used as mandate", 403)
      );
    }
    const useAsAgreement = await Project.countDocuments({
      salesAgreementDocId: documentId
    }).lean();

    if (useAsAgreement) {
      return next(
        generateError("You cannot remove a document used as agreement", 403)
      );
    }

    const useAsDeed = await Project.countDocuments({
      salesDeedDocId: documentId
    }).lean();

    if (useAsDeed) {
      return next(
        generateError("You cannot remove a document used as sales deed", 403)
      );
    }
    const useAsPurchaseOffer = await Project.countDocuments({
      purchaseOfferDocId: documentId
    }).lean();

    if (useAsPurchaseOffer) {
      return next(
        generateError(
          "You cannot remove a document used as purchase offer",
          403
        )
      );
    }
    const useAsLoanOffer = await Project.countDocuments({
      loanOfferDocId: documentId
    }).lean();

    if (useAsLoanOffer) {
      return next(
        generateError("You cannot remove a document used as loan offer", 403)
      );
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
