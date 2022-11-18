import User from "../models/User";
import _ from "underscore";
import { generateError } from "../lib/utils";
import { sendWelcomeEmail } from "../lib/email";
import {sendMessageToSlack} from "../lib/slack";

const allowedRoles = [
  "admin",
  "commercial_agent",
  "client_sales_mandate",
  "client_management_mandate",
  "client_search_mandate",
  "client_coaching",
  "client_search_mandate_vip"
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
    "email roles createdAt active displayName phone active deactivated ZoneSector",
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
  const { email, roles, displayName,phone, password, ZoneSector} = req.body;  

  if (!email || !roles || !displayName|| !phone) {
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
    await new User({ email, roles, displayName, phone ,ZoneSector}).save();
    const user = await User.findOne({ email }).exec();
    if(roles.includes("commercial_agent") ){
      const lien_auto = encodeURI(`https://tally.so/r/mVp0ON?nom=${user.displayName}&mail=${user.email}`)
          // "https://tally.so/r/mVp0ON?nom="+user.displayName+"&mail="+user.email
      sendMessageToSlack({
        message: `Un nouvel utilisateur a été ajouté : ${user.displayName} (${roles})
          Merci de l'ajouter dans les automatisations lorsque celui-ci aura intégré l'espace Slack et Trello de Vision-R.
          <${lien_auto}|Completer le formulaire>`
      });
    }else {
      sendMessageToSlack({
        message: `Un nouvel utilisateur a été ajouté ${user.displayName} (${roleToAdd})`
      });
    }
    sendWelcomeEmail(user);
  } catch (e) {
    return res.status(500).json({ success: false, reason: e.message });
  }

  return res.json({ success: true });
}

export async function editUser(req, res, next) {
  try {
    const { roles, displayName, userId, deactivated, phone,ZoneSector } = req.body;
    if (req.user.roles.indexOf("admin")) {
      
    }
    if (!userId || !displayName || !phone) {      
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

    if (user.roles.indexOf("admin")!== -1) {
      if (roles.indexOf("admin")=== -1) {
        return next(generateError("Missing fields", 400));
      }
    }

    if (!user) {
      return next(generateError("User not found", 404));
    }

    await User.updateOne(
      { _id: userId },
      { $set: { displayName, roles, deactivated, phone, ZoneSector } }
    ).exec();

    const userUpdated = await User.findOne(
      { _id: userId },
      "email roles createdAt active displayName active deactivated ZoneSector" 
    ).lean();
    return res.json({ success: true, data: userUpdated });
  } catch (e) {
    return res.status(500).json({ success: false, reason: e.message });
  }
}
export async function ChangeZoneUser(req, res, next) {
  try {
    const { roles, displayName, userId, deactivated, phone,ZoneSector } = req.body;

    const user = await User.findOne({ _id: req.user._id }).exec();

    if (!user) {
      return next(generateError("User not found", 404));
    }

    await User.updateOne(
      { _id: req.user._id },
      { $set: { ZoneSector } }
    ).exec();

    const userUpdated = await User.findOne(
      { _id: req.user._id },
      "email roles createdAt active displayName active deactivated ZoneSector" 
    ).lean();

    // const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    // await delay(5000);

    return res.json({ success: true, data: userUpdated });
  } catch (e) {
    return res.status(500).json({ success: false, reason: e.message });
  }
}
