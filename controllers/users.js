import { generateError } from "../lib/utils";
import User from "../models/User";

export async function createAdmin(req, res, next) {
  const { email } = req.body;

  if (!email) {
    next(generateError("Missing fields", 400));
  }

  await new User({ email, roles: ["admin"] }).save();

  res.json({ success: true });
}
