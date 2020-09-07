import {
  generateError,
  isAdminOrCommercial,
  isSearchClient,
} from "../lib/utils";
import Simulation from "../models/Simulation";

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
      loanAmount,
      durationInMonths,
      creditRate,
      creditInsuranceRate,
      monthlyLoanPayment,
      monthlyInsurancePayment,
      rentalGuaranteeInsurance,
      totalCoOwnershipCharges,
      propertyTax,
      PNOInsurance,
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
      !loanAmount ||
      !durationInMonths ||
      !creditRate ||
      !creditInsuranceRate ||
      !monthlyLoanPayment ||
      !monthlyInsurancePayment ||
      !rentalGuaranteeInsurance ||
      !totalCoOwnershipCharges ||
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
      propertyPrice: Number(propertyPrice.replace(",", ".")) * 100,
      agencyFees: Number(agencyFees.replace(",", ".")) * 100,
      visionRFees: Number(visionRFees.replace(",", ".")) * 100,
      notaryFees: Number(notaryFees.replace(",", ".")) * 100,
      additionalWorks: Number(additionalWorks.replace(",", ".")) * 100,
      furnishing: Number(furnishing.replace(",", ".")) * 100,
      bankDepositFees: Number(bankDepositFees.replace(",", ".")) * 100,
      bankingFees: Number(bankingFees.replace(",", ".")) * 100,
      contributionAmount: Number(contributionAmount.replace(",", ".")) * 100,
      loanAmount: Number(loanAmount.replace(",", ".")) * 100,
      durationInMonths: Number(durationInMonths.replace(",", ".")) * 100,
      creditRate: Number(creditRate.replace(",", ".")),
      creditInsuranceRate: Number(creditInsuranceRate.replace(",", ".")),
      monthlyLoanPayment: Number(monthlyLoanPayment.replace(",", ".")) * 100,
      monthlyInsurancePayment:
        Number(monthlyInsurancePayment.replace(",", ".")) * 100,
      rentalGuaranteeInsurance:
        Number(rentalGuaranteeInsurance.replace(",", ".")) * 100,
      totalCoOwnershipCharges:
        Number(totalCoOwnershipCharges.replace(",", ".")) * 100,
      propertyTax: Number(propertyTax.replace(",", ".")) * 100,
      PNOInsurance: Number(PNOInsurance.replace(",", ".")) * 100,
      accounting: Number(accounting.replace(",", ".")) * 100,
      electricity: Number(electricity.replace(",", ".")) * 100,
      water: Number(water.replace(",", ".")) * 100,
      internet: Number(internet.replace(",", ".")) * 100,
      others: Number(others.replace(",", ".")) * 100,
      userId,
    }).save();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
