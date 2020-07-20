import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

var schema = new mongoose.Schema(
  {
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
        "commercial",
        "sales_mandate",
        "management_mandate",
        "purchase_mandate",
      ],
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export default mongoose.model("User", schema);
