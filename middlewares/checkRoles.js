import Account from "../models/Account";
import ApiKey from "../models/ApiKey";
import logger from "../lib/logger";
import planManager from "../lib/plan-manager";

export default async function (req, res, next) {
  const authorizationToken =
    req.headers.authorization || req.headers.Authorization;

  if (!authorizationToken) {
    return res.status(401).json({ success: false, error: "Missing api key" });
  }

  try {
    const key = await ApiKey.findOne({
      key: authorizationToken,
      isRevoked: false
    }).exec();

    if (!key) {
      return res
        .status(401)
        .json({ success: false, error: "Wrong or revoked api key" });
    }

    const account = await Account.findOne({ userId: key.userId }).exec();

    const plan = await planManager.getPlan(account.planId);

    if (process.env.NODE_ENV !== "development") {
      if (!plan || plan.nickname === "Gratuit" || plan.nickname === "Start") {
        return res.status(401).json({
          success: false,
          error: "Please upgrade your plan to get access to the API feature"
        });
      }
    }

    await ApiKey.updateOne(
      { key: authorizationToken },
      { $inc: { useCount: 1 } }
    ).exec();

    if (!account) {
      return res.status(500).json({ success: false, error: "Unknown error" });
    }

    req.user = { sub: account.userId };
    next();
  } catch (error) {
    logger.log("error", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
