import mongoose from "mongoose";
import User from "./User";

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
        "project_validation",
        "project_refused",
        "project_accepted",
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
      this.authorDisplayName = user.displayName;
    }
    next();
  } catch (e) {
    next(e);
  }
});

export default mongoose.model("ProjectEvent", schema);
