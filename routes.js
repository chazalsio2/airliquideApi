import passport from "passport";

import {
  createAdmin,
  login,
  createPassword,
  forgotPassword,
  changePassword,
} from "./controllers/authentification";

import { getUsers, createUser } from "./controllers/administration";

import { checkSuperAdmin, errorHandle, checkRoles } from "./middlewares";

const checkAdmin = (req, res, next) => checkRoles("admin", req, res, next);

export default (app) => {
  app.post("/login", login, errorHandle);
  app.post("/users/create-password", createPassword, errorHandle);
  app.post("/users/forgot-password", forgotPassword, errorHandle);
  app.post("/users/change-password", changePassword, errorHandle);

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

  // Sales mandate

  // Management mandate

  // Purchase mandate
};
