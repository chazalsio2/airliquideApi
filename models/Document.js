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
  },
  {
    timestamps: true,
    collection: "documents",
  }
);

export default mongoose.model("Document", schema);
