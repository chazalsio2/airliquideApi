import passport from "passport";
import xmlparser from "express-xml-bodyparser";
import cors from "cors";
import bodyParser from "body-parser";

import {
  createAdmin,
  login,
  createPassword,
  forgotPassword,
  changePassword,
} from "./controllers/authentification";

import { getUsers, createUser, editUser } from "./controllers/administration";

import {
  checkSuperAdmin,
  errorHandle,
  checkRoles,
  checkAccountDesactivated,
} from "./middlewares";
import { getProfile } from "./controllers/account";
import { searchTerm } from "./controllers/search";
import {
  getClients,
  getClient,
  createClient,
  addProject,
} from "./controllers/client";
import { publicCreateClient } from "./controllers/public";
import {
  getDocument,
  getFolder,
  getRootFolder,
  deleteDocument,
} from "./controllers/document";
import {
  getProject,
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
} from "./controllers/project";
import {
  createProperty,
  getProperties,
  getProperty,
  editProperty,
  updatePropertyVisibility,
  updateFinancialPropertyData,
} from "./controllers/property";
import {
  getFolders,
  addFolder,
  addDocumentInFolder,
} from "./controllers/folder";
import { getUser, getCommercials } from "./controllers/user";
import {
  getTrainings,
  createTraining,
  getTraining,
} from "./controllers/training";
import { handleWebhookDocusign } from "./controllers/webhook";
import { getDashboardData } from "./controllers/dashboard";
import routeNotDefined from "./middlewares/routeNotDefined";

const checkAdmin = (req, res, next) => checkRoles("admin", req, res, next);
const checkAdminOrCommercial = (req, res, next) =>
  checkRoles(["admin", "commercial_agent"], req, res, next);

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

  app.get("/public/projects/:projectId", getProject, errorHandle);

  app.post("/projects/:projectId/search-sheet", saveSearchSheet, errorHandle);
  app.post(
    "/projects/:projectId/personal-situation",
    savePersonalSituation,
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

  // SuperAdmin
  app.post("/users/admin", checkSuperAdmin, createAdmin, errorHandle);

  // Administrators
  app.post(
    "/folders",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    addFolder,
    errorHandle
  );

  app.post(
    "/projects/:projectId/cancel-project",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    checkAccountDesactivated,
    cancelProject,
    errorHandle
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
    checkAdmin,
    checkAccountDesactivated,
    editProperty,
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
    checkAdmin,
    checkAccountDesactivated,
    addDocumentInFolder,
    errorHandle
  );

  /** Administrateur or commercial **/

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

  app.get(
    "/properties/:propertyId",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    getProperty,
    errorHandle
  );

  app.put(
    "/properties/:propertyId/financial-data",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    updateFinancialPropertyData,
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
    "/properties",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    getProperties,
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

  app.get(
    "/projects/:projectId",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    getProject,
    errorHandle
  );

  app.post(
    "/clients",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    checkAccountDesactivated,
    createClient,
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
