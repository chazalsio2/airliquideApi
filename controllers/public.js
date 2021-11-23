import moment from "moment";

import { generateError } from "../lib/utils";
import Client from "../models/Client";
import Project, { projectTypes } from "../models/Project";
import { sendNewClientEmail } from "../lib/email";
import { sendMessageToSlack } from "../lib/slack";
import { sendNewClientWebhook } from '../services/webhook.service';


export async function publicCreateClient(req, res, next) {
  try {
    const {
      firstname,
      lastname,
      email,
      phone,
      serviceType,
      geographicSector,
      referral,
      city,
      zipcode,
      referaldetails
    } = req.body;

    if (projectTypes.indexOf(serviceType) === -1) {
      return next(generateError("Invalid service", 403));
    }

    const newClientData = {
      firstname,
      lastname,
      geographicSector,
      email,
      phone,
      referral,
      city,
      zipcode,
      referaldetails
    };

      const client = await new Client(newClientData).save();

      console.log(client._id);
    await sendNewClientWebhook(client._id);

      sendNewClientEmail(client);

      sendMessageToSlack({
        message: `Le client ${client.firstname} ${client.lastname} a été ajouté : ${process.env.APP_URL}/clients/${client._id}`,
      });

      if (["search"].indexOf(serviceType) !== -1) {
        const project = await Project({
          clientId: client,
          type: serviceType,
        }).save();

        return res.json({
          success: true,
          data: {
            projectId: project._id,
            completed: false,
          },
        });
      }

      // the form is completed for others project type
      if (projectTypes.indexOf(serviceType) !== -1) {
        const project = await Project({
          clientId: client,
          type: serviceType,
        }).save();

        return res.json({
          success: true,
          data: {
            projectId: project._id,
            completed: true,
          },
        });
      }

      return res.json({ success: true, data: { completed: true } });
  } catch (e) {
    next(generateError(e.message));
  }
}
