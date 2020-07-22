import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

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
    "roles.$": {
      type: String,
      enum: [
        "admin",
        "commercial_agent",
        "client_sales_mandate",
        "client_management_mandate",
        "client_search_mandate",
      ],
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export default mongoose.model("User", schema);
