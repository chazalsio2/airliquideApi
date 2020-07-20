import { login } from "./controllers/auth";

export default (app) => {
  // Public route
  app.get("/", (req, res) => {
    return res.json({ success: true, status: "ok" });
  });

  app.post("/login", login);

  // Administrators

  // Sales mandate

  // Management mandate

  // Purchase mandate
};
