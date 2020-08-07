import { generateError } from "../lib/utils";
import Folder from "../models/Folder";

export async function getFolders(req, res, next) {
  try {
    const currentRoles = req.user.roles;
    const isAdmin = currentRoles.indexOf("admin") !== -1;
    const selector = isAdmin
      ? {}
      : {
          allowedRoles: { $in: currentRoles },
        };
    const folders = await Folder.find(selector).lean();

    return res.json({ success: true, data: folders });
  } catch (e) {
    next(generateError(e.message));
  }
}
