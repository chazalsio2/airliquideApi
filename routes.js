import passport from "passport";
import xmlparser from "express-xml-bodyparser";
import cors from "cors";

import {
  createAdmin,
  login,
  createPassword,
  forgotPassword,
  changePassword
} from "./controllers/authentification";

import { getUsers, createUser, editUser } from "./controllers/administration";
import {
  createSimulation,
  deleteSimulation,
  editSimulation,
  getSimulations
} from "./controllers/simulation";

import {
  checkSuperAdmin,
  errorHandle,
  checkRoles,
  checkAccountDesactivated
} from "./middlewares";
import { getProfile } from "./controllers/account";
import { searchTerm } from "./controllers/search";
import {
  getClients,
  getClient,
  createClient,
  addProject,
  editClient,
  deleteClient,
  deleteProject
} from "./controllers/client";
import { publicCreateClient } from "./controllers/public";
import { createDossierNotaire,editDossierNotaire,editFinaleDossierNotaire } from "./controllers/dossierNotaire"
import {
  getDocument,
  getFolder,
  getRootFolder,
  deleteDocument,
  editDocument
} from "./controllers/document";
import {
  getProject,
  getPublicProject,
  getProjects,
  getProjectsAssigned,
  getProjectsMissingValidation,
  saveSearchSheet,
  savePersonalSituation,
  confirmSearchMandate,
  refuseProject,
  acceptProject,
  addDocumentToProject,
  assignCommercial,
  uploadAgreementForProject,
  uploadDeedForProject,
  refuseAgreement,
  acceptAgreement,
  refuseDeed,
  acceptDeed,
  acceptPurchaseOffer,
  refusePurchaseOffer,
  uploadPurchaseOfferForProject,
  acceptLoanOffer,
  refuseLoanOffer,
  uploadLoanOfferForProject,
  cancelProject,
  acceptMandate,
  refuseMandate,
  uploadMandateForProject,
  getMyProjects,
  editNote,
  sendCompletedProjectEmail,
  saveSalesSheet,
  savePersonalSituationForSalesMandate,
  editSearchProject,
  editSalesSheet,
  preValidationAllStep
} from "./controllers/project";
import {
  createProperty,
  getProperties,
  getPropertie,
  getProperty,
  editProperty,
  updatePropertyVisibility,
  getPublicProperties,
  getPublicPropertiesRental,
  getPublicProperty,
  getPublicPropertyRental,
  deletePhoto,
  editPropertyStatus,
  deleteProperty
} from "./controllers/property";
import {
  getFolders,
  addFolder,
  addDocumentInFolder,
  removeFolder,
  editDocumentFolder
} from "./controllers/folder";
import { getUser, getCommercials } from "./controllers/user";
import {
  getTrainings,
  createTraining,
  getTraining,
  removeTraining,
  editTraining
} from "./controllers/training";
import { handleWebhookDocusign } from "./controllers/webhook";
import { getDashboardData } from "./controllers/dashboard";
import routeNotDefined from "./middlewares/routeNotDefined";
import {
  createContact,
  createContactCategory,
  getContactCategories,
  getContacts,
  removeContact,
  editContact
} from "./controllers/contact";

const checkAdmin = (req, res, next) => checkRoles("admin", req, res, next);
const checkAdminOrCommercial = (req, res, next) =>
  checkRoles(["admin", "commercial_agent"], req, res, next);
const checkAdminOrCommercialOrSearchClientOrclientcoaching = (req, res, next) =>
  checkRoles(
    ["admin", "commercial_agent", "client_search_mandate", "client_search_mandate_vip","client_coaching"],
    req,
    res,
    next
  );
//add check coaching in routes

const checkCoaching = (req, res, next) => checkRoles("client_coaching", req, res, next);

