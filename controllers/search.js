import { isAdminOrCommercial, isAdmin, generateError } from "../lib/utils";
import Document from "../models/Document";
import Client from "../models/Client";
import User from "../models/User";

export async function searchTerm(req, res, next) {
  const { t } = req.query;

  if (!t) {
    next(generateError("Missing fields", 401));
  }

  const results = [];
  const documents = await Document.find(
    {
      name: { $regex: t, $options: "i" },
    },
    null,
    { limit: 50 }
  ).lean();

  const documentsFormatted = documents.map((doc) => ({
    _id: doc._id,
    type: "document",
    context: "",
    name: doc.name,
  }));

  results.push(...documentsFormatted);

  if (isAdminOrCommercial(req.user)) {
    const clients = await Client.find(
      {
        $or: [{ displayName: { $regex: t, $options: "i" } }],
      },
      null,
      { limit: 50 }
    ).lean();
    const clientsFormatted = clients.map((client) => ({
      _id: client._id,
      type: "client",
      context: "Contact",
      name: client.displayName,
    }));

    results.push(...clientsFormatted);
  }

  if (isAdmin(req.user)) {
    const users = await User.find(
      {
        $or: [{ displayName: { $regex: t, $options: "i" } }],
      },
      null,
      { limit: 50 }
    ).lean();

    const usersFormatted = users.map((user) => ({
      _id: user._id,
      type: "user",
      context: "Utilisateur",
      name: user.displayName,
    }));

    results.push(...usersFormatted);
  }

  return res.json({ success: true, data: results });
}
