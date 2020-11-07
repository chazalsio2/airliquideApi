import mongoose from "mongoose";

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
      required: false
    },
    floor: {
      type: String,
      required: false
    },
    outdoorParking: {
      type: String,
      required: false
    },
    coveredParking: {
      type: String,
      required: false
    },
    swimmingPool: {
      type: String,
      required: false
    },
    secureEntrance: {
      type: String,
      required: false
    },
    intercom: {
      type: String,
      required: false
    },
    view: {
      type: String,
      required: false
    },
    sanitation: {
      type: String,
      required: false
    },
    doubleGlazing: {
      type: String,
      required: false
    },
    hotWater: {
      type: String,
      required: false
    },
    airConditioner: {
      type: String,
      required: false
    },
    numberOfCoOwnershipLots: {
      type: Number,
      required: false
    },
    procedureInProgress: {
      type: Boolean,
      required: false
    },
    rentalInProgress: {
      type: Boolean,
      required: false
    },
    DPE: {
      type: Boolean,
      required: false
    },
    equippedKitchen: {
      type: String,
      required: false
    },
    electricRollerShutters: {
      type: String,
      required: false
    },
    roomDescription: {
      type: String,
      required: false
    },
    commercialName: {
      type: String
    },
    commercialPhoneNumber: {
      type: String
    },
    kitchenArea: {
      type: Number,
      required: false
    },
    bathroomArea: {
      type: Number,
      required: false
    },
    numberOfRooms: {
      type: Number,
      required: false
    },
    ref: {
      type: String,
      required: false
    },
    description: {
      type: String
    },
    propertyStatus: {
      type: String,
      enum: ["hunting", "forsale"]
    },
    type: {
      type: String,
      enum: [
        "apartment",
        "commercial",
        "construction_land",
        "home",
        "parking",
        "building"
      ]
    },
    yearOfConstruction: {
      type: Number,
      required: false
    },
    landArea: {
      type: Number,
      required: false
    },
    livingArea: {
      type: Number,
      required: false
    },
    salesPrice: {
      type: Number,
      required: false
    },
    varangueArea: {
      type: Number,
      required: false
    },
    photos: {
      type: Array,
      default: []
    },
    "photos.$": {
      type: String
    },
    virtualVisitLink: {
      type: String,
      required: false
    },
    // public: {
    //   type: Boolean,
    //   default: false
    // },
    status: {
      type: String,
      default: "available",
      enum: ["available", "unavailable"]
    },
    city: {
      type: String
    },
    address: {
      type: String
    },

    typeOfInvestment: {
      type: String
    },
    rent: {
      type: Number,
      default: 0
    },
    coOwnershipCharge: {
      type: Number,
      default: 0
    },
    assurancePNO: {
      type: Number,
      default: 0
    },
    propertyTax: {
      type: Number,
      default: 0
    },
    accounting: {
      type: Number,
      default: 0
    },
    cga: {
      type: Number,
      default: 0
    },
    divers: {
      type: Number,
      default: 0
    },
    // propertyPrice: {
    //   type: Number,
    //   default: 0
    // },
    notaryFees: {
      type: Number,
      default: 0
    },
    visionRFees: {
      type: Number,
      default: 0
    },
    agencyFees: {
      type: Number,
      default: 0
    },
    works: {
      type: Number,
      default: 0
    },
    financialExpense: {
      type: Number,
      default: 0
    },
    equipment: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: "properties"
  }
);

schema.pre("save", async function (next) {
  try {
    console.log("Pre save running");
    const propertiesCount = await mongoose.models["Document"].countDocuments();
    const refTemps = `00000000${propertiesCount}`;
    this.ref = `${refTemps.substring(propertiesCount.toString().length)}`;
    this.name = `${getPropertyType(this.type) || ""} ${this.livingArea} m² ${
      this.city || ""
    }`;
    next();
  } catch (e) {
    next(e);
  }
});

// schema.post("updateOne", async function (next) {
//   try {
//     console.log("Pre updateOne running", this)

//     const docToUpdate = await this.model.findOne(this.getQuery());
//   console.log(docToUpdate); // The document that `findOneAndUpdate()` will modify

//     const newName = `${getPropertyType(docToUpdate.type) || ""} ${docToUpdate.livingArea} m² ${
//       docToUpdate.city || ""
//     }`;
//     console.log("newName", newName)

//     this.name = newName;
//     this.save()
//     // next();
//   } catch (e) {
//     console.log("e", e)
//     // next(e);
//   }
// });

export default mongoose.model("Property", schema);
