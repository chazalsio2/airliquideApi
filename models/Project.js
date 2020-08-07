import mongoose from "mongoose";
import ProjectEvent from "./ProjectEvent";
import Folder from "./Folder";

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
        "refused",
        "canceled",
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
    // await Folder({
    //   projectId: this._id,
    // }).save();
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
