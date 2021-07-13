import _ from "underscore";

import Training from "../models/Training";
import { generateError, hasRole } from "../lib/utils";
import { allowedRoles } from "../models/User";

export async function getTrainings(req, res, next) {
  try {
    const isAdmin = req.user.roles.indexOf("admin") !== -1;

    if (isAdmin) {
      const trainings = await Training.find().lean();
      return res.json({ success: true, data: trainings });
    } else {
      const trainings = await Training.find({
        roles: { $in: req.user.roles }
      }).lean();
      return res.json({ success: true, data: trainings });
    }
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function removeTraining(req, res, next) {
  try {
    const { trainingId } = req.params;

    const training = await Training.findById(trainingId).lean();

    if (!training) {
      throw new Error("Training not found", 404);
    }

    await Training.deleteOne({ _id: trainingId }).exec();
    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function editTraining(req, res, next) {
  try {
    const { trainingId } = req.params;

    const training = await Training.findById(trainingId).lean();

    if (!training) {
      throw new Error("Training not found", 404);
    }

    const { roles, url, name, description } = req.body;

    if (!url || !name || !description) {
      throw new Error('Missing arguments')
    }

    if (!roles || !_.isArray(roles)) {
      throw new Error("Wrong arguments", 403);
    }

    const isAllowedRoles = _.every(
      roles,
      (role) => allowedRoles.indexOf(role) !== -1
    );

    if (!isAllowedRoles) {
      throw new Error("Wrong arguments", 403);
    }

    await Training.updateOne({ _id: trainingId }, {
      $set: {
        roles,
        url,
        name,
        description
      }
    }).exec();
    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getTraining(req, res, next) {
  try {
    const { trainingId } = req.params;

    const training = await Training.findById(trainingId).lean();

    if (!training) {
      throw new Error("Training not found", 404);
    }

    const isAdmin = req.user.roles.indexOf("admin") !== -1;

    if (isAdmin) {
      return res.json({ success: true, data: training });
    } else {
      const authorized = hasRole(req.user, training.roles);

      if (!authorized) {
        throw new Error("Not authorized", 401);
      }

      return res.json({ success: true, data: training });
    }
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function createTraining(req, res, next) {
  try {
    const { name, url, roles, description } = req.body;

    if (!name || !url) {
      throw new Error("Missing arguments", 403);
    }

    if (!roles || !_.isArray(roles)) {
      throw new Error("Wrong arguments", 403);
    }

    const isAllowedRoles = _.every(
      roles,
      (role) => allowedRoles.indexOf(role) !== -1
    );

    if (!isAllowedRoles) {
      throw new Error("Wrong arguments", 403);
    }

    const training = await new Training({
      name,
      url,
      roles,
      description
    }).save();
    return res.json({ success: true, data: training });
  } catch (e) {
    next(generateError(e.message));
  }
}
