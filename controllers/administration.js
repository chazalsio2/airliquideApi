import User from "../models/User";
import _ from "underscore";

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

  try {
    await new User({ email, roles, displayName }).save();

    // Send email here

    const user = await User.findOne({ email }).exec();

    console.info(
      `[EMAIL] Bonjour ${user.displayName}, votre compte a été créé sur iVision-R, pour y accèder veuillez créer votre mot de passe : ${process.env.APP_URL}/create-password?t=${user.token}`
    );
  } catch (e) {
    return res.status(500).json({ success: false, reason: e.message });
  }

  return res.json({ success: true });
}
