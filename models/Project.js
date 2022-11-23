import mongoose, { Types } from "mongoose";
import cities from '../data/cities.json'

const ClientAvailability = new mongoose.Schema({
  day: {
    type: String
  },
  slotNum: {
    type: Number
  }
});

const citiesList = cities.map(c => `${c["COMMUNE"]} (${c["CODE POSTAL"]})`)

export const projectTypes = ["management", "sales", "search", "coaching"];

const DocSubset = new mongoose.Schema({
originNameMandate: String,
  name: String,
  url: String,
  num_mandat:String,
  date_mandat:String,
  type_mandat: String ,
  origine_mandate: String,
  honoraires_previsionnels: String,
  commerciaux: String
});

const SalesSheet = new mongoose.Schema({
  hasCreditOnSalesProperty: {
    type: String
  },
  propertyType: {
    type: String
  },
  propertySize: {
    type: Number
  },
  propertyLandArea:{
    type: Number
  },
  propertySizeDetails:{
    type: String
  },
  livingArea: {
    type: Number
  },
  landArea: {
    type: Number,
    
  },
  landconstcd: {
    type: String
  },
  fullAddress: {
    type: String
  },
  fullcode_postale:{
    type:String
  },
  fullville:{
    type:String
  },
  proprietaire:{
    type:String
  },
  terrai_y_n:{
    type:String
  },
  ref_cadastrale:{
    type:String
  },
  zone:{
    type:String
  },
  workEstimate: {
    type: String
  },
  priceEstimate: {
    type: String
  },
  workNeeded: {
    type: String
  },
  reasonForTheSale: {
    type: String
  },
  delay: {
    type: String
  },
  readyToSign: {
    type: String
  },
  nextAvailabilities: {
    type: Array
  },
  "nextAvailabilities.$": {
    type: ClientAvailability
  }
});

const SearchSheet = new mongoose.Schema({
  propertyType: {
    type: String,
    enum: [
      "Appartement",
      "Maison",
      "Terrain de construction",
      "Local commercial",
      "Immeuble",
      "Parking / Garage"
    ]
  },
  investmentType: {
    type: String
  },
  propertySize: {
    type: Number,
  },
  propertyLandArea:{
    type: Number
  },
  propertySizeDetail: {
    type: String,
    required: false
  },
  propertyArea: {
    type: String,
    enum: ["lessthan30", "lessthan90", "morethan90"]
  },
  additionalInfos: {
    type: String,
    required: false
  },
  land: {
    type: String,
    enum: ["optional", "priority"]
  },
 
  searchSector: {
    type: String,
    enum: [
      "whatever",
      "tourismsector",
      "nearschool",
      "downtown",
      "specificcities"
    ]
  },
  searchSectorCities: {
    type: Array,
    required: false
  },
  "searchSectorCities.$": {
    type: String,
    enum: citiesList
  },
  swimmingpool: {
    type: String,
    enum: ["optional", "priority"]
  },
  varangue: {
    type: String,
    enum: ["optional", "priority"]
  },
  delay: {
    type: String,
    enum: ["soonaspossible", "lessthan6", "morethan6"]
  },
  budget: {
    type: Number
  },
  Typmoney: {
    type: String
  },
  budget_$: {
    type: Number
  },
  budget_Rs: {
    type: Number
  }
});

const schema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    clientId: {
      type: mongoose.Types.ObjectId
    },
    projectname:{
      type: String
    },
    dossiernotaireId: {
      type: mongoose.Types.ObjectId,
      required: false
    },
    commercialId:{
      type: mongoose.Types.ObjectId
    },
    type: {
      type: String,
      enum: projectTypes
    },
    ZoneSector:{
      type: String,
      enum: ["reunion", "maurice", "alsace"]
    },
    searchSheet: {
      type: SearchSheet,
      required: false,
      _id: false
    },
    matchedProperties: {
      type: Array
    },
    "matchedProperties.$": {
      type: Types.ObjectId
    },
    salesSheet: {
      type: SalesSheet,
      required: false,
      _id: false
    },
    status: {
      type: String,
      default: "missing_information",
      enum: [
        "missing_information",
        "wait_project_validation",
        "wait_mandate",
        "wait_mandate_validation",
        "wait_purchase_offer",
        "wait_purchase_offer_validation",
        "wait_sales_agreement",
        "wait_sales_agreement_validation",
        "wait_loan_offer",
        "wait_loan_offer_validation",
        "wait_sales_deed",
        "wait_sales_deed_validation",
        "completed",
        "refused",
        "canceled"
      ]
    },
    investAlone: {
      type: String,
      enum: ["alone", "couple"],
      required: false
    },
    desiredGrossYield: {
      type: String,
      enum: ["4to6", "6to8", "8to10", "greaterthan10"],
      required: false
    },
    readyToSign: {
      type: Boolean,
      required: false,
      default: false
    },
    refusalReason: {
      type: String,
      required: false
    },
    mandateEnvelopeId: {
      type: String,
      required: false
    },
    mandateDocId: {
      type: Types.ObjectId,
      required: false
    },
    mandateDoc: {
      type: DocSubset,
      required: false
    },
    mandateDate: {
      type: Date,
      required: false
    },
    salesAgreementDate: {
      type: Date,
      required: false
    },
    completedAt: {
      type: Date,
      required: false
    },
    salesAgreementDocId: {
      type: Types.ObjectId,
      required: false
    },
    salesDeedDocId: {
      type: Types.ObjectId,
      required: false
    },
    purchaseOfferDocId: {
      type: Types.ObjectId,
      required: false
    },
    loanOfferDocId: {
      type: Types.ObjectId,
      required: false
    },
    salesDeedDoc: {
      type: DocSubset,
      required: false
    },
    salesAgreementDoc: {
      type: DocSubset,
      required: false
    },
    purchaseOfferDoc: {
      type: DocSubset,
      required: false
    },
    loanOfferDoc: {
      type: DocSubset,
      required: false
    },
    cancellationReason: {
      type: String,
      required: false
    },
    preValidationState: {
      type: Boolean,
      default: false
    },
    commissionAmount: {
      type: Number,
      required: false
    },
    note: {
      type: String,
      required: false
    },
    commercialPourcentage: {
      type: Number,
      required: false,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true,
    collection: "projects"
  }
);

export default mongoose.model("Project", schema);
