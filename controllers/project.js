import { v4 as uuidv4 } from "uuid";
import Client from "../models/Client";
import User from "../models/User";
import moment from "moment";

//"management", "search", "sales"

async function getMockCurrentProjects() {
  return [
    {
      _id: uuidv4(),
      type: "management",
      client: await Client.findOne().lean(),
      commercial: await User.findOne({ roles: "commercial_agent" }).lean(),
      context: "Client",
      commercialId: uuidv4(),
      createdAt: moment(),
      status: "draft",
    },
    {
      _id: uuidv4(),
      type: "search",
      client: await Client.findOne().lean(),
      commercial: await User.findOne({ roles: "commercial_agent" }).lean(),
      context: "Commercial",
      commercialId: uuidv4(),
      createdAt: moment(),
      status: "draft",
    },
    {
      _id: uuidv4(),
      type: "sales",
      context: "Documents",
      client: await Client.findOne().lean(),
      commercial: await User.findOne({ roles: "commercial_agent" }).lean(),
      commercialId: uuidv4(),
      createdAt: moment(),
      status: "draft",
    },
  ];
}

export async function getProjects(req, res) {
  try {
    return res.json({ success: true, data: await getMockCurrentProjects() });
  } catch (e) {
    return res.status(500).json({ success: false });
  }
}
