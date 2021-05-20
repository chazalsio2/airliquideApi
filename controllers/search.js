import { isAdminOrCommercial, isAdmin, generateError } from "../lib/utils";
import Document from "../models/Document";
import Client from "../models/Client";
import User from "../models/User";
import Folder from "../models/Folder";
import Training from "../models/Training";
import Property from "../models/Property";

export async function searchTerm(req, res, next) {
  const { t } = req.query;

  if (!t) {
    next(generateError("Missing fields 11", 401));
    // next(generateError("Missing fields", 401));
  }

  const results = [];
  // TODO : Add roles checker
  const documents = await Document.find(
    {
      name: { $regex: t, $options: "i" },
    },
    null,
    { limit: 50, sort: { createdAt: -1 } }
  ).lean();

  const documentsFormatted = documents.map((doc) => ({
    _id: doc._id,
    type: "document",
    context: "Document",
    name: doc.name,
    externalLink: doc.url,
  }));

  results.push(...documentsFormatted);

  // Property

  if (isAdminOrCommercial(req.user)) {
    const properties = await Property.find(
      {
        name: { $regex: t, $options: "i" },
      },
      null,
      { limit: 50, sort: { createdAt: -1 } }
    ).lean();

    const propertiesFormatted = properties.map((doc) => ({
      _id: doc._id,
      type: "property",
      context: "Bien immobilier",
      name: doc.name,
    }));

    results.push(...propertiesFormatted);
  }

  // Project
  // if (isAdminOrCommercial(req.user)) {
  //   const projects = await Project.find(
  //     {
  //       name: { $regex: t, $options: "i" },
  //     },
  //     null,
  //     { limit: 50, sort: { createdAt: -1 } }
  //   ).lean();

  //   const projectsFormatted = projects.map((doc) => ({
  //     _id: doc._id,
  //     type: "property",
  //     context: "Projet",
  //     name: doc.name,
  //   }));

  //   results.push(...propertiesFormatted);
  // }

  // Trainings
  const selector = isAdmin(req.user)
    ? {
        name: { $regex: t, $options: "i" },
      }
    : {
        name: { $regex: t, $options: "i" },
        roles: { $in: req.user.roles },
      };

  const trainings = await Training.find(selector, null, {
    limit: 50,
    sort: { createdAt: -1 },
  });

  const trainingsFormatted = trainings.map((doc) => ({
    _id: doc._id,
    type: "training",
    context: "Formation",
    name: doc.name,
  }));

  results.push(...trainingsFormatted);

  if (isAdminOrCommercial(req.user)) {
    const clients = await Client.find(
      {
        $or: [
          { displayName: { $regex: t, $options: "i" } },
          { email: { $regex: t, $options: "i" } },
        ],
      },
      null,
      { limit: 50, sort: { createdAt: -1 } }
    ).lean();

    const clientsFormatted = clients.map((client) => ({
      _id: client._id,
      type: "client",
      context: "Client",
      name: client.displayName,
    }));

    results.push(...clientsFormatted);

    const folders = await Folder.find(
      { name: { $regex: t, $options: "i" } },
      null,
      {
        sort: { createdAt: -1 },
        limit: 50,
      }
    ).exec();

    const foldersFormatted = folders.map((folder) => ({
      _id: folder._id,
      type: "folder",
      context: "Dossier",
      name: folder.name,
    }));

    results.push(...foldersFormatted);
  }

  if (isAdmin(req.user)) {
    const users = await User.find(
      {
        $or: [
          { displayName: { $regex: t, $options: "i" } },
          { email: { $regex: t, $options: "i" } },
        ],
      },
      null,
      { limit: 50, sort: { createdAt: -1 } }
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
