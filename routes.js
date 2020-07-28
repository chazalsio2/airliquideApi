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
import { getProjects } from "./controllers/project";
import { getClients, getClient } from "./controllers/client";

const checkAdmin = (req, res, next) => checkRoles("admin", req, res, next);
const checkAdminOrCommercial = (req, res, next) =>
  checkRoles(["admin", "commercial_agent"], req, res, next);

export default (app) => {
  app.post("/login", login, errorHandle);
  app.post("/users/create-password", createPassword, errorHandle);
  app.post("/users/forgot-password", forgotPassword, errorHandle);
  app.post("/users/change-password", changePassword, errorHandle);

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

  // Sales mandate

  // Management mandate

  // Purchase mandate
};
