import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    // projectId: {
    //   type: String,
    //   required: false,
    // },
    allowedRoles: {
      type: Array,
      default: [],
    },
    documentsCount: {
      type: Number,
      default: 0,
    },
    "allowedRoles.$": {
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
    collection: "folders",
  }
);

export default mongoose.model("Folder", schema);
