import crypto from "crypto";

function computeHash(payload) {
  console.log("computeHash -> payload", payload, typeof payload);
  const hmac = crypto.createHmac("sha256", process.env.DOCUSIGN_CONNECT_SECRET);
  hmac.write(payload);
  hmac.end();
  return hmac.read().toString("base64");
}

export default async function (req, res, next) {
  const verify = req.headers["x-docusign-signature-1"];
  console.log("verify", verify);
  const payload = Buffer.from(req.body, "utf8");
  const computedHash = computeHash(payload);
  console.log("computedHash", computedHash);
  if (verify !== computedHash) {
    console.log(">>>>Ne match pas");
  } else {
    console.log("MATCH!!!");
  }
  return next();
}
