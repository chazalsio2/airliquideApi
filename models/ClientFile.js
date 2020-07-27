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
    collection: "client_files",
  }
);

export default mongoose.model("ClientFile", schema);
