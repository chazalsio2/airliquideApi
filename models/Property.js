import mongoose from "mongoose";

export function getPropertyType(type) {
  // "apartment", "commercial",   "construction_land",   "home",   "parking",   "building"
  if (type === "Appartement") return "Appartement";
  if (type === "Local commercial") return "Local commercial";
  if (type === "Terrain de construction") return "Terrain de construction";
  if (type === "Maison") return "Maison";
  if (type === "Parking / Garage") return "Parking / Garage";
  if (type === "building") return "Immeuble";
  return "Inconnu";
}

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false
    },
    matchedProject: {
      type: Array
    },
    "matchedProject.$": {
      type: mongoose.Types.ObjectId
    },
    url_matching: {
      type:String
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
    freeOfOccupation: {
      type: Boolean,
      required: false
    },
    // DPE: {
    //   type: Boolean,
    //   required: false
    // },
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
    commercialEmail: {
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
      type: String,
      required: false
    },
    propertySizeDetail: {
      type:String
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
      enum: ["hunting", "forsale", "rental"]
    },
    type: {
      type: String,
      enum: [
        "Appartement",
        "Local commercial",
        "Terrain de construction",
        "Maison",
        "Garage / Parking",
        "Immeuble"
      ]
    },
    yearOfConstruction: {
      type: Number,
      required: false
    },
    surface: {
      type: Array 
    },
    Honoraires_V_R:{
      type: String,
    },
    charges_properties:{
      type: String,
    },
    landArea: {
      type: Number,
      required: false
    },
    livingArea: {
      type: Number,
      required: false
    },
    projectId:{
      type: mongoose.Types.ObjectId
    },
    salesPrice: {
      type: Number,
      required: false
    },
    code_postale:{
      type:String
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
    public: {
      type: Boolean,
      default: false
    },
    surface: {
      type:Number
    },
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
      type: String,
    },
    cga: {
      type: String,
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
    const propertiesCount = await mongoose.models["PropertyCont"].countDocuments();
    const refTemps = `00000000${propertiesCount}`;
    this.ref = `${refTemps.substring(propertiesCount.toString().length)}`;
    //this.name = `${getPropertyType(this.type) || ""} ${this.livingArea} m² ${this.city || ""} ${this.landArea} m²`;
    this.name = `${getPropertyType(this.type) || ""} ${this.livingArea ? this.livingArea+" m²" : ""}  ${this.city || ""} ${this.landArea ? this.landArea+ " m²" : ""}`;
    next();
  } catch (e) {
    next(e);
  }
});

export default mongoose.model("Property", schema);
