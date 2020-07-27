import { v4 as uuidv4 } from "uuid";

const fakeResults = [
  {
    _id: uuidv4(),
    type: "client",
    context: "Client",
    name: "Fabrice Payet",
  },
  {
    _id: uuidv4(),
    type: "commercial",
    context: "Commercial",
    name: "Fabrice Ranguin",
  },
  {
    _id: uuidv4(),
    type: "document",
    context: "Documents",
    name: "Les secrets de l'investisseur immo",
  },
];

export async function searchTerm(req, res) {
  try {
    return res.json({ success: true, data: fakeResults });
  } catch (e) {
    return res.status(500).json({ success: false });
  }
}
