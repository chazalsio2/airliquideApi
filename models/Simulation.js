import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "simulations",
  }
);

export default mongoose.model("Simulation", schema);
