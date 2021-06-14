import { generateError, isAdmin } from "../lib/utils";
import Property from "../models/Property";
import Project from "../models/Project";

import moment from "moment";
import _ from "underscore";

export async function getDashboardData(req, res, next) {
  try {
    const userId = req.user._id;
    const isUserAdmin = isAdmin(req.user);

    function computeCommission(comm, pourcentage = 50) {
      if (isUserAdmin) {
        return Math.round(comm / 100);
      }

      if (!pourcentage) {
        return 0;
      }
      const result = Math.round((comm / 100 / 1.085) * pourcentage) / 100;
      return result;
    }

    const notActiveState = [
      "completed",
      "refused",
      "canceled",
      "wait_project_validation",
      "missing_information",
      "wait_mandate",
      "wait_mandate_validation"
    ];

    const salesMandatesCount = await Project.countDocuments(
      isUserAdmin
        ? { type: "", type: "sales", status: { $nin: notActiveState } }
        : {
          commercialId: userId,
          type: "sales",
          status: { $nin: notActiveState }
        }
    ).exec();

    const managementMandatesCount = await Project.countDocuments(
      isUserAdmin
        ? { status: { $nin: notActiveState }, type: "management" }
        : {
          commercialId: userId,
          type: "management",
          status: { $nin: notActiveState }
        }
    ).exec();

    const searchMandatesCount = await Project.countDocuments(
      isUserAdmin
        ? { status: { $nin: notActiveState }, type: "search" }
        : {
          commercialId: userId,
          type: "search",
          status: { $nin: notActiveState }
        }
    ).exec();

    const propertiesPublishedCount = await Property.countDocuments({
      status: "available",
      propertyStatus: "forsale"
      // public: true
    }).exec();

    // TODO: do not work
    // const propertiesClosedCount = await Property.countDocuments({
    //   status: "closed"
    // }).exec();

    const salesAgreementStatus = [
      "wait_loan_offer",
      "wait_loan_offer_validation",
      "wait_sales_deed",
      "wait_sales_deed_validation"
    ];

    const salesAgreementCount = await Project.countDocuments(
      isUserAdmin
        ? {
          // createdAt: { $gt: moment().startOf("year") },
          status: { $in: salesAgreementStatus }
        }
        : {
          // createdAt: { $gt: moment().startOf("year") },
          status: { $in: salesAgreementStatus },
          commercialId: userId
        }
    );

    const salesDeedCount = await Project.countDocuments(
      isUserAdmin
        ? {
          createdAt: { $gt: moment().startOf("year") },
          status: "completed"
        }
        : {
          createdAt: { $gt: moment().startOf("year") },
          status: "completed",
          commercialId: userId
        }
    );

    const projectSelector = isUserAdmin
      ? { createdAt: { $gt: moment().startOf("year") } }
      : { createdAt: { $gt: moment().startOf("year") }, commercialId: userId };

    const projects = await Project.find(projectSelector).lean();

    const projectsCompleted = _.filter(
      projects,
      (project) => project.status === "completed" && !!project.commissionAmount
    );

    const projectsNotCompleted = _.filter(
      projects,
      (project) =>
        project.status !== "completed" &&
        project.status !== "canceled" &&
        !!project.commissionAmount
    );

    const commission = _.reduce(
      projectsCompleted,
      (memo, project) =>
        memo +
        computeCommission(
          project.commissionAmount,
          project.commercialPourcentage
        ),
      0
    );
    const provisionalCommission = _.reduce(
      projectsNotCompleted,
      (memo, project) =>
        memo +
        computeCommission(
          project.commissionAmount,
          project.commercialPourcentage
        ),
      0
    );

    return res.json({
      success: true,
      data: {
        salesMandatesCount,
        managementMandatesCount,
        searchMandatesCount,
        propertiesPublishedCount,
        // propertiesClosedCount,
        salesDeedCount,
        salesAgreementCount,
        provisionalCommission: Math.round(provisionalCommission * 100) / 100,
        commission: Math.round(commission * 100) / 100
      }
    });
  } catch (e) {
    next(generateError(e.message));
  }
}
