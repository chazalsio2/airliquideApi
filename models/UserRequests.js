import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    equipmentType:{
      type: String,
    },
    status:{
      type: String
    },
    user_id:{
      type: mongoose.Types.ObjectId
    }
  },
  {
    timestamps: true,
    collection: "UserRequests"
  }
);


export default mongoose.model("UserRequests", schema);
