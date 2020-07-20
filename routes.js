import passport from "passport";

import { login } from "./controllers/auth";
import { createAdmin } from "./controllers/users";
import { checkSuperAdmin, errorHandle } from "./middlewares";

export default (app) => {
  // Public route
  app.get("/", (req, res) => {
    return res.json({ success: true, status: "ok" });
  });

  app.post("/login", login, errorHandle);

  // SuperAdmin

  app.post("/users/admin", checkSuperAdmin, createAdmin, errorHandle);

  // Administrators

  // Sales mandate

  // Management mandate

  // Purchase mandate
};
