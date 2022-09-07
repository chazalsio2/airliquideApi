import moment from "moment";
import { generateError, isAdmin, isAdminOrCommercial } from "../lib/utils";
import User from "../models/User";
import Project from "../models/Project";
import Client from "../models/Client";
import DossierNotaire from "../models/DossierNotaire";
import Document from "../models/Document";
import ProjectEvent from "../models/ProjectEvent";
import _ from "underscore";
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
  sendMandateSignedForSalesProject,
  sendProductionConfirmation,
  sendSalesAgreementAcceptedForSalesProject,
  sendPurchaseOfferAcceptedForSalesProject,
  sendLoanOfferAcceptedForSalesProject,
  sendDeedAcceptedForSalesProject,
  sendMatchPropertiesEmail
} from "../lib/email";
import {
  sendAgreementAcceptedWebhook, sendNewDocWebhook ,sendNewStatusProject, sendNewTrelloCard, sendNewAffecteCommercial
} from '../services/webhook.service'
import { uploadFile } from "../lib/aws";
import { sendMessageToSlack } from "../lib/slack";
import { matchPropertiesForSearchMandate } from "../lib/matching";
import Property from "../models/Property";
import Insul_r from "../models/Insul_r";

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

    const client = (await Client.findOne({ _id: project.clientId }, null).lean()||await Insul_r.findOne({ _id: project.clientId }, null).lean());
    const dossiernotaire = await DossierNotaire.findOne({ _id: project.dossiernotaireId }, null).lean();


    if (!client) {
      return next(generateError("Client not found", 404));
    }

    project.client = client;
    project.dossiernotaire= dossiernotaire;
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

    const client = (await Client.findOne({ _id: project.clientId }, null).lean()||await Insul_r.findOne({ _id: project.clientId }, null).lean());
    const dossiernotaire = await DossierNotaire.findOne({ _id: project.dossiernotaireId }, null).lean();



    if (!client) {
      return next(generateError("Client not found", 404));
    }
    /*if (!dossiernotaire) {
      return next(generateError("dossiernotaire not found", 404));
    }*/

    const isOwner = String(req.user.clientId) === String(project.clientId);

    const isAuthorized = isAdminOrCommercial(req.user) || isOwner;

    if (!isAuthorized) {
      return next(generateError("Not authorized", 401));
    }
    if (client.conseillerId) {
      client.commercial = await User.findById(
        client.conseillerId,
        "displayName"
      ).lean();
      console.log(client.commercial);
    }
    
    const properties = await Property.find({projectId: project._id},null).lean();

    if (properties){
      project.properties = properties;
    }

    if(client.conseillerId){
      client.user = await User.findById(client.conseillerId).lean();
   }

    project.client = client;
    project.dossiernotaire = dossiernotaire;
    project.events = await ProjectEvent.find({ projectId }, null, {
      sort: { createdAt: -1 }
    }).lean();

    project.documents = await Document.find({ projectId, visibility: "public" }, null, {
      sort: { createdAt: -1 }
    }).lean();

    if (isAdminOrCommercial(req.user)) {
      project.privateDocuments = await Document.find({ projectId, visibility: "private" }, null, {
        sort: { createdAt: -1 }
      }).lean();
    }

    if (project.commercialId) {
      project.commercial = await User.findById(
        project.commercialId,
        "displayName"
      ).lean();
    }

    if (project.propertiesId) {
      project.properties = await Property.findById(
        project.propertiesId
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

export async function editSalesSheet(req, res, next) {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      type: "sales",
      _id: projectId
    }).lean();

    if (!project) {
      throw new Error("Project not found");
    }

    const {
      landconstcd,
      propertyType,
      propertySize,
      propertySizeDetail,
      livingArea,
      landArea,
      workNeeded,
      reasonForTheSale,
      delay,
      terrai_y_n,
      ref_cadastrale,
      zone,
      readyToSign,
      workEstimate,
      priceEstimate,
      fullAddress,
      fullcode_postale,
      fullville,
      proprietaire
    } = req.body;

   /* if (
      !propertyType ||
      !propertySize ||
      // !reasonForTheSale ||
      !delay ||
      !readyToSign ||
      // !workEstimate ||
      !fullAddress||
      !fullcode_postale||
      !fullville
    ) {
      throw new Error("Missing fields");
    }
*/


    const newSalesSheetEdited = {
      propertyType,
      propertySize : propertySize && propertySize === "bigger" ? propertySizeDetail : Number(propertySize),
      propertySizeDetail,
      // livingArea,
      // landArea,
      reasonForTheSale,
      delay,
      readyToSign,
      workEstimate,
      fullAddress,
      fullcode_postale,
      fullville,
      proprietaire,
      terrai_y_n,
      ref_cadastrale,
      zone
    };

    if (livingArea) {
      newSalesSheetEdited.livingArea = livingArea;
    }
    if (landconstcd) {
      newSalesSheetEdited.landconstcd = landconstcd;
    }

    if (landArea) {
      newSalesSheetEdited.landArea = landArea;
    }

    if (priceEstimate) {
      newSalesSheetEdited.priceEstimate = priceEstimate;
    }

    if (workNeeded) {
      newSalesSheetEdited.workNeeded = workNeeded;
    }

    const newSalesSheet = _.defaults(newSalesSheetEdited, project.salesSheet);

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          salesSheet: newSalesSheet
        }
      }
    ).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function saveSalesSheet(req, res, next) {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      type: "sales",
      _id: projectId
    }).lean();

    if (!project) {
      throw new Error("Project not found");
    }

    const {
      landconstcd,
      propertyType,
      propertySize,
      propertySizeDetail,
      livingArea,
      landArea,
      workNeeded,
      reasonForTheSale,
      delay,
      readyToSign,
      nextAvailabilities,
      workEstimate,
      priceEstimate,
      fullAddress,
      fullcode_postale,
      fullville,
      proprietaire,
      terrai_y_n,
      ref_cadastrale,
      zone
    } = req.body;

    /*if (
      !propertyType ||
      !propertySize ||
      // !livingArea ||
      // !landArea ||
      !delay ||
      !readyToSign ||
      !nextAvailabilities ||
      !fullAddress ||
      !fullcode_postale||
      !fullville
      
    ) {
      throw new Error("Missing fields");
    }

*/
console.log(propertySize);

    const salesSheet = {
      propertyType,
      // livingArea,
      //landArea,
      workNeeded,
      delay,
      readyToSign,
      nextAvailabilities,
      fullAddress,
      fullcode_postale,
      fullville,
      proprietaire,
      terrai_y_n,
      ref_cadastrale,
      zone,
      landconstcd
    };
    if (propertySize) {
      salesSheet.propertySize = propertySize !== undefined && propertySize === "bigger" ? propertySizeDetail : Number(propertySize)
    }

    if (workEstimate) {
      salesSheet.workEstimate = workEstimate;
    }

    if (landArea) {
      salesSheet.landArea = landArea;
    }

    if (livingArea) {
      salesSheet.livingArea = livingArea;
    }
    
    if (landconstcd) {
      salesSheet.landconstcd = landconstcd;
    }

    if (priceEstimate) {
      salesSheet.priceEstimate = priceEstimate;
    }

    if (reasonForTheSale) {
      salesSheet.reasonForTheSale = reasonForTheSale;
    }

    if (workNeeded) {
      salesSheet.workNeeded = workNeeded;
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          salesSheet
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

    const client = (await Client.findById(user.clientId).lean()||await Insul_r.findById(user.clientId).lean());

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
    const client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean());
    const user = await User.findById(req.user._id).lean();

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
    sendNewStatusProject(project);
    new ProjectEvent({
      projectId,
      type: "loan_offer_accepted",
      authorUserId: userId
    }).save();
    sendMessageToSlack({
      message: `L'offre de prêt pour mandat de ${project.type === "search" ? "recherche" : "vente"
        } du client ${client.displayName} a été accepté par ${user.displayName}: ${process.env.APP_URL
        }/projects/${project._id}`
    });//validation pret

    const com = await User.findById(project.commercialId).lean();

    if (project.type === "sales") {
      sendLoanOfferAcceptedForSalesProject(client,com?com:null);
    } else {
      sendAcceptLoanOfferConfirmation(client,com?com:null);
    }

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

    const client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean());
    const commercial = await User.findById(project.commercialId).lean();

    if (!client) {
      throw new Error("Client not found", 404);
    }

    if (emailNumber === 5) {

      sendAcceptSalesDeedConfirmation(client, commercial);

      const event =  await new ProjectEvent({
        type: "project_completed_email_5",
        projectId,
        authorUserId: req.user._id
      }).save();
      sendNewStatusProject(project,commercial,event._id);
    }

    if (emailNumber === 6) {
      sendProductionConfirmation(client, commercial);
      const event = await new ProjectEvent({
        type: "project_completed_email_6",
        projectId,
        authorUserId: req.user._id
      }).save();
      sendNewStatusProject(project,commercial,event._id);
    }

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function acceptMandate(req, res, next) {
  try {
    console.log("accepte le mandat")
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId).lean();
    const user = await User.findById(req.user._id).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "wait_mandate_validation") {
      return next(generateError("Wrong state", 403));
    }

    const client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean());

    if (!client) {
      return next(generateError("Client not found", 404));
    }


    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          mandateDate: moment(),
          status: "wait_purchase_offer"
        }
      }
    ).exec();

    sendNewStatusProject(project);

    new ProjectEvent({
      projectId,
      type: "mandate_accepted",
      authorUserId: userId
    }).save();
    sendMessageToSlack({
      message: `Le mandat de ${project.type === "search" ? "recherche" : "vente"
        } pour le client ${client.displayName} a été accepté par ${user.displayName} : ${process.env.APP_URL
        }/projects/${projectId}`
    });//validation mandat

    const com = await User.findById(project.commercialId).lean();

    if (project.type === "sales") {
      sendMandateSignedForSalesProject(client,com?com:null);
    } else {
      sendMandateSignatureConfirmation(client,com?com:null);
    }

    const alreadyUser = await User.findOne({
      email: client.email
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

    // if (project.type === "search vip") {
    //   roleToAdd = "client_search_mandate_vip";
    // }

    if (project.type === "coaching") {
      roleToAdd = "client_coaching";
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
    const user = await User.findById(req.user._id).lean();
    const client = (await Client.findOne({ _id: project.clientId }).lean()||await Insul_r.findOne({ _id: project.clientId }).lean());
    const com = await User.findOne({ _id: project.commercialId }).lean();

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
    sendNewStatusProject(project);
    new ProjectEvent({
      projectId,
      type: "purchase_offer_accepted",
      authorUserId: userId
    }).save();
    sendMessageToSlack({
      message: `L'offre d'achat pour le mandat de ${project.type === "search" ? "recherche" : "vente"
        } du client ${client.displayName} a été accepté par ${user.displayName} : ${process.env.APP_URL
        }/projects/${projectId}`
    });//validation offre achat

    if (project.type === "sales") {
      sendPurchaseOfferAcceptedForSalesProject(client,com?com:null);
    } else {
      sendAcceptPurchaseOfferConfirmation(client,com?com:null);
    }

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
    const user = await User.findById(req.user._id).lean();
    const client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean());
    const com = await User.findById(project.commercialId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    // if (project.status !== "wait_sales_agreement_validation") {
    //   return next(generateError("Wrong state", 403));
    // }

    if (!commission || !commercialPourcentage) {
      return next(generateError("Missing fields", 401));
    }


    if(project.status ==="wait_purchase_offer"){
      await Project.updateOne(
        { _id: projectId },
        {
          $set: {
            commissionAmount: Number(commission) * 100,
            commercialPourcentage: Number(commercialPourcentage),
            salesAgreementDate: moment()
          }
        }
      ).exec();
    }else{


    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          status: "wait_loan_offer",
          commissionAmount: Number(commission) * 100,
          commercialPourcentage: Number(commercialPourcentage),
          salesAgreementDate: moment()
        }
      }
    ).exec();
    sendNewStatusProject(project);
    new ProjectEvent({
      projectId,
      type: "sales_agreement_accepted",
      authorUserId: userId
    }).save();
    sendMessageToSlack({
      message: `Le compromis de vente pour le mandat de ${project.type === "search" ? "recherche" : "vente"
        } du client ${client.displayName} a été accepté par ${user.displayName}: ${process.env.APP_URL
        }/projects/${projectId}`
    });//validation compromis  

    if (project.type === "sales") {
      sendSalesAgreementAcceptedForSalesProject(client,com?com:null);
    } else {
      sendAcceptSalesAgreementConfirmation(client,com?com:null);
    }

    await sendAgreementAcceptedWebhook(projectId)
  }

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
    const user = await User.findById(req.user._id).lean();
    const client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean());

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "wait_sales_deed_validation") {
      return next(generateError("Wrong state", 403));
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          status: "completed",
          completedAt: moment()
        }
      }
    ).exec();
    console.log(project);
    sendNewStatusProject(project);
    new ProjectEvent({
      projectId,
      type: "sales_deed_accepted",
      authorUserId: userId
    }).save();

    sendMessageToSlack({
      message: `L'acte authentique pour le mandat de ${project.type === "search" ? "recherche" : "vente"
        } du client ${client.displayName} a été accepté par ${user.displayName} : ${process.env.APP_URL
        }/projects/${projectId}`
    });//validation acte authentique

    new ProjectEvent({
      projectId,
      type: "project_completed",
      authorUserId: userId
    }).save();

    const com = await User.findById(project.commercialId).lean();

    if (project.type === "sales") {
      sendDeedAcceptedForSalesProject(client,com?com:null);
    }

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
      project.client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean())
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

