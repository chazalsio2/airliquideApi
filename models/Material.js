import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    type:{
      type: String,
    },
    model:{
      type: String,
    },
    nom:{
      type: String,
    },
    num_seri:{
      type: String
    },
    user_id:{
      type: mongoose.Types.ObjectId
    }
  },
  {
    timestamps: true,
    collection: "materials"
  }
);

schema.pre("save", async function (next) {
  try {
    this.displayName = `${this.firstname} ${this.lastname}`;
    next();
  } catch (e) {
    next(e);
  }
});

export default mongoose.model("Material", schema);
