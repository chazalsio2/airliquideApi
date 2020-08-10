import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "apartment",
        "commercial",
        "construction_land",
        "home",
        "parking",
        "building",
      ],
    },
    area: {
      type: Number,
    },
    photos: {
      type: Array,
      default: [],
    },
    "photos.$": {
      type: String,
    },
    virtualVisitLink: {
      type: String,
      required: false,
    },
    public: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "properties",
  }
);

export default mongoose.model("Property", schema);
