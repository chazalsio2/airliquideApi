import passport from "passport";

import { login } from "./controllers/auth";
import { createAdmin } from "./controllers/users";
import checkSuperAdmin from "./middlewares/checkSuperAdmin";
// import { test1, test2 } from "./middlewares";

export default (app) => {
  // Public route
  app.get("/", (req, res) => {
    return res.json({ success: true, status: "ok" });
  });

  app.post("/login", passport.authenticate("jwt", { session: false }), login);

  // SuperAdmin

  app.post("/users/admin", checkSuperAdmin, createAdmin);

  // Administrators

  // Sales mandate

  // Management mandate

  // Purchase mandate
};
