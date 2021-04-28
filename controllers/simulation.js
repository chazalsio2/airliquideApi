import {
  generateError,
  isAdminOrCommercial,
  isSearchClient,
  isCoaching
} from "../lib/utils";
import _ from "underscore";
import Simulation from "../models/Simulation";

const LIMIT_BY_PAGE = 4;

function getStringOrNumber(value) {
  const res = _.isString(value) ? Number(value.replace(",", ".")) : value;
  return res;
}

export async function getSimulations(req, res, next) {
  try {
    const { page = "" } = req.query;
    const pageNumber = Number(page) || 1;
    const userId = req.user._id;

    const selector = { userId };
    const simulationCount = await Simulation.countDocuments(selector).exec();
    const pageCount = Math.ceil(simulationCount / LIMIT_BY_PAGE);

    const simulations = await Simulation.find(selector, null, {
      sort: { createdAt: -1 },
      skip: (pageNumber - 1) * LIMIT_BY_PAGE,
      limit: LIMIT_BY_PAGE
    }).lean();

    return res.json({
      success: true,
      data: { simulations, pageCount, total: simulationCount }
    });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function editSimulation(req, res, next) {
  try {
    const userId = req.user._id;
    const { simulationId } = req.params;

    const simulation = await Simulation.findById(simulationId).exec();

    if (!simulation) {
      throw new Error("Simulation not found");
    }

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
      others
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
//coaching
    const isAuthorized =
      isAdminOrCommercial(req.user) || isSearchClient(req.user) || isCoaching(req.user);

    if (!isAuthorized) {
      throw new Error("Not authorized");
    }

    if (simulation.userId.toString() !== userId.toString()) {
      throw new Error("Not authorized");
    }

    await Simulation.updateOne(
      { _id: simulationId },
      {
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
        monthlyInsurancePayment:
          getStringOrNumber(monthlyInsurancePayment) * 100,
        rentalGuaranteeInsurance:
          getStringOrNumber(rentalGuaranteeInsurance) * 100,
        totalCoOwnershipCharges:
          getStringOrNumber(totalCoOwnershipCharges) * 100,
        propertyTax: getStringOrNumber(propertyTax) * 100,
        PNOInsurance: getStringOrNumber(PNOInsurance) * 100,
        approvedManagementCenter:
          getStringOrNumber(approvedManagementCenter) * 100,
        accounting: getStringOrNumber(accounting) * 100,
        electricity: getStringOrNumber(electricity) * 100,
        water: getStringOrNumber(water) * 100,
        internet: getStringOrNumber(internet) * 100,
        others: getStringOrNumber(others) * 100,
        userId
      }
    ).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function deleteSimulation(req, res, next) {
  try {
    const userId = req.user._id;
    const { simulationId } = req.params;

    const simulation = await Simulation.findById(simulationId).exec();

    if (!simulation) {
      throw new Error("Simulation not found");
    }
//coaching
    const isAuthorized =
      isAdminOrCommercial(req.user) || isSearchClient(req.user) || isCoaching(req.user);

    if (!isAuthorized) {
      throw new Error("Not authorized");
    }

    if (simulation.userId.toString() !== userId.toString()) {
      throw new Error("Not authorized");
    }

    await Simulation.deleteOne({ _id: simulationId }).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function createSimulation(req, res, next) {
  try {
    const userId = req.user._id;
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
      others
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
//coaching
    const isAuthorized =
      isAdminOrCommercial(req.user) || isSearchClient(req.user) || isCoaching(req.user);

    if (!isAuthorized) {
      throw new Error("Not authorized");
    }

    const propertyData = {
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
      userId
    };

    await new Simulation(propertyData).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
