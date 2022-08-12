import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    dateblocageAt:{
      type: Date,
    },
    userId:{
      type: Array
    },
    "userId.$": {
      type: mongoose.Types.ObjectId
    },
    descriptionBloced:{
      type:Array,
    },
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
    },
    email: {
      type: String
    },
    address: {
      type: String
    }
  },
  
  {
    timestamps: true,
    collection: "contacts"
  }
);

export default mongoose.model("Contact", schema);
