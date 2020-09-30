import moment from "moment";
import { generateError, isAdmin, isAdminOrCommercial } from "../lib/utils";
import User from "../models/User";
import Project, { projectTypes } from "../models/Project";
import Client from "../models/Client";
import Document from "../models/Document";
import ProjectEvent from "../models/ProjectEvent";
import _ from "underscore";
import mongoose from "mongoose";
import {
  sendProjectWaitingValidationEmail,
  sendAssignProjectNotification,
  sendAgreementWaitingValidation,
  sendDeedWaitingValidation,
  sendPurchaseOfferWaitingValidation,
  sendLoanOfferWaitingValidation,
  sendAcceptPurchaseOfferConfirmation,
  sendAcceptSalesAgreementConfirmation,
  sendAcceptLoanOfferConfirmation,
  sendAcceptSalesDeedConfirmation,
  sendMandateSignatureConfirmation,
  sendWelcomeEmail,
  sendProductionConfirmation
} from "../lib/email";
import { uploadFile } from "../lib/aws";
import { sendMessageToSlack } from "../lib/slack";
import { matchPropertiesForSearchMandate } from "../lib/matching";
import Property from "../models/Property";
import { Mongoose } from "mongoose";

const LIMIT_BY_PAGE = 10;

export async function editNote(req, res, next) {
  try {
    const { projectId } = req.params;
    const { note } = req.body;

    if (!projectId || !note) {
      return next(generateError("Wrong arguments", 401));
    }

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    // const isAuthorized =
    //   isAdmin(req.user) || project.commercialId === req.user._id;

    const isAuthorized = isAdminOrCommercial(req.user);

    if (!isAuthorized) {
      return next(generateError("Not authorized", 401));
    }

    await Project.updateOne({ _id: projectId }, { $set: { note } }).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getPublicProject(req, res, next) {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    const client = await Client.findOne({ _id: project.clientId }, null).lean();

    if (!client) {
      return next(generateError("Client not found", 404));
    }

    project.client = client;
    project.events = await ProjectEvent.find({ projectId }, null, {
      sort: { createdAt: -1 }
    }).lean();
    project.documents = await Document.find({ projectId }, null, {
      sort: { createdAt: -1 }
    }).lean();

    if (project.commercialId) {
      project.commercial = await User.findById(
        project.commercialId,
        "displayName"
      ).lean();
    }

    return res.json({ success: true, data: project });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getProject(req, res, next) {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    const client = await Client.findOne({ _id: project.clientId }, null).lean();

    if (!client) {
      return next(generateError("Client not found", 404));
    }

    const isOwner = String(req.user.clientId) === String(project.clientId);

    const isAuthorized = isAdminOrCommercial(req.user) || isOwner;

    if (!isAuthorized) {
      return next(generateError("Not authorized", 401));
    }

    project.client = client;
    project.events = await ProjectEvent.find({ projectId }, null, {
      sort: { createdAt: -1 }
    }).lean();
    project.documents = await Document.find({ projectId }, null, {
      sort: { createdAt: -1 }
    }).lean();

    if (project.commercialId) {
      project.commercial = await User.findById(
        project.commercialId,
        "displayName"
      ).lean();
    }

    if (project.matchedProperties) {
      const properties = await Promise.all(
        project.matchedProperties.map(async (propertyId) => {
          return await Property.findById(propertyId, "name _id photos").lean();
        })
      );

      project.matchedProperties = properties;
    }

    project.isCommercial =
      String(req.user._id) === String(project.commercialId);

    if (isAdminOrCommercial(req.user)) {
      return res.json({ success: true, data: project });
    } else {
      return res.json({
        success: true,
        data: _.omit(project, "note")
      });
    }
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function refuseMandate(req, res, next) {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "wait_mandate_validation") {
      return next(generateError("Wrong state", 403));
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: { status: "wait_mandate" },
        $unset: { mandateDocId: "", mandateDoc: "" }
      }
    ).exec();

    new ProjectEvent({
      projectId,
      type: "mandate_refused",
      authorUserId: userId,
      reason
    }).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function saveSalesSheet(req, res, next) {
  try {
    const { projectId } = req.params;

    const project = await Project.find({
      type: "sales",
      _id: projectId
    }).lean();

    if (!project) {
      throw new Error("Project not found");
    }

    const {
      propertyType,
      propertySize,
      livingArea,
      landArea,
      workNeeded,
      reasonForTheSale,
      delay,
      readyToSign,
      nextAvailabilities,
      workEstimate,
      priceEstimate,
      fullAddress
    } = req.body;

    if (
      !propertyType ||
      !propertySize ||
      !livingArea ||
      !landArea ||
      !workNeeded ||
      !reasonForTheSale ||
      !delay ||
      !readyToSign ||
      !nextAvailabilities ||
      !workEstimate ||
      !priceEstimate ||
      !fullAddress
    ) {
      throw new Error("Missing fields");
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          salesSheet: {
            propertyType,
            propertySize,
            livingArea,
            landArea,
            workNeeded,
            reasonForTheSale,
            delay,
            readyToSign,
            nextAvailabilities,
            priceEstimate,
            workEstimate,
            fullAddress
          }
        }
      }
    ).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getMyProjects(req, res, next) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).lean();

    if (!user) {
      throw new Error("User not found", 404);
    }

    const client = await Client.findById(user.clientId).lean();

    if (!client) {
      throw new Error("Client not found", 404);
    }

    const projects = await Project.find(
      { clientId: client._id },
      "name status commercialId type"
    ).lean();

    const enrichProjects = await Promise.all(
      projects.map(async (project) => {
        project.commercial = await User.findById(
          project.commercialId,
          "displayName"
        ).lean();
        return project;
      })
    );
    return res.json({ success: true, data: enrichProjects });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function refuseDeed(req, res, next) {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "wait_sales_deed_validation") {
      return next(generateError("Wrong state", 403));
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: { status: "wait_sales_deed" },
        $unset: { salesDeedDocId: "", salesDeedDoc: "" }
      }
    ).exec();

    new ProjectEvent({
      projectId,
      type: "sales_deed_refused",
      authorUserId: userId,
      reason
    }).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function refuseAgreement(req, res, next) {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "wait_sales_agreement_validation") {
      return next(generateError("Wrong state", 403));
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: { status: "wait_sales_agreement" },
        $unset: { salesAgreementDocId: "", salesAgreementDoc: "" }
      }
    ).exec();

    new ProjectEvent({
      projectId,
      type: "sales_agreement_refused",
      authorUserId: userId,
      reason
    }).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function refusePurchaseOffer(req, res, next) {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "wait_purchase_offer_validation") {
      return next(generateError("Wrong state", 403));
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: { status: "wait_purchase_offer" },
        $unset: { purchaseOfferDocId: "", purchaseOfferDoc: "" }
      }
    ).exec();

    new ProjectEvent({
      projectId,
      type: "purchase_offer_refused",
      authorUserId: userId,
      reason
    }).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function refuseLoanOffer(req, res, next) {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "wait_loan_offer_validation") {
      return next(generateError("Wrong state", 403));
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: { status: "wait_loan_offer" },
        $unset: { loanOfferDocId: "", loanOfferDoc: "" }
      }
    ).exec();

    new ProjectEvent({
      projectId,
      type: "purchase_offer_refused",
      authorUserId: userId,
      reason
    }).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function acceptLoanOffer(req, res, next) {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "wait_loan_offer_validation") {
      return next(generateError("Wrong state", 403));
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: { status: "wait_sales_deed" }
      }
    ).exec();

    new ProjectEvent({
      projectId,
      type: "loan_offer_accepted",
      authorUserId: userId
    }).save();

    const client = await Client.findById(project.clientId).lean();

    sendAcceptLoanOfferConfirmation(client);

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function sendCompletedProjectEmail(req, res, next) {
  try {
    const { projectId } = req.params;
    const { emailNumber } = req.body;
    const project = await Project.findById(projectId).exec();

    if (!project) {
      throw new Error("Project not found", 404);
    }

    if (project.status !== "completed") {
      throw new Error("Wrong state", 403);
    }

    if (!emailNumber) {
      throw new Error("Missing arguments", 403);
    }

    if (emailNumber !== 5 && emailNumber !== 6) {
      throw new Error("Wrong arguments", 403);
    }

    const isAuthorized =
      isAdmin(req.user) || project.commercialId === req.user._id;

    if (!isAuthorized) {
      throw new Error("Not authorized");
    }
  
    const client = await Client.findById(project.clientId).lean();

    if (!client) {
      throw new Error("Client not found", 404);
    }

    if (emailNumber === 5) {
      sendAcceptSalesDeedConfirmation(client);
      await new ProjectEvent({
        type: "project_completed_email_5",
        projectId,
        authorUserId: req.user._id
      }).save();
    }

    if (emailNumber === 6) {
      sendProductionConfirmation(client);
      await new ProjectEvent({
        type: "project_completed_email_6",
        projectId,
        authorUserId: req.user._id
      }).save();
    }

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function acceptMandate(req, res, next) {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "wait_mandate_validation") {
      return next(generateError("Wrong state", 403));
    }

    const client = await Client.findById(project.clientId).lean();

    if (!client) {
      return next(generateError("Client not found", 404));
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          status: "wait_purchase_offer"
        }
      }
    ).exec();

    new ProjectEvent({
      projectId,
      type: "mandate_accepted",
      authorUserId: userId
    }).save();

    sendMandateSignatureConfirmation(client);

    const alreadyUser = await User.findOne({
      clientId: client._id
    }).lean();

    let roleToAdd;

    if (project.type === "management") {
      roleToAdd = "client_management_mandate";
    }

    if (project.type === "sales") {
      roleToAdd = "client_sales_mandate";
    }

    if (project.type === "search") {
      roleToAdd = "client_search_mandate";
    }

    if (alreadyUser) {
      await User.updateOne(
        { _id: alreadyUser._id },
        {
          $addToSet: { roles: roleToAdd }
        }
      ).exec();
    } else {
      const user = await new User({
        email: client.email,
        roles: [roleToAdd],
        displayName: client.displayName,
        clientId: client._id
      }).save();
      sendMessageToSlack({
        message: `Un nouvel utilisateur a été ajouté ${user.displayName} (${roleToAdd})`
      });
      sendWelcomeEmail(user);
    }

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function acceptPurchaseOffer(req, res, next) {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "wait_purchase_offer_validation") {
      return next(generateError("Wrong state", 403));
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: { status: "wait_sales_agreement" }
      }
    ).exec();

    new ProjectEvent({
      projectId,
      type: "purchase_offer_accepted",
      authorUserId: userId
    }).save();

    const client = await Client.findOne({ _id: project.clientId }).lean();

    sendAcceptPurchaseOfferConfirmation(client);

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function acceptAgreement(req, res, next) {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const { commission, commercialPourcentage } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "wait_sales_agreement_validation") {
      return next(generateError("Wrong state", 403));
    }

    if (!commission || !commercialPourcentage) {
      return next(generateError("Missing fields", 401));
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          status: "wait_loan_offer",
          commissionAmount: Number(commission) * 100,
          commercialPourcentage: Number(commercialPourcentage)
        }
      }
    ).exec();

    new ProjectEvent({
      projectId,
      type: "sales_agreement_accepted",
      authorUserId: userId
    }).save();

    const client = await Client.findById(project.clientId).lean();
    sendAcceptSalesAgreementConfirmation(client);

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function acceptDeed(req, res, next) {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "wait_sales_deed_validation") {
      return next(generateError("Wrong state", 403));
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: { status: "completed" }
      }
    ).exec();

    new ProjectEvent({
      projectId,
      type: "sales_deed_accepted",
      authorUserId: userId
    }).save();

    new ProjectEvent({
      projectId,
      type: "project_completed",
      authorUserId: userId
    }).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getProjects(req, res, next) {
  try {
    const { page = "", mandate = "", order = "desc" } = req.query;
    const pageNumber = Number(page) || 1;
    const selector = {};

    if (mandate === "sales") {
      selector.type = "sales";
    }

    if (mandate === "search") {
      selector.type = "search";
    }
    const projectsCount = await Project.countDocuments(selector).exec();
    const pageCount = Math.ceil(projectsCount / LIMIT_BY_PAGE);
    const orderCreatedAt = order === "desc" ? -1 : 1;
    const projects = await Project.find(selector, null, {
      sort: { createdAt: orderCreatedAt },
      skip: (pageNumber - 1) * LIMIT_BY_PAGE,
      limit: LIMIT_BY_PAGE
    }).lean();

    const clientEnrichedPromises = projects.map(async (project) => {
      project.client = await Client.findById(project.clientId).lean();
      if (project.commercialId) {
        project.commercial = await User.findById(
          project.commercialId,
          "displayName"
        ).lean();
      }
      return project;
    });

    const projectsEnriched = await Promise.all(clientEnrichedPromises);

    return res.json({
      success: true,
      data: { projects: projectsEnriched, total: projectsCount, pageCount }
    });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getProjectsAssigned(req, res, next) {
  try {
    const { page = "" } = req.query;
    const pageNumber = Number(page) || 1;
    const selector = {
      commercialId: req.user._id,
      status: { $nin: ["canceled", "refused", "closed"] }
    };
    const projectsCount = await Project.countDocuments(selector).exec();
    const pageCount = Math.ceil(projectsCount / LIMIT_BY_PAGE);
    const projects = await Project.find(selector, null, {
      sort: { createdAt: -1 },
      skip: (pageNumber - 1) * LIMIT_BY_PAGE,
      limit: LIMIT_BY_PAGE
    }).lean();

    const clientEnrichedPromises = projects.map(async (project) => {
      project.client = await Client.findById(project.clientId).lean();
      if (project.commercialId) {
        project.commercial = await User.findById(
          project.commercialId,
          "displayName"
        ).lean();
      }
      return project;
    });

    const projectsEnriched = await Promise.all(clientEnrichedPromises);

    return res.json({
      success: true,
      data: { projects: projectsEnriched, total: projectsCount, pageCount }
    });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getProjectsMissingValidation(req, res, next) {
  try {
    const { page = "" } = req.query;
    const pageNumber = Number(page) || 1;
    const selector = {
      $or: [
        {
          status: "wait_project_validation"
        },
        {
          status: "wait_mandate_validation"
        },
        {
          status: "wait_purchase_offer_validation"
        },
        {
          status: "wait_sales_agreement_validation"
        },
        {
          status: "wait_loan_offer_validation"
        },
        {
          status: "wait_sales_deed_validation"
        }
      ]
    };
    const projectsCount = await Project.countDocuments(selector).exec();
    const pageCount = Math.ceil(projectsCount / LIMIT_BY_PAGE);
    const projects = await Project.find(selector, null, {
      sort: { createdAt: -1 },
      skip: (pageNumber - 1) * LIMIT_BY_PAGE,
      limit: LIMIT_BY_PAGE
    }).lean();

    const clientEnrichedPromises = projects.map(async (project) => {
      project.client = await Client.findById(project.clientId).lean();
      if (project.commercialId) {
        project.commercial = await User.findById(
          project.commercialId,
          "displayName"
        ).lean();
      }
      return project;
    });

    const projectsEnriched = await Promise.all(clientEnrichedPromises);

    return res.json({
      success: true,
      data: { projects: projectsEnriched, total: projectsCount, pageCount }
    });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function saveSearchSheet(req, res, next) {
  try {
    const {
      propertyType,
      investmentType,
      otherInvestmentType,
      propertySize,
      propertySizeDetail,
      propertyArea,
      land,
      landArea,
      additionalInfos,
      searchSector,
      searchSectorCities,
      swimmingpool,
      varangue,
      delay,
      budget
    } = req.body;

    const { projectId } = req.params;
    const project = await Project.findById(projectId).lean();

    if (
      !propertyType ||
      !investmentType ||
      !propertyArea ||
      !searchSector ||
      !swimmingpool ||
      !varangue ||
      !delay ||
      !budget
    ) {
      return next(generateError("Invalid arguments", 401));
    }

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          searchSheet: {
            investmentType:
              investmentType === "other" ? otherInvestmentType : investmentType,
            propertySize,
            propertyType,
            additionalInfos,
            propertySizeDetail,
            propertyArea,
            land,
            landArea,
            searchSector,
            swimmingpool,
            varangue,
            delay,
            budget,
            searchSectorCities: searchSectorCities || []
          }
        }
      }
    ).exec();

    // const client = await Client.findById(project.clientId).lean();

    // sendMessageToSlack({
    //   message: `${client.displayName} à compléter sa fiche de recherche : ${process.env.APP_URL}/clients/${client._id}`
    // });

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function editSearchProject(req, res, next) {
  try {
    const {
      propertyType,
      investmentType,
      otherInvestmentType,
      propertySize,
      propertySizeDetail,
      propertyArea,
      land,
      landArea,
      additionalInfos,
      searchSector,
      searchSectorCities,
      swimmingpool,
      varangue,
      delay,
      budget
    } = req.body;

    const { projectId } = req.params;
    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          searchSheet: {
            investmentType:
              investmentType === "other" ? otherInvestmentType : investmentType,
            propertySize,
            propertyType,
            additionalInfos,
            propertySizeDetail,
            propertyArea,
            land,
            landArea,
            searchSector,
            swimmingpool,
            varangue,
            delay,
            budget,
            searchSectorCities: searchSectorCities || []
          }
        }
      }
    ).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function confirmSearchMandate(req, res, next) {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    const { readyToSign, allowSaveData, timeslots } = req.body;

    if (!readyToSign) {
      return next(generateError("Missing argument", 403));
    }

    const client = await Client.findById(project.clientId).lean();

    if (!client) {
      return next(generateError("Client not found", 404));
    }

    await Client.updateOne(
      {
        _id: project.clientId
      },
      {
        $set: {
          availabilities: timeslots,
          allowSaveData
        }
      }
    ).exec();

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          readyToSign: readyToSign === "yes",
          status: "wait_project_validation"
        }
      }
    ).exec();

    sendProjectWaitingValidationEmail(project);

    await new ProjectEvent({
      projectId: project._id,
      type: "form_completion",
      authorUserId: project.clientId
    }).save();

    sendMessageToSlack({
      message: `Le mandat de recherche pour le client ${client.displayName} est en attente de validation : ${process.env.APP_URL}/projects/${projectId}`
    });

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function cancelProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { reason } = req.body;

    const notCancellableStatus = ["canceled", "refused", "completed"];

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (notCancellableStatus.indexOf(project.status) !== -1) {
      return next(generateError("Wrong state", 403));
    }

    await Project.updateOne(
      { _id: projectId },
      { $set: { status: "canceled", cancellationReason: reason } }
    ).exec();

    await new ProjectEvent({
      projectId,
      type: "project_canceled",
      reason,
      authorUserId: req.user._id
    }).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function savePersonalSituationForSalesMandate(req, res, next) {
  try {
    const {
      industry,
      principalResidence,
      rentamount,
      creditamount,
      hascreditonsalesproperty,
      crd,
      firstname,
      lastname,
      birthday,
      address,
      phone,
      email,
      spousefirstname,
      spouselastname,
      spouseaddress,
      spousephone,
      spouseemail,
      spousesituation,
      spouseincome,
      spouseindustry,
      spouseseniority
    } = req.body;

    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      type: "sales"
    }).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    const clientModifier = {};

    if (industry) {
      clientModifier.industry = industry;
    }

    if (principalResidence) {
      clientModifier.principalResidence = principalResidence;
    }

    if (rentamount) {
      clientModifier.rentamount = rentamount;
    }

    if (creditamount) {
      clientModifier.creditamount = creditamount;
    }
    if (crd) {
      clientModifier.crd = Number(crd);
    }

    if (firstname) {
      clientModifier.firstname = firstname;
    }

    if (lastname) {
      clientModifier.lastname = lastname;
    }

    if (birthday) {
      clientModifier.birthday = moment(birthday);
    }
    if (address) {
      clientModifier.address = address;
    }

    if (phone) {
      clientModifier.phone = phone;
    }

    if (email) {
      clientModifier.email = email;
    }

    clientModifier.spouse = {
      firstname: spousefirstname,
      lastname: spouselastname,
      address: spouseaddress,
      email: spouseemail,
      situation: spousesituation,
      income: spouseincome,
      industry: spouseindustry,
      seniority: spouseseniority,
      phone: spousephone
    };

    const clientUpdate = await Client.updateOne(
      { _id: project.clientId },
      {
        $set: clientModifier
      }
    ).exec();

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          "salesSheet.hasCreditOnSalesProperty": hascreditonsalesproperty,
          status: "wait_project_validation"
        }
      }
    ).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function savePersonalSituation(req, res, next) {
  try {
    const {
      investalone,
      desiredgrossyield,
      firstname,
      lastname,
      phone,
      email,
      address,
      personalincome,
      personalindustry,
      personalseniority,
      personalsituation,
      personalstatus,
      savings,
      loans,
      crd,
      rentamount,
      creditamount,
      principalresidence,
      typeofincome,
      othertypeofincome,
      typeofrentalincome,
      othertypeofrentalincome,
      spousefirstname,
      spouselastname,
      spouseaddress,
      spouseemail,
      spousesituation,
      spouseincome,
      spouseindustry,
      spouseseniority,
      spousephone,
      birthday
    } = req.body;

    const { projectId } = req.params;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    const projectModifier = { investAlone: investalone };

    await Project.updateOne(
      { _id: projectId },
      { $set: projectModifier }
    ).exec();

    const clientModifier = {
      firstname,
      lastname,
      phone,
      email,
      address,
      savings,
      loans,
      crd,
      typesOfIncome: typeofincome,
      othersTypesOfIncome: othertypeofincome,
      typesOfRentalIncome: typeofrentalincome,
      othersTypesOfRentalIncome: othertypeofrentalincome,
      principalResidence: principalresidence,
      rentAmount: rentamount,
      creditAmount: creditamount,
      income: personalincome,
      industry: personalindustry,
      seniority: personalseniority,
      situation: personalsituation,
      status: personalstatus
    };

    if (birthday) {
      clientModifier.birthday = moment(birthday);
    }

    if (investalone === "couple") {
      clientModifier.spouse = {
        firstname: spousefirstname,
        lastname: spouselastname,
        address: spouseaddress,
        email: spouseemail,
        situation: spousesituation,
        income: spouseincome,
        industry: spouseindustry,
        seniority: spouseseniority,
        phone: spousephone
      };
    }

    await Client.updateOne(
      { _id: project.clientId },
      {
        $set: clientModifier
      }
    ).exec();

    // const client = await Client.findById(project.clientId).lean();

    // sendMessageToSlack({
    //   message: `${client.displayName} à renseigné sa situation personnelle : ${process.env.APP_URL}/clients/${client._id}`
    // });

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function refuseProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { reason } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "wait_project_validation") {
      return next(generateError("Wrong state", 401));
    }

    await Project.updateOne(
      { _id: projectId },
      { $set: { status: "refused", refusalReason: reason } }
    ).exec();

    await new ProjectEvent({
      projectId,
      type: "project_refused",
      reason,
      authorUserId: req.user._id
    }).save();

    const client = await Client.findById(project.clientId).lean();

    const user = await User.findById(req.user._id).lean();

    sendMessageToSlack({
      message: `Le mandat de recherche de ${client.displayName} a été refusé par ${user.displayName} : ${process.env.APP_URL}/projects/${project._id}`
    });

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function acceptProject(req, res, next) {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "wait_project_validation") {
      return next(generateError("Wrong state", 401));
    }

    await Project.updateOne(
      { _id: projectId },
      { $set: { status: "wait_mandate" } }
    ).exec();

    await new ProjectEvent({
      projectId,
      type: "project_accepted",
      authorUserId: req.user._id
    }).save();

    const client = await Client.findById(project.clientId).lean();

    const user = await User.findById(req.user._id).lean();

    sendMessageToSlack({
      message: `Le mandat de recherche de ${client.displayName} a été accepté par ${user.displayName} : ${process.env.APP_URL}/projects/${project._id}`
    });

    if (project.type === "search") {
      await matchPropertiesForSearchMandate(project._id);
    }

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function addDocumentToProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { fileName, fileData, contentType } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (!fileName || !fileData || !contentType) {
      return next(generateError("Invalid request", 403));
    }

    const isAuthorized =
      isAdminOrCommercial(req.user) || project.clientId === req.user._id;

    if (!isAuthorized) {
      return next(generateError("Not authorized", 401));
    }

    const document = await new Document({
      name: fileName,
      authorUserId: req.user._id,
      projectId,
      contentType
    }).save();

    const location = await uploadFile(
      `project__${projectId}/${document._id}_${document.name}`,
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

export async function uploadLoanOfferForProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { fileName, fileData, contentType } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (!fileName || !fileData || !contentType) {
      return next(generateError("Invalid request", 403));
    }

    const isAuthorized =
      isAdminOrCommercial(req.user) || project.clientId === req.user._id;

    if (!isAuthorized) {
      return next(generateError("Not authorized", 401));
    }

    if (project.status !== "wait_loan_offer") {
      return next(generateError("Wrong state for project", 403));
    }

    const document = await new Document({
      name: fileName,
      authorUserId: req.user._id,
      projectId,
      contentType
    }).save();

    const location = await uploadFile(
      `project__${projectId}/${document._id}_${document.name}`,
      fileData,
      contentType
    );
    await Document.updateOne(
      { _id: document._id },
      { $set: { url: location } }
    ).exec();

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          loanOfferDocId: document._id,
          loanOfferDoc: {
            name: document.name,
            url: location
          },
          status: "wait_loan_offer_validation"
        }
      }
    ).exec();

    await new ProjectEvent({
      projectId,
      type: "loan_offer_added",
      authorUserId: req.user._id,
      documentId: document._id
    }).save();

    sendLoanOfferWaitingValidation(project);

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function uploadMandateForProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { fileName, fileData, contentType } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (!fileName || !fileData || !contentType) {
      return next(generateError("Invalid request", 403));
    }

    const isAuthorized =
      isAdminOrCommercial(req.user) || project.clientId === req.user._id;

    if (!isAuthorized) {
      return next(generateError("Not authorized", 401));
    }

    if (project.status !== "wait_mandate") {
      return next(generateError("Wrong state for project", 403));
    }

    const document = await new Document({
      name: fileName,
      authorUserId: req.user._id,
      projectId,
      contentType
    }).save();

    const location = await uploadFile(
      `project__${projectId}/${document._id}_${document.name}`,
      fileData,
      contentType
    );
    await Document.updateOne(
      { _id: document._id },
      { $set: { url: location } }
    ).exec();

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          mandateDocId: document._id,
          mandateDoc: {
            name: document.name,
            url: location
          },
          status: "wait_mandate_validation"
        }
      }
    ).exec();

    await new ProjectEvent({
      projectId,
      type: "mandate_added",
      authorUserId: req.user._id,
      documentId: document._id
    }).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function uploadPurchaseOfferForProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { fileName, fileData, contentType } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (!fileName || !fileData || !contentType) {
      return next(generateError("Invalid request", 403));
    }

    const isAuthorized =
      isAdminOrCommercial(req.user) || project.clientId === req.user._id;

    if (!isAuthorized) {
      return next(generateError("Not authorized", 401));
    }

    if (project.status !== "wait_purchase_offer") {
      return next(generateError("Wrong state for project", 403));
    }

    const document = await new Document({
      name: fileName,
      authorUserId: req.user._id,
      projectId,
      contentType
    }).save();

    const location = await uploadFile(
      `project__${projectId}/${document._id}_${document.name}`,
      fileData,
      contentType
    );
    await Document.updateOne(
      { _id: document._id },
      { $set: { url: location } }
    ).exec();

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          purchaseOfferDocId: document._id,
          purchaseOfferDoc: {
            name: document.name,
            url: location
          },
          status: "wait_purchase_offer_validation"
        }
      }
    ).exec();

    await new ProjectEvent({
      projectId,
      type: "purchase_offer_added",
      authorUserId: req.user._id,
      documentId: document._id
    }).save();

    sendPurchaseOfferWaitingValidation(project);

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function uploadAgreementForProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { fileName, fileData, contentType } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (!fileName || !fileData || !contentType) {
      return next(generateError("Invalid request", 403));
    }

    const isAuthorized =
      isAdminOrCommercial(req.user) || project.clientId === req.user._id;

    if (!isAuthorized) {
      return next(generateError("Not authorized", 401));
    }

    if (project.status !== "wait_sales_agreement") {
      return next(generateError("Wrong state for project", 403));
    }

    const document = await new Document({
      name: fileName,
      authorUserId: req.user._id,
      projectId,
      contentType
    }).save();

    const location = await uploadFile(
      `project__${projectId}/${document._id}_${document.name}`,
      fileData,
      contentType
    );
    await Document.updateOne(
      { _id: document._id },
      { $set: { url: location } }
    ).exec();

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          salesAgreementDocId: document._id,
          salesAgreementDoc: {
            name: document.name,
            url: location
          },
          status: "wait_sales_agreement_validation"
        }
      }
    ).exec();

    await new ProjectEvent({
      projectId,
      type: "sales_agreement_added",
      authorUserId: req.user._id,
      documentId: document._id
    }).save();

    sendAgreementWaitingValidation(project);

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function uploadDeedForProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { fileName, fileData, contentType } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (!fileName || !fileData || !contentType) {
      return next(generateError("Invalid request", 403));
    }

    const isAuthorized =
      isAdminOrCommercial(req.user) || project.clientId === req.user._id;

    if (!isAuthorized) {
      return next(generateError("Not authorized", 401));
    }

    if (project.status !== "wait_sales_deed") {
      return next(generateError("Wrong state for project", 403));
    }

    const document = await new Document({
      name: fileName,
      authorUserId: req.user._id,
      projectId,
      contentType
    }).save();

    const location = await uploadFile(
      `project__${projectId}/${document._id}_${document.name}`,
      fileData,
      contentType
    );
    await Document.updateOne(
      { _id: document._id },
      { $set: { url: location } }
    ).exec();

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          salesDeedDocId: document._id,
          salesDeedDoc: {
            name: document.name,
            url: location
          },
          status: "wait_sales_deed_validation"
        }
      }
    ).exec();

    sendDeedWaitingValidation(project);

    await new ProjectEvent({
      projectId,
      type: "sales_deed_added",
      authorUserId: req.user._id,
      documentId: document._id
    }).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function assignCommercial(req, res, next) {
  try {
    const { projectId } = req.params;
    const { commercialId } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    const allowedStatus = [
      "missing_information",
      "wait_project_validation",
      "wait_mandate",
      "wait_mandate_validation",
      "wait_purchase_offer",
      "wait_purchase_offer_validation",
      "wait_sales_agreement",
      "wait_sales_agreement_validation"
    ];

    if (allowedStatus.indexOf(project.status) === -1) {
      throw new Error("Wrong state");
    }

    const commercial = await User.findOne({
      _id: commercialId,
      roles: "commercial_agent",
      deactivated: { $ne: true }
    });

    if (!commercial) {
      return next(generateError("Commercial not found", 404));
    }

    await Project.updateOne(
      { _id: projectId },
      { $set: { commercialId } }
    ).exec();

    sendAssignProjectNotification(commercial, project);

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
