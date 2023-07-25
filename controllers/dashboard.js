import { generateError, isAdmin } from "../lib/utils";
import Property from "../models/Property";
import Project from "../models/Project";
import Client from "../models/Material";
import Insul_r from "../models/Insul_r";


import User from "../models/User";
import moment from "moment";
import _ from "underscore";

export async function status(){

}

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
    let zone;

    if (req.user.ZoneSector.indexOf("reunion") !== -1 ) {
      zone = "reunion"
    }
    if (req.user.ZoneSector.indexOf("maurice") !== -1 ) {
      zone = "maurice"
    }
    if (req.user.ZoneSector.indexOf("alsace") !== -1 ) {
      zone = "alsace"
    }

    const salesMandatesCount = await Project.countDocuments(
      isUserAdmin
        ? { type: "", type: "sales",ZoneSector:{$in:req.user.ZoneSector}, status: { $nin: notActiveState } }
        : {
          commercialId: userId,
          type: "sales",
          status: { $nin: notActiveState }
        }
    ).exec();

    const managementMandatesCount = await Project.countDocuments(
      isUserAdmin
        ? { status: { $nin: notActiveState },ZoneSector:{$in:req.user.ZoneSector}, type: "management" }
        : {
          commercialId: userId,
          type: "management",
          ZoneSector:{$in:req.user.ZoneSector},
          status: { $nin: notActiveState }
        }
    ).exec();

    const searchMandatesCount = await Project.countDocuments(
      isUserAdmin
        ? { status: { $nin: notActiveState },ZoneSector:{$in:req.user.ZoneSector}, type: "search" }
        : {
          commercialId: userId,
          type: "search",
          ZoneSector:{$in:req.user.ZoneSector},
          status: { $nin: notActiveState }
        }
    ).exec();

    const propertiesPublishedCount = await Property.countDocuments({
      status: "available",
      propertyStatus: "forsale",
      ZoneSector:{$in:req.user.ZoneSector},
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
          ZoneSector:{$in:req.user.ZoneSector},
          status: { $in: salesAgreementStatus }
        }
        : {
          // createdAt: { $gt: moment().startOf("year") },
          ZoneSector:{$in:req.user.ZoneSector},
          status: { $in: salesAgreementStatus },
          commercialId: userId
        }
    );

    const salesDeedCount = await Project.countDocuments(
      isUserAdmin
        ? {
          ZoneSector:{$in:req.user.ZoneSector},
          completedAt: { $gt: moment().startOf("year") },
          status: "completed"
        }
        : {
          ZoneSector:{$in:req.user.ZoneSector},
          completedAt: { $gt: moment().startOf("year") },
          status: "completed",
          commercialId: userId
        }
    );

    // we search for projects still opened (not completed, refused or canceled)
    // or projects created this current year
    const projectSelector = {
      ZoneSector:{$in:req.user.ZoneSector},
      $or: [
        {
          completedAt: { $gt: moment().startOf("year") },
          status: "completed"
        },
        {
          status: {
            $nin: ['completed', 'refused', 'canceled']
          }
        }
      ]
    }

    if (!isUserAdmin) {
      projectSelector.commercialId = userId;
    }

    const projects = await Project.find(projectSelector).lean();

    const clientEnrichedPromises = projects.map(async (project) => {
      project.client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean())
      if (project.commercialId) {
        project.commercial = await User.findById(
          project.commercialId,
          "displayName"
        ).lean();
      }
      return project;
    });

    const projectsEnriched = await Promise.all(clientEnrichedPromises);

    const projectsCompleted = _.filter(
      projectsEnriched,
      (project) => project.status === "completed" && !!project.commissionAmount
    );

    const projectsNotCompleted = _.filter(
      projectsEnriched,
      (project) =>
        project.status !== "completed" &&
        project.status !== "canceled" &&
        project.status !=="wait_purchase_offer_validation"&&
        project.status !=="wait_sales_agreement"&&
        project.status !=="wait_sales_agreement_validation"&&
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
        salesDeedCount,
        salesAgreementCount,
        provisionalCommission: Math.round(provisionalCommission * 100) / 100,
        provisionalCommissionProjects:projectsNotCompleted,
        commission: Math.round(commission * 100) / 100,
        commissionProjects:projectsCompleted
      }
    });
  } catch (e) {
    next(generateError(e.message));
  }
}
