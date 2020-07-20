import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "clients",
  }
);

export default mongoose.model("Client", schema);
