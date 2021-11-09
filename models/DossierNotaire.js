import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
        societe:{
          type: String
        },
        vendeur:{
          type: String
        },
        adresse:{
          type: String
        },
        Mail:{
          type: String
        },
        phone:{
          type: String
        },
        date_lieu:{
          type: String
        },
        cp_ville:{
          type: String
        },
        nationalite:{
          type: String
        },
        profession:{
          type: String
        },
        regime_matrimonial:{
          type: String
        },
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
