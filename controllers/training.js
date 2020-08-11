import Training from "../models/Training";

export async function getTrainings(req, res, next) {
  try {
    const trainings = await Training.find().lean();
    return res.json({ success: true, data: trainings });
  } catch (e) {
    next(generateError(e.message));
  }
}
