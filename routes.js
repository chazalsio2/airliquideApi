import passport from "passport";

import {
  createAdmin,
  login,
  createPassword,
  getUsers,
} from "./controllers/users";
import { checkSuperAdmin, errorHandle, checkRoles } from "./middlewares";

const checkAdmin = (req, res, next) => checkRoles("admin", req, res, next);

export default (app) => {
  app.post("/login", login, errorHandle);
  app.post("/users/create-password", createPassword, errorHandle);

  // SuperAdmin
  app.post("/users/admin", checkSuperAdmin, createAdmin, errorHandle);

  // Administrators
  app.get(
    "/users",
    // passport.authenticate("jwt", { session: false }),
    checkAdmin,
    getUsers
  );

  // Sales mandate

  // Management mandate

  // Purchase mandate
};
