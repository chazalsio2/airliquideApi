import moment from "moment";
import Insul_r from "../models/Insul_r";
import User from "../models/User";
import { generateError } from "../lib/utils";
import Project, { projectTypes } from "../models/Project";
import ProjectEvent from "../models/ProjectEvent";
import { sendNewInsul_rWebhook } from '../services/webhook.service';

export async function getInsul_rs(req, res, next) {
    try {
      const LIMIT_BY_PAGE = 10;
      const { page = "", filter = "", types } = req.query;
      const pageNumber = Number(page) || 1;
      const selector = {
        $or: [
          {
            firstname: { $regex: filter, $options: "i" }
          },
          {
            lastname: { $regex: filter, $options: "i" }
          },
          {
            displayName: { $regex: filter, $options: "i" }
          },
          {
            email: { $regex: filter, $options: "i" }
          },
          {
            phone: { $regex: filter, $options: "i" }
          }
        ]
      };
  
      if (types) {
        const typesSplitted = types.split(',')
        selector.projectTypes = { $elemMatch: { $in: typesSplitted } }
      }
      const Insul_rCount = await Insul_r.countDocuments(selector).exec();
  
      const Insul_rs = await Insul_r.find(selector, null, {
        limit: LIMIT_BY_PAGE,
        skip: (pageNumber - 1) * LIMIT_BY_PAGE,
        sort: { createdAt: -1 }
      }).lean();
  
      const Insul_rsWithProjects = await Promise.all(
        Insul_rs.map(async (Insul_r) => {
          const projects = await Project.find({
            Insul_rId: Insul_r._id,
            status: { $nin: ["canceled", "completed"] }
          }).lean();
          Insul_r.projects = projects;
          return Insul_r;
        })
      );
  
      const pageCount = Math.ceil(Insul_rCount / LIMIT_BY_PAGE);
  
      return res.json({
        success: true,
        data: { Insul_rs: Insul_rsWithProjects, pageCount, total: Insul_rCount }
      });
    } catch (e) {
      return next(generateError(e.message));
    }
  }

  export async function deleteInsul_r(req, res, next) {
    try {
      const { Insul_rId } = req.params;
  
      const insul_r = await Insul_r.findById(Insul_rId).lean();
  
      if (!insul_r) {
        throw new Error("Cannot find client", 404);
      }
  
      await Insul_r.deleteOne({ _id: Insul_rId }).exec();
  
      return res.json({ success: true });
    } catch (e) {
      next(generateError(e.message));
    }
  }