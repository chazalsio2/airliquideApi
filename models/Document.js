import mongoose from "mongoose";
import User from "./User";
import Folder from "./Folder";

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    moment_cle:{
      type: String,
    },
    montant_hors_taxes: {
      type: String,
    },
    montant_ttc:{
      type: String,
    },
    url: {
      type: String,
      required: false,
    },
    authorDisplayName: {
      type: String,
      required: false,
    },
    authorUserId: {
      type: mongoose.Types.ObjectId,
      required: false,
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
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "public"
    }
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
