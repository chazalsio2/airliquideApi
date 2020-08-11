import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    url: {
      type: String,
    },
    type: {
      type: String,
      enum: ["pdf", "youtube"],
    },
    roles: {
      type: Array,
    },
    "roles.$": {
      type: String,
      enum: [
        "commercial_agent",
        "client_sales_mandate",
        "client_management_mandate",
        "client_search_mandate",
      ],
    },
  },
  {
    timestamps: true,
    collection: "trainings",
  }
);

export default mongoose.model("Training", schema);
