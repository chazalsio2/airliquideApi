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
    types: {
      type: Array,
      default: [],
    },
    "types.$": { type: String, enum: ["management", "sales", "search"] },
  },
  {
    timestamps: true,
    collection: "clients",
  }
);

export default mongoose.model("Client", schema);
