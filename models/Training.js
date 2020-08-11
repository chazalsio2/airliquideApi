import mongoose from "mongoose";
import { allowedRoles } from "./User";

export const allowedTrainingTypes = ["pdf", "youtube"];

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    url: {
      type: String,
    },
    // type: {
    //   type: String,
    //   enum: allowedTrainingTypes,
    // },
    roles: {
      type: Array,
    },
    "roles.$": {
      type: String,
      enum: allowedRoles,
    },
  },
  {
    timestamps: true,
    collection: "trainings",
  }
);

export default mongoose.model("Training", schema);
