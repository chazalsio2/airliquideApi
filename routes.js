import passport from "passport";

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
  getDocuments,
  getDocument,
  getFolder,
  getRootFolder,
} from "./controllers/document";
import {
  getProject,
  getProjects,
  getProjectsAssigned,
  getProjectsMissingValidation,
  saveSearchSheet,
  savePersonalSituation,
  confirmSearchMandate,
} from "./controllers/project";
import {
  createProperty,
  getProperties,
  getProperty,
} from "./controllers/property";
import { getFolders } from "./controllers/folder";
import { getUser } from "./controllers/user";
import {
  getTrainings,
  createTraining,
  getTraining,
} from "./controllers/training";

const checkAdmin = (req, res, next) => checkRoles("admin", req, res, next);
const checkAdminOrCommercial = (req, res, next) =>
  checkRoles(["admin", "commercial_agent"], req, res, next);

export default (app) => {
  // Public route
  app.post("/login", login, errorHandle);
  app.post("/users/create-password", createPassword, errorHandle);
  app.post("/users/forgot-password", forgotPassword, errorHandle);
  app.post("/users/change-password", changePassword, errorHandle);

  app.post("/public/clients", publicCreateClient, errorHandle);

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

  // Sales role

  // Management role

  // Purchase role
};
