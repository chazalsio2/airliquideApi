import mongoose from "mongoose";

// Not used anymore

var schema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Types.ObjectId,
    },
    amount: {
      type: Number,
    },
    commercialId: {
      type: mongoose.Types.ObjectId,
    },
  },
  {
    timestamps: true,
    collection: "transactions",
  }
);

export default mongoose.model("Transaction", schema);
