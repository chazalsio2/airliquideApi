import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import _ from "underscore";

import { generateError } from "../lib/utils";
import User from "../models/User";

const SALT_ROUNDS = 10;

export async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(generateError("Required params missing", 400));
  }

  const user = await User.findOne({
    email,
  });

  if (!user.active) {
    return next(generateError("Your account is not activated yet", 401));
  }

  if (!user) {
    return next(generateError("Wrong email or password", 401));
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (isPasswordMatch) {
    const payload = { userId: user._id, roles: user.roles };
    const jwtGenerated = jwt.sign(payload, process.env.JWT_SECRET);

    return res.json({
      success: true,
      data: {
        jwt: jwtGenerated,
      },
    });
  } else {
    return next(generateError("Wrong email or password", 401));
  }
}

export async function createAdmin(req, res, next) {
  const { email } = req.body;

  if (!email) {
    return next(generateError("Missing fields", 400));
  }

  await new User({ email, roles: ["admin"] }).save();

  res.json({ success: true });
}

export async function createPassword(req, res, next) {
  const { password, token } = req.body;

  if (!password || !token) {
    return next(generateError("Missing fields", 400));
  }

  const user = await User.findOne({ token, active: false }).exec();

  if (!user) {
    return next(generateError("Invalid token", 404));
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  User.updateOne({ token }, { $set: { active: true, password: hash } }).exec();

  await User.updateOne({ token });
}

export async function getUsers(req, res, next) {
  const users = await User.find({}, "email roles createdAt active").lean();

  return res.json({ success: true, data: users });
}

export async function createUser(req, res, next) {
  const { email, roles } = req.body;

  const allowedRoles = [
    "commercial",
    "sales_mandate",
    "management_mandate",
    "purchase_mandate",
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
