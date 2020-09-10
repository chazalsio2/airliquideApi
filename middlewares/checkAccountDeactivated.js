export default async function (req, res, next) {
  if (req.user.deactivated) {
    return res
      .status(401)
      .json({ success: false, reason: "Account suspended" });
  }
  return next();
}
