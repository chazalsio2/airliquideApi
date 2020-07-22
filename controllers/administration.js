import User from "../models/User";
import _ from "underscore";

export async function getUsers(req, res, next) {
  const LIMIT_BY_PAGE = 10;
  const userCount = await User.countDocuments({}).exec();
  const users = await User.find(
    {},
    "email roles createdAt active displayName active",
    { limit: LIMIT_BY_PAGE }
  ).lean();

  const pageCount = Math.ceil(userCount / LIMIT_BY_PAGE);

  return res.json({ success: true, data: { users, pageCount } });
}

export async function createUser(req, res, next) {
  const { email, roles, displayName } = req.body;

  if (!email || !roles || !displayName) {
    return next(generateError("Missing fields", 400));
  }

  const allowedRoles = [
    "commercial_agent",
    "client_sales_mandate",
    "client_management_mandate",
    "client_search_mandate",
  ];

  if (!_.isArray(roles) || !roles.length) {
    return next(generateError("Wrong arguments", 401));
  }

  const isValidRoles = _.all(
    roles,
    (role) => allowedRoles.indexOf(role) !== -1
  );

  if (!isValidRoles) {
    return next(generateError("Wrong arguments", 401));
  }

  await new User({ email, roles }).save();
  return res.json({ success: true });
}
