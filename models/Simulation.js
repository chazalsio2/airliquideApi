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
    },
    agencyFees: {
      type: Number,
    },
    visionRFees: {
      type: Number,
    },
    notaryFees: {
      type: Number,
    },
    additionalWorks: {
      type: Number,
    },
    furnishing: {
      type: Number,
    },
    bankDepositFees: {
      type: Number,
    },
    bankingFees: {
      type: Number,
    },
    contributionAmount: {
      type: Number,
    },
    loanAmount: {
      type: Number,
    },
    durationInMonths: {
      type: Number,
    },
    creditRate: {
      type: Number,
    },
    creditInsuranceRate: {
      type: Number,
    },
    monthlyLoanPayment: {
      type: Number,
    },
    monthlyInsurancePayment: {
      type: Number,
    },
    rentalGuaranteeInsurance: {
      type: Number,
    },
    totalCoOwnershipCharges: {
      type: Number,
    },
    propertyTax: {
      type: Number,
    },
    PNOInsurance: {
      type: Number,
    },
    accounting: {
      type: Number,
    },
    electricity: {
      type: Number,
    },
    water: {
      type: Number,
    },
    internet: {
      type: Number,
    },
    others: {
      type: Number,
    },
  },
  {
    timestamps: true,
    collection: "simulations",
  }
);

export default mongoose.model("Simulation", schema);
