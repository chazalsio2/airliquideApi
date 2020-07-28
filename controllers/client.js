import Client from "../models/Client";
import { generateError } from "../lib/utils";

export async function getClients(req, res) {
  try {
    return res.json({ success: true, data: await Client.find().lean() });
  } catch (e) {
    return res.status(500).json({ success: false });
  }
}

export async function getClient(req, res, next) {
  try {
    const { clientId } = req.params;
    const client = await Client.findById(clientId).lean();

    if (!client) {
      return next(generateError("Client not found", 404));
    }

    return res.json({
      success: true,
      data: client,
    });
  } catch (e) {
    return res.status(500).json({ success: false });
  }
}
