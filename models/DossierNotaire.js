import mongoose from "mongoose";

var schema = new mongoose.Schema(
  { 
    contactId: {
      type: mongoose.Types.ObjectId
    }
  },
  
  {
    timestamps: true,
    collection: "dossierNotaires"
  }
);

export default mongoose.model("DossierNotaire", schema);
