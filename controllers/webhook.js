export async function handleWebhookDocusign(req, res, next) {
  try {
    console.log("req.body", req.body);
    console.log("req.rawBody", req.rawBody);
    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
