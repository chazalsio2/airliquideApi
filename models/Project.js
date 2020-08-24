import mongoose, { Types } from "mongoose";

const citiesList = [
  "Saint-Pierre",
  "Le Tampon",
  "Saint-Louis",
  "Saint-Joseph",
  "Saint-Philippe",
  "Sainte-Rose",
  "Petite-île",
  "Saint-Denis",
  "Sainte-Marie",
  "Sainte-Suzanne",
  "Saint-Paul",
  "Saint-Gilles les Bains",
  "Le Port",
  "La Possession",
  "Saint-Leu",
  "Etang-Salé",
  "Les Avirons",
  "Saint-André",
  "Saint-Benoit",
  "Cilaos",
  "Salazie",
  "Maïdo",
  "Dos d'Ane",
  "Sans-Soucis",
  "Le Volcan/Pas de Bellecombe",
  "Plaine des Cafres",
  "Plaine des Palmistes",
];

export const projectTypes = ["management", "sales", "search", "coaching"];

const SearchSheet = new mongoose.Schema({
  propertyType: {
    type: String,
    enum: [
      "appartment",
      "home",
      "constructionground",
      "commercial",
      "building",
      "parking",
    ],
  },
  investmentType: {
    type: String,
  },
  propertySize: {
    type: String,
    enum: ["studio", "T2", "T3", "T4", "bigger"],
  },
  propertySizeDetail: {
    type: String,
    required: false,
  },
  propertyArea: {
    type: String,
    enum: ["lessthan30", "lessthan90", "morethan90"],
  },
  land: {
    type: String,
    enum: ["optional", "priority"],
  },
  landArea: {
    type: Number,
    required: false,
  },

  searchSector: {
    type: String,
    enum: [
      "whatever",
      "tourismsector",
      "nearschool",
      "downtown",
      "specificcities",
    ],
  },
  searchSectorCities: {
    type: Array,
    required: false,
  },
  "searchSectorCities.$": {
    type: String,
    enum: citiesList,
  },
  swimmingpool: {
    type: String,
    enum: ["optional", "priority"],
  },
  varangue: {
    type: String,
    enum: ["optional", "priority"],
  },
  delay: {
    type: String,
    enum: ["soonaspossible", "lessthan6", "morethan6"],
  },
  budget: {
    type: Number,
  },
});

const SalesSheet = new mongoose.Schema({});

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    clientId: {
      type: mongoose.Types.ObjectId,
    },
    commercialId: {
      type: mongoose.Types.ObjectId,
      required: false,
    },
    type: {
      type: String,
      enum: projectTypes,
    },
    searchSheet: {
      type: SearchSheet,
      required: false,
      _id: false,
    },
    salesSheet: {
      type: SalesSheet,
      required: false,
      _id: false,
    },
    status: {
      type: String,
      default: "missing_information",
      enum: [
        "missing_information",
        "wait_project_validation",
        "wait_mandate_signature",
        // "wait_offers",
        "wait_sales_agreement",
        "wait_sales_agreement_validation",
        "wait_sales_deed",
        "wait_sales_deed_validation",
        "completed",
        "refused",
        "canceled",
      ],
    },
    investAlone: {
      type: String,
      enum: ["alone", "couple"],
      required: false,
    },
    desiredGrossYield: {
      type: String,
      enum: ["4to6", "6to8", "8to10", "greaterthan10"],
      required: false,
    },
    readyToSign: {
      type: Boolean,
      required: false,
      default: false,
    },
    refusalReason: {
      type: String,
      required: false,
    },
    mandateEnvelopeId: {
      type: String,
      required: false,
    },
    salesAgreementDocId: {
      type: Types.ObjectId,
      required: false,
    },
    salesDeedDocId: {
      type: Types.ObjectId,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "projects",
  }
);

export default mongoose.model("Project", schema);
