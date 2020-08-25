import { generateError, isAdmin } from "../lib/utils";
import Property from "../models/Property";
import Project from "../models/Project";
import ProjectEvent from "../models/ProjectEvent";

import moment from "moment";
import _ from "underscore";
import Transaction from "../models/Transaction";

export async function getDashboardData(req, res, next) {
  try {
    const userId = req.user._id;
    const isUserAdmin = isAdmin(req.user);
    // "management", "sales", "search", "coaching"

    const activeStatus = [
      "wait_offers",
      "wait_sales_agreement",
      "wait_sales_agreement_validation",
      "wait_sales_deed",
      "wait_sales_deed_validation",
    ];

    const salesMandatesCount = await Project.countDocuments(
      isUserAdmin
        ? { type: "", type: "sales", status: { $in: activeStatus } }
        : { commercialId: userId, type: "sales", status: { $in: activeStatus } }
    ).exec();

    const managementMandatesCount = await Project.countDocuments(
      isUserAdmin
        ? { status: { $in: activeStatus }, type: "management" }
        : {
            commercialId: userId,
            type: "management",
            status: { $in: activeStatus },
          }
    ).exec();

    const searchMandatesCount = await Project.countDocuments(
      isUserAdmin
        ? { status: { $in: activeStatus }, type: "search" }
        : {
            commercialId: userId,
            type: "search",
            status: { $in: activeStatus },
          }
    ).exec();

    const propertiesPublishedCount = await Property.countDocuments({
      status: "available",
      public: true,
    }).exec();

    // TODO: do not work
    const propertiesClosedCount = await Property.countDocuments({
      status: "closed",
    }).exec();

    const projectAssigned = await Project.find({
      commercialId: userId,
      status: activeStatus,
    }).lean();

    const salesAgreementCount = await ProjectEvent.countDocuments(
      isUserAdmin
        ? {
            createdAt: { $gt: moment().startOf("month") },
            type: "sales_agreement_validate",
          }
        : {
            createdAt: { $gt: moment().startOf("month") },
            type: "sales_agreement_validate",
            projectId: projectAssigned.map((p) => p._id),
          }
    );

    const salesDeedCount = await ProjectEvent.countDocuments(
      isUserAdmin
        ? {
            createdAt: { $gt: moment().startOf("month") },
            type: "sales_deed_validate",
          }
        : {
            createdAt: { $gt: moment().startOf("month") },
            type: "sales_deed_validate",
            projectId: projectAssigned.map((p) => p._id),
          }
    );

    const transactionSelector = isUserAdmin
      ? { createdAt: { $gt: moment().startOf("month") } }
      : { createdAt: { $gt: moment().startOf("month") }, commercialId: userId };

    const transactions = await Transaction.find(transactionSelector).lean();

    const commercialCommission = _.reduce(
      transactions,
      (memo, transaction) => memo + transaction.amount,
      0
    );

    return res.json({
      success: true,
      data: {
        salesMandatesCount,
        managementMandatesCount,
        searchMandatesCount,
        propertiesPublishedCount,
        propertiesClosedCount,
        salesDeedCount,
        salesAgreementCount,
        commercialCommission: isUserAdmin
          ? Math.round(commercialCommission / 100)
          : Math.round((commercialCommission * 0.6) / 100),
      },
    });
  } catch (e) {
    next(generateError(e.message));
  }
}
