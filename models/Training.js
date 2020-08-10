import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    url: {
      type: String,
    },
    youtubeLink: {
      type: String,
    },
    urlLink: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "trainings",
  }
);

export default mongoose.model("Training", schema);