export async function getProjects2(req, res, next) {
  try {
    const { page = "", mandate = "", order = "desc" } = req.query;
    const orderCreatedAt = order ===  -1 ;
    const selector = {};
    const projects = await Project.find(selector, null, {
      sort: { createdAt: -1 },
    }).lean();

    const clientEnrichedPromises = projects.map(async (projects) => {
      projects.client = (await Client.findById(projects.clientId).lean()||await Insul_r.findById(projects.clientId).lean())
      return projects;
    });

    const projectsEnriched = await Promise.all(clientEnrichedPromises);

    return res.json({
      success: true,
      data: projectsEnriched
    });
    /*try {
      const folderSelector = isAdminOrCommercial(req.user)? {}
      : { allowedRoles: { $in: req.user.roles } };
      const project = await Project.find(folderSelector).lean();
      const client = await Client.findById(project.clientId).lean();
    return res.json({
      success: true,
      data: {project:project, client:client} 
    });*/
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
      propertyLandArea,
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

    /*if (
      !propertyType ||
      !investmentType ||
      !propertyArea ||
      !searchSector ||
      !delay ||
      !budget
    ) {
      return next(generateError("Invalid arguments", 401));
    }*/

    if (!project) {
      return next(generateError("Project not found", 404));
    }



    const searchSheet = {
      investmentType:
        investmentType === "other" ? otherInvestmentType : investmentType,
        propertySize : propertySize && propertySize === "bigger" ? propertySizeDetail : Number(propertySize),
        propertyType,
      additionalInfos,
      propertySizeDetail,
      propertyArea,
      propertyLandArea:propertyLandArea && Number(propertyLandArea),
      land,
      landArea,
      searchSector,
      delay,
      budget,
      searchSectorCities: searchSectorCities || []
    };

    if (swimmingpool) {
      searchSheet.swimmingpool = swimmingpool;
    }

    if (varangue) {
      searchSheet.varangue = varangue;
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          searchSheet
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
      propertyLandArea,
      land,
      landArea,
      additionalInfos,
      searchSector,
      searchSectorCities,
      swimmingpool,
      varangue,
      delay,
      investalone,
      desiredgrossyield,
      budget
    } = req.body;
    console.log(propertySize && propertySize);

    const { projectId } = req.params;
    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    const ps =  propertySize ? propertySize === "bigger" ? propertySizeDetail : Number(propertySize):null;

    const modifier = {
      
      searchSheet: {
        investmentType:
          investmentType === "other" ? otherInvestmentType : investmentType,
          propertySize :  ps ,
          propertyType,
        additionalInfos,
        propertyArea,
        propertyLandArea:propertyLandArea && Number(propertyLandArea),
        land,
        landArea,
        searchSector,
        delay,
        budget,
        searchSectorCities: searchSectorCities || []
      }
    };
    console.log(modifier);


    if (!_.isUndefined(investalone)) {
      modifier.investAlone = investalone;
    }


    if (desiredgrossyield) {
      modifier.desiredGrossYield = desiredgrossyield;
    }

    if (varangue) {
      modifier.varangue = varangue;
    }

    if (swimmingpool) {
      modifier.swimmingpool = swimmingpool;
    }

    await Project.updateOne(
      { _id: projectId },
      {
        $set: modifier
      }
    ).exec();
    matchPropertiesForSearchMandate(projectId);
    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function editSearch(req, res, next) {
  try{
    const { projectId } = req.params;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    const {
      url_matching
    } = req.body;

    const modifier = {url_matching}

    await Project.updateOne(
      { _id: projectId },
      {
        $set: modifier
      }
    ).exec();
    const com = await User.findById(project.commercialId).lean();
   sendMatchPropertiesEmail(project,com?com:null)
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

    const client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean());

    if (!client) {
      return next(generateError("Client not found", 404));
    }

    if(timeslots) {
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
    }

    

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
      lieux_de_naissance,
      nationalite,
      address,
      zipcode,
      city,
      phone,
      email,
      spouselieuxdenaissance,
      allowSaveData,
      spousefirstname,
      spouselastname,
      spouseaddress,
      spousephone,
      spousedate,
      spousenationalite,
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
    
    if (allowSaveData) {
      clientModifier.allowSaveData = allowSaveData;
    }

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

    if(lieux_de_naissance) {
      clientModifier.lieux_de_naissance = lieux_de_naissance;
    }

    if(nationalite) {
      clientModifier.nationalite = nationalite;
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

    if (city) {
      clientModifier.city = city;
    }

    if (zipcode) {
      clientModifier.zipcode = zipcode;
    }

    clientModifier.spouse = {
      nationalite:spousenationalite,
      firstname: spousefirstname,
      lastname: spouselastname,
      address: spouseaddress,
      email: spouseemail,
      lieu: spouselieuxdenaissance,
      situation: spousesituation,
      income: spouseincome,
      industry: spouseindustry,
      seniority: spouseseniority,
      phone: spousephone,
      date: spousedate
    };

    const clientUpdate = await Client.updateOne(
      { _id: project.clientId },
      {
        $set: clientModifier
      }
    ).exec();

    await Client.updateOne(
      {
        _id: project.clientId
      },
      {
        $set: {
          allowSaveData
        }
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
    sendNewTrelloCard(project);
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
      availableSavings,
      loans,
      crd,
      zipcode,
      city,
      rentamount,
      creditamount,
      principalresidence,
      typeofincome,
      rentalIncome,
      othertypeofincome,
      typeofrentalincome,
      othertypeofrentalincome,
      spousefirstname,
      spouselastname,
      spouseaddress,
      spouselieuxdenaissance,
      spouseemail,
      spousesituation,
      spouseincome,
      spouseindustry,
      spousenationalite,
      spouseseniority,
      spousephone,
      spousedate,
      birthday,
      lieux_de_naissance,
      nationalite,
      readyToSign, allowSaveData, timeslots
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
      zipcode,
      city,
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

    if (availableSavings) {
      clientModifier.availableSavings = availableSavings;
    }

    if (rentalIncome) {
      clientModifier.rentalIncome = rentalIncome;
    }

    if (birthday) {
      clientModifier.birthday = moment(birthday);
    }

    if(lieux_de_naissance) {
      clientModifier.lieux_de_naissance = lieux_de_naissance;
    }

    if(nationalite) {
      clientModifier.nationalite = nationalite;
    }
    
    if (investalone === "couple") {
      clientModifier.spouse = {
        firstname: spousefirstname,
        lastname: spouselastname,
        address: spouseaddress,
        lieu:spouselieuxdenaissance,
        email: spouseemail,
        situation: spousesituation,
        income: spouseincome,
        industry: spouseindustry,
        seniority: spouseseniority,
        phone: spousephone,
        date:spousedate,
        nationalite:spousenationalite,
      };
    }

    await Client.updateOne(
      { _id: project.clientId },
      {
        $set: clientModifier
      }
    ).exec();
    if(timeslots) {
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
    }
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

    sendNewTrelloCard(project);

    // const client = await Client.findById(project.clientId).lean();

    // sendMessageToSlack({
    //   message: `${client.displayName} à renseigné sa situation personnelle : ${process.env.APP_URL}/clients/${client._id}`
    // });

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}


export async function preValidationAllStep(req, res, next) {
  try {
    const { projectId } = req.params;
    const { reason } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status === "wait_project_validation") {
      await Project.updateOne(
        { _id: projectId },
        { $set: { preValidationState: req.body.preValidationState } }
      ).exec();
    }

    if (project.status === "wait_mandate") {
      await Project.updateOne(
        { _id: projectId },
        { $set: { preValidationState: req.body.preValidationState } }
      ).exec();
    }

    if (project.status === "wait_mandate_validation") {
      await Project.updateOne(
        { _id: projectId },
        { $set: { preValidationState: req.body.preValidationState } }
      ).exec();
    }

    if (project.status === "wait_purchase_offer") {
      await Project.updateOne(
        { _id: projectId },
        { $set: { preValidationState: req.body.preValidationState } }
      ).exec();
    }

    if (project.status === "wait_purchase_offer_validation") {
      await Project.updateOne(
        { _id: projectId },
        { $set: { preValidationState: req.body.preValidationState } }
      ).exec();
    }

    if (project.status === "wait_sales_agreement") {
      await Project.updateOne(
        { _id: projectId },
        { $set: { preValidationState: req.body.preValidationState } }
      ).exec();
    }

    if (project.status === "wait_sales_agreement_validation") {
      await Project.updateOne(
        { _id: projectId },
        { $set: { preValidationState: req.body.preValidationState } }
      ).exec();
    }

    if (project.status === "wait_loan_offer") {
      await Project.updateOne(
        { _id: projectId },
        { $set: { preValidationState: req.body.preValidationState } }
      ).exec();
    }

    if (project.status === "wait_loan_offer_validation") {
      await Project.updateOne(
        { _id: projectId },
        { $set: { preValidationState: req.body.preValidationState } }
      ).exec();
    }

    if (project.status === "wait_sales_deed") {
      await Project.updateOne(
        { _id: projectId },
        { $set: { preValidationState: req.body.preValidationState } }
      ).exec();
    }

    if (project.status === "wait_sales_deed_validation") {
      await Project.updateOne(
        { _id: projectId },
        { $set: { preValidationState: req.body.preValidationState } }
      ).exec();
    }

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

    const client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean());

    const user = await User.findById(req.user._id).lean();

    if (project.type === "search") {
      sendMessageToSlack({
        message: `Le mandat de ${project.type === "search" ? "recherche" : "vente"
          } de ${client.displayName} a été refusé par ${user.displayName} : ${process.env.APP_URL
          }/projects/${project._id}`
      });
    }
    // else {
    //   sendMessageToSlack({
    //     message: `Le mandat de ${project.type === "search vip" ? "recherche" : "vente"
    //       } de ${client.displayName} a été refusé par ${user.displayName} : ${process.env.APP_URL
    //       }/projects/${project._id}`
    //   });
    // }
    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function acceptProject(req, res, next) {
  try {
    console.log("accepte le project")
    const { projectId } = req.params;

    const project = await Project.findById(projectId).lean();
    const client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean());
    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (project.status !== "wait_project_validation") {
      return next(generateError("Wrong state", 401));
    }

    if (client.conseillerId){

      await Project.updateOne(
        { _id: projectId },
        { $set: { status: "wait_mandate",
                  commercialId: client.conseillerId  
        } }
      ).exec();
    
      const commercial = await User.findOne({
        _id: client.conseillerId,
        roles: "commercial_agent",
        deactivated: { $ne: true }
      });
    
      sendNewAffecteCommercial(project,commercial);
    }else{
      
      await Project.updateOne(
        { _id: projectId },
        { $set: { status: "wait_mandate"} }
      ).exec();
    }

    sendNewStatusProject(project);

    await new ProjectEvent({
      projectId,
      type: "project_accepted",
      authorUserId: req.user._id
    }).save();

    const user = await User.findById(req.user._id).lean();

    sendMessageToSlack({
      message: `Le projet du prospect ${client.displayName} a été accepté par ${user.displayName}`//validé projet
    });

    if (project.type === "search") {
      await matchPropertiesForSearchMandate(project._id);
    }

    // if (project.type === "search vip") {
    //   await matchPropertiesForSearchMandate(project._id);
    // }

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function addDocumentToProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { fileName, fileData, contentType, visibility } = req.body;

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
      contentType,
      visibility
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

    sendNewDocWebhook(document._id)
    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function addDocumentToProjectByExtrenPlatform(req, res, next) {
  try {
    const { projectId } = req.params;
    const { fileName, fileData, contentType, visibility } = req.body;

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (!fileName || !fileData || !contentType) {
      return next(generateError("Invalid request", 403));
    }
    console.log(contentType);

    /*const isAuthorized =
      isAdminOrCommercial(req.user) || project.clientId === req.user._id;

    if (!isAuthorized) {
      return next(generateError("Not authorized", 401));
    }*/

    const document = await new Document({
      name: fileName,
      authorUserId: "62f4db00a19c48055a3ab571",
      projectId,
      contentType,
      visibility:project.type === "search" ? "public" : "private"
    }).save();

    // const location = await uploadFile(
    //   `project__${projectId}/${document._id}_${document.name}`,
    //   fileData,
    //   contentType
    // );
    await Document.updateOne(
      { _id: document._id },
      { $set: { url: fileData } }
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
    const user = await User.findById(req.user._id).lean();

    const project = await Project.findById(projectId).lean();
    const client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean());

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

    await sendNewDocWebhook(document._id)

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
    // const client = await Client.findById(project.clientId).lean();
    sendNewStatusProject(project);
    sendMessageToSlack({
      message: `L'offre de prêt pour mandat de ${project.type === "search" ? "recherche" : "vente"
        } du client ${client.displayName} est en attente d'acceptation : ${process.env.APP_URL
        }/projects/${project._id}`
    });

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
    console.log("ajout du mandat")
    const { projectId } = req.params;
    const { fileName, fileData, contentType,originNameMandate, num_mandat, date_mandat } = req.body;
    const user = await User.findById(req.user._id).lean();

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
      originNameMandate,
      name: fileName,
      authorUserId: req.user._id,
      projectId,
      contentType,
      num_mandat: num_mandat,
      date_mandat: date_mandat
    }).save();

    const location = await uploadFile(
      `project__${projectId}/${document._id}_${document.name}`,
      fileData,
      contentType
    );
    console.log(document._id);
    await Document.updateOne(
      { _id: document._id },
      { $set: { url: location } }
    ).exec();

    sendNewDocWebhook(document._id)


    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          mandateDocId: document._id,
          mandateDoc: {
            originNameMandate:originNameMandate,
            name: document.name,
            url: location,
            num_mandat: num_mandat,
            date_mandat: date_mandat
          },
          status: "wait_mandate_validation"
        }
      }
    ).exec();
    await sendNewStatusProject(project);

    const client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean());
    sendMessageToSlack({
      message: `Le mandat de ${project.type === "search" ? "recherche" : "vente"
        } pour le client ${client.displayName} est en attente de validation : ${process.env.APP_URL
        }/projects/${projectId}`
    });

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
export async function uploadMandateForProjectExterne(req, res, next) {
  try {
    console.log("ajout du mandat")
    const { projectId } = req.params;
    const { fileName, fileData, contentType,originNameMandate } = req.body;
    // const user = await User.findById(req.user._id).lean();

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    if (!fileName || !fileData || !contentType) {
      return next(generateError("Invalid request", 403));
    }

    // const isAuthorized =
    //   isAdminOrCommercial(req.user) || project.clientId === req.user._id;

    // if (!isAuthorized) {
    //   return next(generateError("Not authorized", 401));
    // }

    if (project.status !== "wait_mandate") {
      return next(generateError("Wrong state for project", 403));
    }

    const document = await new Document({
      originNameMandate,
      name: fileName,
      authorUserId: "62f4db00a19c48055a3ab571",
      projectId,
      contentType
    }).save();

    // const location = await uploadFile(
    //   `project__${projectId}/${document._id}_${document.name}`,
    //   fileData,
    //   contentType
    // );
    console.log(document._id);
    await Document.updateOne(
      { _id: document._id },
      { $set: { url: fileData } }
    ).exec();

    sendNewDocWebhook(document._id)


    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          mandateDocId: document._id,
          mandateDoc: {
            originNameMandate:originNameMandate,
            name: document.name,
            url: fileData
          },
          status: "wait_mandate_validation"
        }
      }
    ).exec();
    await sendNewStatusProject(project);

    const client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean());
    sendMessageToSlack({
      message: `Le mandat de ${project.type === "search" ? "recherche" : "vente"
        } pour le client ${client.displayName} est en attente de validation : ${process.env.APP_URL
        }/projects/${projectId}`
    });

    await new ProjectEvent({
      projectId,
      type: "mandate_added",
      authorUserId: "62f4db00a19c48055a3ab571",
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

    sendNewDocWebhook(document._id)

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
    sendNewStatusProject(project);
    const client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean());
    const user = await User.findById(req.user._id).lean();
    sendMessageToSlack({
      message: `L'offre d'achat pour le mandat de ${project.type === "search" ? "recherche" : "vente"
        } du client ${client.displayName} est en attente de validation : ${process.env.APP_URL
        }/projects/${projectId}`
    });//toto

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
    const client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean());
    const user = await User.findById(req.user._id).lean();

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

    await sendNewDocWebhook(document._id)

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
    sendNewStatusProject(project);
    await new ProjectEvent({
      projectId,
      type: "sales_agreement_added",
      authorUserId: req.user._id,
      documentId: document._id
    }).save();

    // const client = await Client.findById(project.clientId).lean();
    sendMessageToSlack({
      message: `Le compromis de vente pour le mandat de ${project.type === "search" ? "recherche" : "vente"
        } du client ${client.displayName} est en attente de validation : ${process.env.APP_URL
        }/projects/${projectId}`
    });

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
    const client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean());
    const user = await User.findById(req.user._id).lean();

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

    sendNewDocWebhook(document._id)

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
    sendNewStatusProject(project);
    // const client = await Client.findById(project.clientId).lean();
    sendMessageToSlack({
      message: `L'acte authentique pour le mandat de ${project.type === "search" ? "recherche" : "vente"
        } du client ${client.displayName} est en attente de validation : ${process.env.APP_URL
        }/projects/${projectId}`
    });

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
    sendNewAffecteCommercial(project,commercial);

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
export async function assignPropertie(req, res, next) {
  try {
    const { projectId } = req.params;
    const { propertiesId } = req.body;


    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    /*const allowedStatus = [
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
    }*/

    const propertie = await Property.findOne({
      _id: propertiesId
    });

    console.log(propertiesId);

    if (!propertie) {
      return next(generateError("Propertie not found", 404));
    }

    await Project.updateOne(
      { _id: projectId },
      { $set: { propertiesId } }
    ).exec();

    await Property.updateOne(
      { _id: propertiesId },
      { $set: { projectId } }
    ).exec();

   // sendAssignProjectNotification(commercial, project);
   // sendNewAffecteCommercial(project,commercial);

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
