import mongoose from "mongoose";
import { allowedRoles } from "./User";

var schema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    description: {
      type: String
    },
    roles: {
      type: Array
    },
    "roles.$": {
      type: String,
      enum: allowedRoles
    }
  },
  {
    timestamps: true,
    collection: "contact_categories"
  }
);

export default mongoose.model("ContactCategory", schema);
