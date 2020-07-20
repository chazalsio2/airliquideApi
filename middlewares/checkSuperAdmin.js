import { generateError } from "../lib/utils";

export default function checkSuperAdmin(req, res, next) {
  const bearerToken = req.headers.authorization || req.headers.Authorization;

  if (!bearerToken) {
    next(generateError("Missing authorization key", 401));
  }

  const authorizationToken = bearerToken.split("Bearer ")[1];

  if (authorizationToken === process.env.SUPER_ADMIN_SECRET) {
    next();
  } else {
    return res.status(401).json({ success: false, reason: "Not authorized" });
  }
}
