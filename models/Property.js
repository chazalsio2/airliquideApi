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

const RoomSchema = new mongoose.Schema({
  area: {
    type: Number,
    required: false,
  },
  name: {
    type: Number,
  },
  note: {
    type: String,
    required: false,
  },
});

export function getPropertyType(type) {
  // "apartment", "commercial",   "construction_land",   "home",   "parking",   "building"
  if (type === "apartment") return "Appartement";
  if (type === "commercial") return "Local commercial";
  if (type === "construction_land") return "Terrain de construction";
  if (type === "home") return "Maison";
  if (type === "parking") return "Parking / Garage";
  if (type === "building") return "Immeuble";
  return "Inconnu";
}

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    ref: {
      type: String,
      required: false,
    },
    classification: {
      type: String,
      enum: ["forsale", "hunting"],
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
    rooms: {
      type: Array,
      required: false,
    },
    "rooms.$": {
      type: RoomSchema,
      required: false,
    },
    status: {
      type: String,
      default: "available",
      enum: ["available", "unavailable"],
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
    this.name = `${getPropertyType(this.type)} ${this.livingArea} m² ${
      !!this.fullAddress ? `${this.fullAddress.city}` : ""
    }`;
    next();
  } catch (e) {
    next(e);
  }
});

export default mongoose.model("Property", schema);
