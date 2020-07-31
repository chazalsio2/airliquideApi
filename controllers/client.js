import Client from "../models/Client";
import Mandate from "../models/Mandate";
import { generateError } from "../lib/utils";

export async function getClients(req, res, next) {
  try {
    // TODO: pagination here

    const clients = await Client.find().lean();

    const clientsWithMandates = await Promise.all(
      clients.map(async (client) => {
        const mandates = await Mandate.find({
          clientId: client._id,
          status: { $nin: ["canceled", "completed"] },
        }).lean();
        client.mandates = mandates;
        return client;
      })
    );
    return res.json({ success: true, data: clientsWithMandates });
  } catch (e) {
    return next(generateError(e.message));
  }
}

export async function getClient(req, res, next) {
  try {
    const { clientId } = req.params;
    const client = await Client.findById(clientId).lean();

    if (!client) {
      return next(generateError("Client not found", 404));
    }

    client.mandates = await Mandate.find({
      clientId: client._id,
      status: { $nin: ["canceled", "completed"] },
    }).lean();

    return res.json({
      success: true,
      data: client,
    });
  } catch (e) {
    return res.status(500).json({ success: false });
  }
}
