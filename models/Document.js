import mongoose from "mongoose";
import User from "./User";
import Folder from "./Folder";

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    url: {
      type: String,
      required: false,
    },
    authorDisplayName: {
      type: String,
    },
    authorUserId: {
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
    contentType: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "documents",
  }
);

schema.pre("save", async function (next) {
  try {
    if (this.authorUserId) {
      const user = await User.findById(this.authorUserId).lean();
      if (user) {
        this.authorDisplayName = user.displayName;
      }
    }

    const folderDocumentCount = await mongoose.models["Document"]
      .countDocuments({
        folderId: this.folderId,
      })
      .exec();

    await Folder.updateOne(
      { _id: this.folderId },
      { $set: { documentsCount: folderDocumentCount } }
    ).exec();
    next();
  } catch (e) {
    next(e);
  }
});

export default mongoose.model("Document", schema);
