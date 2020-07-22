import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import _ from "underscore";
import { v4 as uuidv4 } from "uuid";

import { generateError } from "../lib/utils";
import User from "../models/User";

const SALT_ROUNDS = 10;

export async function changePassword(req, res, next) {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(generateError("Required params missing", 400));
  }

  const user = await User.findOne({
    token,
  }).exec();

  if (!user) {
    return next(generateError("Invalid token", 401));
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  await User.updateOne(
    { token },
    { $set: { password: hash, token: uuidv4() } }
  ).exec();

  return res.json({ success: true });
}

export async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(generateError("Required params missing", 400));
  }

  const user = await User.findOne({
    email,
  }).exec();

  if (!user) {
    return next(generateError("Wrong email or password", 401));
  }

  if (!user.active) {
    return next(generateError("Your account is not activated yet", 401));
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (isPasswordMatch) {
    const payload = { userId: user._id, roles: user.roles };
    const jwtGenerated = jwt.sign(payload, process.env.JWT_SECRET);

    return res.json({
      success: true,
      data: {
        jwt: jwtGenerated,
        displayName: user.displayName,
        roles: user.roles,
      },
    });
  } else {
    return next(generateError("Wrong email or password", 401));
  }
}

export async function createAdmin(req, res, next) {
  const { email, displayName } = req.body;

  if (!email || !displayName) {
    return next(generateError("Missing fields", 400));
  }

  await new User({ email, displayName, roles: ["admin"] }).save();

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

  User.updateOne(
    { token },
    { $set: { active: true, password: hash, token: uuidv4() } }
  ).exec();

  await User.updateOne({ token });

  const payload = { userId: user._id, roles: user.roles };
  const jwtGenerated = jwt.sign(payload, process.env.JWT_SECRET);

  return res.json({
    success: true,
    data: {
      jwt: jwtGenerated,
      displayName: user.displayName,
      roles: user.roles,
    },
  });
}

export async function forgotPassword(req, res, next) {
  const { email } = req.body;

  if (!email) {
    return next(generateError("Missing fields", 400));
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return next(generateError("User not found", 404));
  }

  console.info(
    `[SENDEMAIL] Votre lien pour le changement de mot de passe est ${process.env.APP_URL}/change-password?t=${user.token}`
  );

  return res.json({ success: true });
}
