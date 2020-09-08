import {
  generateError,
  isAdminOrCommercial,
  isSearchClient,
} from "../lib/utils";
import _ from "underscore";
import Simulation from "../models/Simulation";

function getStringOrNumber(value) {
  const res = _.isString(value) ? Number(value.replace(",", ".")) : value;
  return res;
}

export async function getSimulations(req, res, next) {
  try {
    const userId = req.user._id;

    const simulations = await Simulation.find({ userId }, null, {
      sort: { createdAt: -1 },
    }).lean();

    return res.json({ success: true, data: simulations });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function createSimulation(req, res, next) {
  try {
    const userId = req.user._id;
    console.log("req.body", req.body);
    const {
      title,
      propertyPrice,
      agencyFees,
      visionRFees,
      notaryFees,
      additionalWorks,
      furnishing,
      bankDepositFees,
      bankingFees,
      contributionAmount,
      durationInMonths,
      creditRate,
      creditInsuranceRate,
      monthlyLoanPayment,
      monthlyRentalIncome,
      monthlyInsurancePayment,
      rentalGuaranteeInsurance,
      totalCoOwnershipCharges,
      propertyTax,
      PNOInsurance,
      approvedManagementCenter,
      accounting,
      electricity,
      internet,
      water,
      others,
    } = req.body;

    if (
      !title ||
      !propertyPrice ||
      !agencyFees ||
      !visionRFees ||
      !notaryFees ||
      !additionalWorks ||
      !furnishing ||
      !bankDepositFees ||
      !bankingFees ||
      !contributionAmount ||
      !durationInMonths ||
      !creditRate ||
      !creditInsuranceRate ||
      !monthlyRentalIncome ||
      !monthlyLoanPayment ||
      !monthlyInsurancePayment ||
      !rentalGuaranteeInsurance ||
      !totalCoOwnershipCharges ||
      !approvedManagementCenter ||
      !propertyTax ||
      !PNOInsurance ||
      !accounting ||
      !electricity ||
      !internet ||
      !water ||
      !others
    ) {
      throw new Error("Missing fields");
    }

    const isAuthorized =
      isAdminOrCommercial(req.user) || isSearchClient(req.user);

    if (!isAuthorized) {
      throw new Error("Not authorized");
    }

    await new Simulation({
      title,
      propertyPrice: getStringOrNumber(propertyPrice) * 100,
      agencyFees: getStringOrNumber(agencyFees) * 100,
      visionRFees: getStringOrNumber(visionRFees) * 100,
      notaryFees: getStringOrNumber(notaryFees) * 100,
      additionalWorks: getStringOrNumber(additionalWorks) * 100,
      furnishing: getStringOrNumber(furnishing) * 100,
      bankDepositFees: getStringOrNumber(bankDepositFees) * 100,
      bankingFees: getStringOrNumber(bankingFees) * 100,
      contributionAmount: getStringOrNumber(contributionAmount) * 100,
      durationInMonths: getStringOrNumber(durationInMonths),
      creditRate: getStringOrNumber(creditRate),
      creditInsuranceRate: getStringOrNumber(creditInsuranceRate),
      monthlyLoanPayment: getStringOrNumber(monthlyLoanPayment) * 100,
      monthlyRentalIncome: getStringOrNumber(monthlyRentalIncome) * 100,
      monthlyInsurancePayment: getStringOrNumber(monthlyInsurancePayment) * 100,
      rentalGuaranteeInsurance:
        getStringOrNumber(rentalGuaranteeInsurance) * 100,
      totalCoOwnershipCharges: getStringOrNumber(totalCoOwnershipCharges) * 100,
      propertyTax: getStringOrNumber(propertyTax) * 100,
      PNOInsurance: getStringOrNumber(PNOInsurance) * 100,
      approvedManagementCenter:
        getStringOrNumber(approvedManagementCenter) * 100,
      accounting: getStringOrNumber(accounting) * 100,
      electricity: getStringOrNumber(electricity) * 100,
      water: getStringOrNumber(water) * 100,
      internet: getStringOrNumber(internet) * 100,
      others: getStringOrNumber(others) * 100,
      userId,
    }).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
