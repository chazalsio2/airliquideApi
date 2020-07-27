import _ from "underscore";

export default async function (role, req, res, next) {
  const roleArray = _.isString(role) ? [role] : role;

  const hasRole = _.some(roleArray, (r) => req.user.roles.indexOf(r) !== -1);

  if (hasRole) {
    return next();
  } else {
    return res.status(401).json({ success: false, reason: "Not authorized" });
  }
}
