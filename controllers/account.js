import jwt from "jsonwebtoken";

export async function getProfile(req, res) {
  const payload = { userId: req.user._id, roles: req.user.roles };
  const jwtGenerated = jwt.sign(payload, process.env.JWT_SECRET);
  const { displayName, roles,email,phone, deactivated } = req.user;
  return res.json({
    success: true,
    data: {
      jwt: jwtGenerated,
      displayName,
      roles,
      email,
      deactivated,
      phone
    },
  });
}
