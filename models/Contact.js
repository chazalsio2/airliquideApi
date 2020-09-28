import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    firstname: {
      type: String
    },
    lastname: {
      type: String
    },
    phone: {
      type: String
    },
    description: {
      type: String
    },
    contactCategory: {
      type: String
    }
  },
  {
    timestamps: true,
    collection: "contacts"
  }
);

export default mongoose.model("Contact", schema);
