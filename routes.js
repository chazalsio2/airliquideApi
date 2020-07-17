export default (app) => {
  app.get("/", (req, res) => {
    return res.json({ success: true });
  });
};
