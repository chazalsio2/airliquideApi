import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    url: {
      type: String,
    },
    authorDisplayName: {
      type: String,
    },
    authorUserId: {
      type: mongoose.Types.ObjectId,
    },
    clientId: {
      type: mongoose.Types.ObjectId,
    },
    projectId: {
      type: String,
      optional: true,
    },
    folderId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "documents",
  }
);

export default mongoose.model("Document", schema);
