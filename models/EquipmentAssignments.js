import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    equipmentId:{
      type: mongoose.Types.ObjectId,
    },
    user_id:{
      type: mongoose.Types.ObjectId
    },
    status:{
      type: String
    }
  },
  {
    timestamps: true,
    collection: "EquipmentAssignments"
  }
);


export default mongoose.model("EquipmentAssignments", schema);
