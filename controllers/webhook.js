export async function handleWebhookDocusign(req, res, next) {
  try {
    console.log("res", res);
    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
