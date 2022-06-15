import mongoose from "mongoose";

var schema = new mongoose.Schema({
  firstname:{
    type:String
  },
  lastname:{
    type:String
  },
  email:{
    type:String
  },
  phone:{
    type:String
  },
  city:{
    type:String
  },
  serviceType:{
    type:String
  }
},

{
    timestamps: true,
    collection: "insul_r"
  }

);

export default mongoose.model("Insul_r", schema);

