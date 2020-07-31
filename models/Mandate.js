import mongoose from "mongoose";
import MandateEvent from "./MandateEvent";

export const mandateTypes = ["management", "sales", "search"];

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    clientId: {
      type: mongoose.Types.ObjectId,
    },
    type: {
      type: String,
      enum: mandateTypes,
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
    collection: "mandates",
  }
);

schema.pre("save", async function (next) {
  try {
    await MandateEvent({
      mandateId: this._id,
      type: "mandate_creation",
    }).save();
    next();
  } catch (e) {
    next(e);
  }
});

export default mongoose.model("Mandate", schema);