export default (app) => {
  // webhooks

  app.post(
    "/webhooks/docusign",
    xmlparser({ trim: false, explicitArray: false }),
    handleWebhookDocusign,
    errorHandle
  );

  // Public route
  app.post("/login", login, errorHandle);
  app.post("/users/create-password", createPassword, errorHandle);
  app.post("/users/forgot-password", forgotPassword, errorHandle);
  app.post("/users/change-password", changePassword, errorHandle);

  app.post("/public/clients", cors(), publicCreateClient, errorHandle);
  //check email in signUP
  // app.post("/public/clients-checkEmail", cors(), publicCreateClient, errorHandle);

  app.get("/public/properties", cors(), getPublicProperties, getPublicPropertiesRental , errorHandle);
  app.get(
    "/public/properties/:propertyId",
    cors(),
    getPublicProperty,
    getPublicPropertyRental,
    errorHandle
  );

  app.post("/projects/:projectId/search-sheet", saveSearchSheet, errorHandle);
  app.post("/projects/:projectId/sales-sheet", saveSalesSheet, errorHandle);

  app.post(
    "/projects/:projectId/personal-situation",
    savePersonalSituation,
    errorHandle
  );
  app.post(
    "/projects/:projectId/personal-situation-for-sales-mandate",
    savePersonalSituationForSalesMandate,
    errorHandle
  );

  app.post(
    "/projects/:projectId/send-confirmation",
    confirmSearchMandate,
    errorHandle
  );

  // Authentified
  app.get(
    "/users/profile",
    passport.authenticate("jwt", { session: false }),
    // We should not check accountsuspended here
    // checkAccountDesactivated,
    getProfile,
    errorHandle
  );

  app.post(
    "/projects/:projectId/send-email",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    sendCompletedProjectEmail,
    errorHandle
  );

  app.get(
    "/contacts",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    getContacts,
    errorHandle
  );

  //modifier contact
  app.put(
    "/contacts/:contactId/contact",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    checkAdminOrCommercial,
    editContact,
    errorHandle
  )

  app.delete(
    "/contacts/:contactId",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    checkAdmin,
    removeContact,
    errorHandle
  );

  app.get(
    "/contact-categories",
    passport.authenticate("jwt", { session: false }),
    getContactCategories,
    errorHandle
  );

  app.post(
    "/simulations",
    passport.authenticate("jwt", { session: false }),
    createSimulation,
    errorHandle
  );

  app.put(
    "/simulations/:simulationId",
    passport.authenticate("jwt", { session: false }),
    editSimulation,
    errorHandle
  );

  app.delete(
    "/simulations/:simulationId",
    passport.authenticate("jwt", { session: false }),
    deleteSimulation,
    errorHandle
  );

  app.get(
    "/simulations",
    passport.authenticate("jwt", { session: false }),
    getSimulations,
    errorHandle
  );

  app.get("/public/projects/:projectId", getPublicProject, errorHandle);

  app.get(
    "/trainings",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    getTrainings,
    errorHandle
  );

  app.get(
    "/trainings/:trainingId",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    getTraining,
    errorHandle
  );

  app.put(
    "/trainings/:trainingId",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    editTraining,
    errorHandle
  );
  app.post("/dossierNotaire/:projectId",
  passport.authenticate("jwt", { session: false }),
  checkAdminOrCommercial,
  checkAccountDesactivated,
  createDossierNotaire,
  errorHandle

  )

  app.put("/dossierNotaire/:dossiernotaireId",
  passport.authenticate("jwt", { session: false }),
  checkAdminOrCommercial,
  checkAccountDesactivated,
  editDossierNotaire,
  errorHandle
  )
  app.put("/dossierNotaireFinale/:dossiernotaireId",
  passport.authenticate("jwt", { session: false }),
  checkAdminOrCommercial,
  checkAccountDesactivated,
  editFinaleDossierNotaire,
  errorHandle
  )
  

  // SuperAdmin
  app.post("/users/admin", checkSuperAdmin, createAdmin, errorHandle);

  // Administrators
  app.post(
    "/contacts",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    createContact,
    errorHandle
  );

  app.post(
    "/contact-categories",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    createContactCategory,
    errorHandle
  );

  app.post(
    "/folders",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    addFolder,
    errorHandle
  );

  app.delete(
    "/folders/:folderId",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    removeFolder,
    errorHandle
  );

  app.put(
    "/folders/:folderId",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    editDocumentFolder,
    errorHandle
  );

  app.post(
    "/projects/:projectId/cancel-project",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    cancelProject,
    errorHandle
  );
app.put(
    "/documents/:documentId", 
    passport.authenticate("jwt", { session: false }),
    editDocument
);
  app.delete(
    "/documents/:documentId",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    deleteDocument,
    errorHandle
  );

  app.get(
    "/commercials",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    getCommercials,
    errorHandle
  );

  app.get(
    "/admin/users",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    getUsers,
    errorHandle
  );

  app.post(
    "/admin/users",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    createUser,
    errorHandle
  );

  app.put(
    "/admin/users",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    editUser,
    errorHandle
  );

  app.post(
    "/trainings",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    createTraining,
    errorHandle
  );

  app.delete(
    "/trainings/:trainingId",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    removeTraining,
    errorHandle
  );

  app.get(
    `/users/:userId`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    getUser,
    errorHandle
  );

  app.post(
    `/properties/:propertyId/update-visibility`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    updatePropertyVisibility,
    errorHandle
  );

  app.post(
    `/projects/:projectId`,
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    preValidationAllStep,
    errorHandle
  )


  app.post(
    `/projects/:projectId/refuse`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    refuseProject,
    errorHandle
  );

  app.put(
    `/properties/:propertyId`,
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    editProperty,
    errorHandle
  );
  //remove property
  app.delete(
    `/properties/:propertyId`,
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    deleteProperty,
    errorHandle
  );

  app.put(
    `/properties/:propertyId/status`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    editPropertyStatus,
    errorHandle
  );

  app.delete(
    `/properties/:propertyId/photos`,
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    deletePhoto,
    errorHandle
  );

  app.post(
    `/projects/:projectId/accept`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    acceptProject,
    errorHandle
  );

  app.post(
    `/projects/:projectId/assign-commercial`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    assignCommercial,
    errorHandle
  );

  app.post(
    `/projects/:projectId/refuse-agreement`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    refuseAgreement,
    errorHandle
  );

  app.post(
    `/projects/:projectId/accept-agreement`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    acceptAgreement,
    errorHandle
  );

  app.post(
    `/projects/:projectId/accept-mandate`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    acceptMandate,
    errorHandle
  );

  app.post(
    `/projects/:projectId/accept-purchase-offer`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    acceptPurchaseOffer,
    errorHandle
  );

  app.post(
    `/projects/:projectId/refuse-purchase-offer`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    refusePurchaseOffer,
    errorHandle
  );

  app.post(
    `/projects/:projectId/refuse-mandate`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    refuseMandate,
    errorHandle
  );

  app.post(
    `/projects/:projectId/accept-loan-offer`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    acceptLoanOffer,
    errorHandle
  );

  app.post(
    `/projects/:projectId/refuse-loan-offer`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    refuseLoanOffer,
    errorHandle
  );

  app.post(
    `/projects/:projectId/refuse-deed`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    refuseDeed,
    errorHandle
  );

  app.post(
    `/projects/:projectId/accept-deed`,
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    acceptDeed,
    errorHandle
  );

  app.post(
    `/folders/:folderId/documents`,
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    addDocumentInFolder,
    errorHandle
  );

  /** Administrator or Commercial or Search Client */

  app.get(
    "/properties/:propertyId",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercialOrSearchClientOrclientcoaching,
    checkAccountDesactivated,
    getProperty,
    errorHandle
  );

  app.get(
    "/properties",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercialOrSearchClientOrclientcoaching,
    checkAccountDesactivated,
    getProperties,
    errorHandle
  );
  app.get(
    "/propertie",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercialOrSearchClientOrclientcoaching,
    checkAccountDesactivated,
    getPropertie,
    errorHandle
  );

  /** Administrateur or commercial **/

  app.put(
    "/projects/:projectId/note",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    editNote,
    errorHandle
  );

  app.get(
    "/search",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    searchTerm,
    errorHandle
  );

  app.get(
    "/dashboard",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    getDashboardData,
    errorHandle
  );

  app.get(
    "/projects",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    getProjects,
    errorHandle
  );

  app.get(
    "/projects/assigned",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    getProjectsAssigned,
    errorHandle
  );

  app.get(
    "/projects/waiting-validation",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    getProjectsMissingValidation,
    errorHandle
  );

  app.post(
    "/properties",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    createProperty,
    errorHandle
  );

  app.get(
    "/clients/:clientId",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    getClient,
    errorHandle
  );

  app.get(
    "/clients",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    getClients,
    errorHandle
  );

  app.post(
    "/clients/:clientId/projects",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    addProject,
    errorHandle
  );


  ///remove client
  app.delete(
    "/clients/:clientId",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    deleteClient,
    //deleteProject,
    errorHandle
  );

  app.delete(
    "/projects/:projectId",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    deleteProject,
    errorHandle
  );
  //// remove client
  app.post(
    "/clients",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    createClient,
    errorHandle
  );
//check email in visionR
  app.post(
    "/clients-checkEmail",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    createClient,
    errorHandle
  );

  app.put(
    "/clients/:clientId",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    editClient,
    errorHandle
  );

  app.put(
    "/projects/:projectId/search-sheet",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    editSearchProject,
    errorHandle
  );

  app.put(
    "/projects/:projectId/sales-sheet",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    editSalesSheet,
    errorHandle
  );

  /* User connected */
  app.get(
    "/folders",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    getRootFolder,
    errorHandle
  );

  app.get(
    "/projects/:projectId",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    getProject,
    errorHandle
  );

  app.get(
    "/my-projects",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    getMyProjects,
    errorHandle
  );

  app.get(
    "/folders/:folderId",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    getFolder,
    errorHandle
  );

  app.get(
    "/documents/:documentId",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    getDocument,
    errorHandle
  );

  // app.get(
  //   "/documents",
  //   passport.authenticate("jwt", { session: false }),
  //   checkAccountDesactivated,
  //   getDocuments,
  //   errorHandle
  // );

  app.get(
    "/folders",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    getFolders,
    errorHandle
  );

  app.post(
    "/projects/:projectId/documents",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    addDocumentToProject,
    errorHandle
  );

  app.post(
    "/projects/:projectId/purchase-offers",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    uploadPurchaseOfferForProject,
    errorHandle
  );

  app.post(
    "/projects/:projectId/loan-offers",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    uploadLoanOfferForProject,
    errorHandle
  );

  app.post(
    "/projects/:projectId/mandate",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    uploadMandateForProject,
    errorHandle
  );

  app.post(
    "/projects/:projectId/sales-agreements",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    uploadAgreementForProject,
    errorHandle
  );

  app.post(
    "/projects/:projectId/sales-deeds",
    passport.authenticate("jwt", { session: false }),
    checkAccountDesactivated,
    uploadDeedForProject,
    errorHandle
  );

  // Sales role

  // Management role

  // Purchase role

  app.get("*", routeNotDefined, errorHandle);
  app.put("*", routeNotDefined, errorHandle);
  app.delete("*", routeNotDefined, errorHandle);
  app.post("*", routeNotDefined, errorHandle);
};
