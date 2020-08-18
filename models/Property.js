import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  city: {
    type: String,
  },
  zipcode: {
    type: String,
  },
  address: {
    type: String,
  },
});

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    ref: {
      type: String,
      required: false,
    },
    description: {
      type: String,
    },
    fullAddress: {
      type: AddressSchema,
      required: false,
    },
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
    yearOfConstruction: {
      type: Number,
      required: false,
    },
    landArea: {
      type: Number,
      required: false,
    },
    livingArea: {
      type: Number,
      required: false,
    },
    salesPrice: {
      type: Number,
      required: false,
    },
    varangueArea: {
      type: Number,
      required: false,
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

schema.pre("save", async function (next) {
  try {
    const propertiesCount = await mongoose.models["Document"].countDocuments();
    const refTemps = `00000000${propertiesCount}`;
    this.ref = `${refTemps.substring(propertiesCount.toString().length)}`;
    next();
  } catch (e) {
    next(e);
  }
});

export default mongoose.model("Property", schema);
