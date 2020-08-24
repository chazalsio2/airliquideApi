import mongoose from "mongoose";
import User from "./User";

const DocumentSubsetSchema = new mongoose.Schema({
  name: String,
  url: String,
});

var schema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Types.ObjectId,
    },
    type: {
      type: String,
      enum: [
        "project_creation",
        "form_completion",
        "project_accepted",
        "project_refused",
        "mandate_signature_done",
        "sales_agreement_added",
        "sales_agreement_accepted",
        "sales_agreement_refused",
        "sales_deed",
        "sales_deed_accepted",
        "sales_deed_refused",
        "project_completed",
        "project_canceled",
      ],
    },
    authorUserId: {
      type: mongoose.Types.ObjectId,
      required: false,
    },
    authorDisplayName: {
      type: String,
      required: false,
    },
    documentId: {
      type: mongoose.Types.ObjectId,
      required: false,
    },
    document: {
      type: DocumentSubsetSchema,
      required: false,
    },
    reason: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "project_events",
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

    if (this.documentId) {
      const doc = await Document.findOne({ _id: documentId }).lean();
      if (doc) {
        this.document = { name: doc.name, url: doc.url };
      }
    }

    next();
  } catch (e) {
    next(e);
  }
});

export default mongoose.model("ProjectEvent", schema);
