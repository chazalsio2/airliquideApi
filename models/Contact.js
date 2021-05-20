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
    contactCategoryId: {
      type: mongoose.Types.ObjectId
    }
  },
  {
    timestamps: true,
    collection: "contacts"
  }
);

export default mongoose.model("Contact", schema);
