import mongoose from "mongoose";

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
