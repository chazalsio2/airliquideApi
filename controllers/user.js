import { generateError } from "../lib/utils";

import User from "../models/User";

export async function getUser(req, res, next) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return next(generateError("Invalid request", 403));
    }

    const user = await User.findById(
      userId,
      "displayName roles email active deactivated"
    ).lean();

    if (!userId) {
      return next(generateError("User not found", 404));
    }

    return res.json({ success: true, data: user });
  } catch (e) {
    next(generateError(e.message));
  }
}
