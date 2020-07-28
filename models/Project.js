import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    status: {
      type: String,
      allowedValue: ["draft"],
      default: "draft",
    },
    type: {
      type: String,
      enum: ["management", "search", "sales"],
    },
    commercialId: {
      type: mongoose.Types.ObjectId,
      required: false,
    },
    clientFile: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "projects",
  }
);

export default mongoose.model("Project", schema);
