import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    clientId: {
      type: mongoose.Types.ObjectId,
    },
  },
  {
    timestamps: true,
    collection: "mandates",
  }
);

export default mongoose.model("Mandate", schema);
