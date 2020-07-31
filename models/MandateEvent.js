import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    mandateId: {
      type: mongoose.Types.ObjectId,
    },
    type: {
      type: String,
      enum: ["mandate_creation", "mandate_validation"],
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
    collection: "mandate_events",
  }
);

export default mongoose.model("MandateEvent", schema);
