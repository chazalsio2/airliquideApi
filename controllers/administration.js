import User from "../models/User";
import _ from "underscore";
import { sendEmail } from "../lib/mailjet";
import { generateError } from "../lib/utils";

const allowedRoles = [
  "commercial_agent",
  "client_sales_mandate",
  "client_management_mandate",
  "client_search_mandate",
];

export async function getUsers(req, res, next) {
  const LIMIT_BY_PAGE = 10;
  const { page = "", filter = "" } = req.query;
  const pageNumber = Number(page) || 1;
  const selector = {
    $or: [
      {
        displayName: { $regex: filter, $options: "i" },
      },
      {
        email: { $regex: filter, $options: "i" },
      },
    ],
  };
  const userCount = await User.countDocuments(selector).exec();
  const users = await User.find(
    selector,
    "email roles createdAt active displayName active",
    {
      limit: LIMIT_BY_PAGE,
      skip: (pageNumber - 1) * LIMIT_BY_PAGE,
      sort: { createdAt: -1 },
    }
  ).lean();

  const pageCount = Math.ceil(userCount / LIMIT_BY_PAGE);

  return res.json({
    success: true,
    data: { users, pageCount, total: userCount },
  });
}

export async function createUser(req, res, next) {
  const { email, roles, displayName } = req.body;

  if (!email || !roles || !displayName) {
    return next(generateError("Missing fields", 400));
  }

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

  try {
    await new User({ email, roles, displayName }).save();

    // Send email here

    const user = await User.findOne({ email }).exec();

    sendEmail({
      email,
      name: user.displayName,
      subject: "Bienvenue sur iVision-R",
      textPart: `Bonjour ${user.displayName},\r\n\r\nVotre compte a été créé sur iVision-R, pour y accèder veuillez créer votre mot de passe en cliquant sur le lien ci-dessous :\r\n\r\n${process.env.APP_URL}/create-password?t=${user.token}\r\n\r\nL'équipe de VISION-R\r\nVotre Startup Immobilière`,
    });
  } catch (e) {
    return res.status(500).json({ success: false, reason: e.message });
  }

  return res.json({ success: true });
}

export async function editUser(req, res, next) {
  try {
    const { roles, displayName, userId } = req.body;

    if (!userId || !displayName) {
      return next(generateError("Missing fields", 400));
    }

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

    const user = await User.findOne({ _id: userId }).exec();

    if (!user) {
      return next(generateError("User not found", 404));
    }

    await User.updateOne(
      { _id: userId },
      { $set: { displayName, roles } }
    ).exec();

    const userUpdated = await User.findOne(
      { _id: userId },
      "email roles createdAt active displayName active"
    ).lean();

    return res.json({ success: true, data: userUpdated });
  } catch (e) {
    return res.status(500).json({ success: false, reason: e.message });
  }
}
