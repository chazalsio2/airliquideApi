import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export default mongoose.model("User", schema);
