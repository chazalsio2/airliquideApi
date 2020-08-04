import passport from "passport";

import {
  createAdmin,
  login,
  createPassword,
  forgotPassword,
  changePassword,
} from "./controllers/authentification";

import { getUsers, createUser, editUser } from "./controllers/administration";

import { checkSuperAdmin, errorHandle, checkRoles } from "./middlewares";
import { getProfile } from "./controllers/account";
import { searchTerm } from "./controllers/search";
import {
  getClients,
  getClient,
  createClient,
  addProject,
} from "./controllers/client";
import { publicCreateClient } from "./controllers/public";
import { getDocuments, getDocument } from "./controllers/document";
import {
  getProject,
  getProjects,
  getProjectsAssigned,
  getProjectsMissingValidation,
} from "./controllers/project";

const checkAdmin = (req, res, next) => checkRoles("admin", req, res, next);
const checkAdminOrCommercial = (req, res, next) =>
  checkRoles(["admin", "commercial_agent"], req, res, next);

export default (app) => {
  app.post("/login", login, errorHandle);
  app.post("/users/create-password", createPassword, errorHandle);
  app.post("/users/forgot-password", forgotPassword, errorHandle);
  app.post("/users/change-password", changePassword, errorHandle);

  app.post("/public/clients", publicCreateClient, errorHandle);

  // Authentified
  app.get(
    "/users/profile",
    passport.authenticate("jwt", { session: false }),
    getProfile,
    errorHandle
  );

  // SuperAdmin
  app.post("/users/admin", checkSuperAdmin, createAdmin, errorHandle);

  // Administrators
  app.get(
    "/admin/users",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    getUsers,
    errorHandle
  );

  app.post(
    "/admin/users",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    createUser,
    errorHandle
  );

  app.put(
    "/admin/users",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    editUser,
    errorHandle
  );

  /** Administrateur or commercial **/

  app.get(
    "/search",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    searchTerm,
    errorHandle
  );

  app.get(
    "/projects",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    getProjects,
    errorHandle
  );

  app.get(
    "/projects/assigned",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    getProjectsAssigned,
    errorHandle
  );

  app.get(
    "/projects/waiting-validation",
    passport.authenticate("jwt", { session: false }),
    checkAdmin,
    getProjectsMissingValidation,
    errorHandle
  );

  app.get(
    "/clients/:clientId",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    getClient,
    errorHandle
  );

  app.get(
    "/clients",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    getClients,
    errorHandle
  );

  app.post(
    "/clients/:clientId/projects",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    addProject,
    errorHandle
  );

  app.get(
    "/projects/:projectId",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    getProject,
    errorHandle
  );

  app.post(
    "/clients",
    passport.authenticate("jwt", { session: false }),
    checkAdminOrCommercial,
    createClient,
    errorHandle
  );

  /* User connected */
  app.get(
    "/documents/:documentId",
    passport.authenticate("jwt", { session: false }),
    getDocument,
    errorHandle
  );

  app.get(
    "/documents",
    passport.authenticate("jwt", { session: false }),
    getDocuments,
    errorHandle
  );

  // Sales role

  // Management role

  // Purchase role
};
