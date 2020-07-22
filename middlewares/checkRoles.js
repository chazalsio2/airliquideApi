export default async function (role, req, res, next) {
  console.log("role", role);
  console.log("req.user.roles", req.user.roles);
  if (req.user.roles.indexOf(role) === -1) {
    return res.json({ success: false, reason: "Not authorized" });
  }

  console.log("Le role est bon!!");
  next();
}
