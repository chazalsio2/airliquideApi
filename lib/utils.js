import _ from "underscore";

export function generateError(message, errorCode = 500) {
  console.log("generateError -> message", message);
  const error = new Error(message);
  error.code = errorCode;
  return error;
}

export function hasRole(user, roles) {
  const hasRight = _.some(user.roles, (role) => roles.indexOf(role) !== -1);
  return hasRight;
}

export function isAdmin(user) {
  return hasRole(user, ["admin"]);
}

export function isAdminOrCommercial(user) {
  return hasRole(user, ["admin", "agent_commercial"]);
}
