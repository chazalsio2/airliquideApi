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
    displayName: {
      type: String,
      required: false,
    },
    "types.$": { type: String, enum: ["management", "sales", "search"] },
  },
  {
    timestamps: true,
    collection: "clients",
  }
);

schema.pre("save", async function (next) {
  try {
    this.displayName = `${this.firstName} ${this.lastname}`;
    next();
  } catch (e) {
    next(e);
  }
});

export default mongoose.model("Client", schema);
