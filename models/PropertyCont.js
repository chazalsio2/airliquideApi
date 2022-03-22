import mongoose from "mongoose";
const schema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: false
      }
    },
    {
        timestamps: true,
        collection: "propertiesCont"
      }
    );
export default mongoose.model("PropertyCont", schema);
