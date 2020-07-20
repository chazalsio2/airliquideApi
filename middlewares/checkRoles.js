export default async function (role, req, res, next) {
  if (req.user.roles.indexOf(role) === -1) {
    return res.json({ success: false, reason: "Not authorized" });
  }
  next();
}
