import mongoose from "mongoose";

const allowedStatusValues = [
  "employeefixedcontract",
  "employeepermanentcontract",
  "entrepreneur",
  "freelance",
  "investor",
  "official",
  "retired",
  "unemployed",
  ""
];

const allowedSituationValues = [
  "single",
  "married",
  "separationofproperty",
  "legalcommunity",
  "jointpossession",
  "company"
];

const allowedTypesOfIncome = [
  "income",
  "dividends",
  "movablecapital",
  "others"
];

const allowedTypesOfRentalIncome = ["naked", "furnished", "seasonal", "others"];

const SpouseSchema = new mongoose.Schema({
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  address: {
    type: String
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  nationalite:{
    type: String
  },
  situation: {
    type: String,
    enum: allowedStatusValues
  },
  income: {
    type: String
  },
  industry: {
    type: String
  },
  seniority: {
    type: String
  },
  date:{
    type: String
  },
  lieu: {
    type:String
  }
});

const ClientAvailability = new mongoose.Schema({
  day: {
    type: String
  },
  slotNum: {
    type: Number
  }
});

var schema = new mongoose.Schema(
  {
    civility: {
      type: String,
      required: false,
      enum: ["mister", "miss", ""]
    },
    firstname: {
      type: String
    },
    lastname: {
      type: String
    },
    extern:{
      type: String
    }, 
    FormExtern:{
      type: String
    },
    lieux_de_naissance:{
      type: String
    },
    nationalite:{
        type: String
    },
    commentaire:{
      type: String
    },
    lien:{
    type: String
    },
    email: {
      type: String
    },
    birthday: {
      type: Date
    },
    phone: {
      type: String
    },
    geographicSector: {
      type: String,
      enum: ["north", "east", "west", "south"]
    },
    address: {
      type: String,
      required: false
    },
    zipcode: {
      type: String,
      required: false
    },
    city: {
      type: String,
      required: false
    },
    conseillerId:{
      type: mongoose.Types.ObjectId,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: false
    },
    referral: {
      type: String,
      enum: ["other", "socialmedia", "wordofmouth", "website","commerciale"]
    },
    referaldetails: {
      type: String,
    },
    referalconseiller:{
      type: mongoose.Types.ObjectId,
      required: false
    },
    conseillerId:{
      type: mongoose.Types.ObjectId,
      required: false
    },
    displayName: {
      type: String,
      required: false
    },
    spouse: {
      type: SpouseSchema,
      required: false,
      _id: false
    },
    address: {
      type: String,
      required: false
    },
    principalResidence: {
      type: String,
      required: false,
      enum: ["tenant", "owner", "freeofcharge"]
    },
    typesOfIncome: {
      type: Array,
      required: false
    },
    "typesOfIncome.$": {
      type: String,
      required: false,
      enum: allowedTypesOfIncome
    },
    othersTypesOfIncome: {
      type: String,
      required: false
    },
    typesOfRentalIncome: {
      type: Array,
      required: false
    },
    "typesOfRentalIncome.$": {
      type: String,
      required: false,
      enum: allowedTypesOfRentalIncome
    },
    othersTypesOfRentalIncome: {
      type: String,
      required: false
    },
    income: {
      type: Number,
      required: false
    },
    rentalIncome: {
      type: Number,
      required: false
    },
    industry: {
      type: String,
      required: false
    },
    seniority: {
      type: Number,
      required: false
    },
    situation: {
      type: String,
      required: false,
      enum: allowedSituationValues
    },
    status: {
      type: String,
      required: false,
      enum: allowedStatusValues
    },
    savings: {
      type: Number,
      required: false
    },
    availableSavings: {
      type: Number,
      required: false
    },
    desiredGrossYield: {
      type: String,
      enum: ["4to6", "6to8", "8to10", "greaterthan10"],
      required: false
    },
    projectTypes: {
      type: Array,
      default: [],
    },
    "projectTypes.$": {
      type: String,
      enum: ["search", 'sales', "coaching", "management"]
    },
    rentAmount: {
      type: Number,
      required: false
    },
    creditAmount: {
      type: Number,
      required: false
    },
    crd: {
      type: Number,
      required: false
    },
    loans: {
      type: Number,
      required: false
    },
    income: {
      type: Number
    },
    industry: {
      type: String
    },
    seniority: {
      type: Number
    },
    availabilities: {
      type: Array,
      required: false
    },
    "availabilities.$": {
      type: ClientAvailability,
      required: false
    },
    allowSaveData: {
      type: Boolean,
      required: false
    }
  },
  {
    timestamps: true,
    collection: "clients"
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

export default mongoose.model("Client", schema);
