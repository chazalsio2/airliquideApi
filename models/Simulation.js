import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    title: {
      type: String,
    },
    propertyPrice: {
      type: Number,
      default: 0,
    },
    agencyFees: {
      type: Number,
      default: 0,
    },
    visionRFees: {
      type: Number,
      default: 0,
    },
    notaryFees: {
      type: Number,
      default: 0,
    },
    additionalWorks: {
      type: Number,
      default: 0,
    },
    furnishing: {
      type: Number,
      default: 0,
    },
    bankDepositFees: {
      type: Number,
      default: 0,
    },
    bankingFees: {
      type: Number,
      default: 0,
    },
    contributionAmount: {
      type: Number,
      default: 0,
    },
    loanAmount: {
      type: Number,
      default: 0,
    },
    durationInMonths: {
      type: Number,
      default: 0,
    },
    creditRate: {
      type: Number,
      default: 0,
    },
    creditInsuranceRate: {
      type: Number,
      default: 0,
    },
    monthlyLoanPayment: {
      type: Number,
      default: 0,
    },
    monthlyInsurancePayment: {
      type: Number,
      default: 0,
    },
    rentalGuaranteeInsurance: {
      type: Number,
      default: 0,
    },
    totalCoOwnershipCharges: {
      type: Number,
      default: 0,
    },
    propertyTax: {
      type: Number,
      default: 0,
    },
    PNOInsurance: {
      type: Number,
      default: 0,
    },
    approvedManagementCenter: {
      type: Number,
      default: 0,
    },
    accounting: {
      type: Number,
      default: 0,
    },
    electricity: {
      type: Number,
      default: 0,
    },
    water: {
      type: Number,
      default: 0,
    },
    internet: {
      type: Number,
      default: 0,
    },
    others: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "simulations",
  }
);

export default mongoose.model("Simulation", schema);
