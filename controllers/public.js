import { generateError } from "../lib/utils";
import Client from "../models/Client";

export async function publicCreateClient(req, res, next) {
  try {
    const {
      civility,
      address,
      firstname,
      lastname,
      email,
      phone,
      zipcode,
      city,
      birthday,
    } = req.body;

    const client = await new Client({
      civility,
      address,
      firstname,
      lastname,
      email,
      phone,
      zipcode,
      city,
    }).save();

    console.log("publicCreateClient -> client", client);

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
