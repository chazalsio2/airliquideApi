import mongoose from "mongoose";
import ProjectEvent from "./ProjectEvent";

export const projectTypes = ["management", "sales", "search", "coaching"];

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    clientId: {
      type: mongoose.Types.ObjectId,
    },
    commercialId: {
      type: mongoose.Types.ObjectId,
      required: false,
    },
    type: {
      type: String,
      enum: projectTypes,
    },
    status: {
      type: String,
      default: "missing_information",
      enum: [
        "missing_information",
        "draft",
        "wait_mandate_signature",
        "wait_offers",
        "wait_sales_agreement",
        "wait_sales_deed",
        "completed",
      ],
    },
  },
  {
    timestamps: true,
    collection: "projects",
  }
);

schema.pre("save", async function (next) {
  try {
    await ProjectEvent({
      projectId: this._id,
      type: "project_creation",
    }).save();
    next();
  } catch (e) {
    next(e);
  }
});

export default mongoose.model("Project", schema);
