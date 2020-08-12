import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Types.ObjectId,
    },
    type: {
      type: String,
      enum: ["project_creation", "form_completion", "project_validation"],
    },
    authorUserId: {
      type: mongoose.Types.ObjectId,
      required: false,
    },
    authorDisplayName: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "project_events",
  }
);

export default mongoose.model("ProjectEvent", schema);
