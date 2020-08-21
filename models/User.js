import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const allowedRoles = [
  "admin",
  "commercial_agent",
  "client_sales_mandate",
  "client_management_mandate",
  "client_search_mandate",
];

var schema = new mongoose.Schema(
  {
    displayName: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    roles: {
      type: Array,
    },
    token: {
      type: String,
      default: () => uuidv4(),
    },
    active: {
      type: Boolean,
      default: false,
    },
    clientId: {
      type: mongoose.Types.ObjectId,
      required: false,
    },
    "roles.$": {
      type: String,
      enum: allowedRoles,
    },
    deactivated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export default mongoose.model("User", schema);
