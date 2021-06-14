import { generateError } from "../lib/utils";

export default function (req, res, next) {
  return next(generateError("Route not defined"));
}
