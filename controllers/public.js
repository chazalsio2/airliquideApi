import moment from "moment";

import { generateError } from "../lib/utils";
import Client from "../models/Client";
import Project, { projectTypes } from "../models/Project";
import { sendNewClientEmail } from "../lib/email";
import { sendMessageToSlack } from "../lib/slack";
import {sendNewClientWebhook, sendNewTrelloCard} from "../services/webhook.service";

export async function publicCreateForm(req, res, next) {
  try {
    const {
      firstname,
      lastname,
      email,
      phone,
      city,
      serviceType,
      conseillerId
    } = req.body;

    if (projectTypes.indexOf(serviceType) === -1) {
      return next(generateError("Invalid service", 403));
    }

    const newClientData = {
      firstname,
      lastname,
      email,
      phone,
      city,
      conseillerId
    };

      const client = await new Client(newClientData).save();


      sendNewClientEmail(client);

      sendMessageToSlack({
        message: `Le prospect ${client.firstname} ${client.lastname} a été ajouté : ${process.env.APP_URL}/clients/${client._id}`,
      });
      const {
        propertyType,
        investmentType,
        otherInvestmentType,
        propertySize,
        propertySizeDetail,
        propertyArea,
        propertyLandArea,
        land,
        landArea,
        additionalInfos,
        searchSector,
        searchSectorCities,
        swimmingpool,
        varangue,
        delay,
        budget
      } = req.body;

      const searchSheet = {
        investmentType:
        investmentType === "other" ? otherInvestmentType : investmentType,
        propertySize,
        propertyType,
        additionalInfos,
        propertySizeDetail,
        propertyArea,
        propertyLandArea,
        land,
        landArea,
        searchSector,
        delay,
        budget,
        searchSectorCities: searchSectorCities || []
      };

      if (["search"].indexOf(serviceType) !== -1) {
        const project = await Project({
          clientId: client,
          type: serviceType,
          searchSheet:searchSheet
        }).save();
        await sendNewClientWebhook(project);
        //sendNewTrelloCard(project);

        return res.json({
          success: true,
          data: {
            project:project,
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
        await sendNewClientWebhook(project);
        //sendNewTrelloCard(project);



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

export async function publicCreateFormExtern(req, res, next) {
  try {
    const {
      firstname,
      lastname,
      email,
      phone,
      city,
      zipcode,
      address,
      referaldetails,
      serviceType,
      commentaire,
      lien,
      conseillerId
    } = req.body;

    if (projectTypes.indexOf(serviceType) === -1) {
      return next(generateError("Invalid service", 403));
    }

    const newClientData = {
      FormExtern:"yes",
      firstname,
      lastname,
      email,
      phone,
      address,
      referaldetails,
      zipcode,
      city,
      commentaire,
      lien,
      conseillerId
    };

      const client = await new Client(newClientData).save();


      sendNewClientEmail(client);

      sendMessageToSlack({
        message: `L'insul-R' ${client.firstname} ${client.lastname} a été ajouté : ${process.env.APP_URL}/clients/${client._id}`,
      });
      const {
        propertyType,
        investmentType,
        otherInvestmentType,
        propertySize,
        propertySizeDetail,
        propertyArea,
        propertyLandArea,
        land,
        landArea,
        additionalInfos,
        searchSector,
        searchSectorCities,
        swimmingpool,
        varangue,
        delay,
        budget
      } = req.body;

      const searchSheet = {
       
        propertySize,
        propertyType,
        additionalInfos,
        propertySizeDetail,
        propertyArea,
        propertyLandArea,
        land,
        landArea,
        searchSector,
        delay,
        budget,
        searchSectorCities: searchSectorCities || []
      };

     /* if (["search"].indexOf(serviceType) !== -1) {
        const project = await Project({
          clientId: client,
          type: serviceType,
          searchSheet:searchSheet
        }).save();
        await sendNewClientWebhook(project);
        //sendNewTrelloCard(project);

        return res.json({
          success: true,
          data: {
            project:project,
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
        await sendNewClientWebhook(project);
        //sendNewTrelloCard(project);



        return res.json({
          success: true,
          data: {
            projectId: project._id,
            completed: true,
          },
        });
      }*/

      return res.json({ success: true, data: { completed: true } });
  } catch (e) {
    next(generateError(e.message));
  }
}

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
      referalconseiller,
      conseillerId,
      referaldetails,lieux_de_naissance,nationalite
    } = req.body;

    if (projectTypes.indexOf(serviceType) === -1) {
      return next(generateError("Invalid service", 403));
    }
    console.log(conseillerId);

    const newClientData = {
      firstname,
      lastname,
      geographicSector,
      email,
      phone,
      referral,
      city,
      zipcode,
      referaldetails,
      referalconseiller,
      conseillerId,
      lieux_de_naissance,nationalite
    };

    const clients = await Client.find({email:email}).exec();

    if (clients[0]) {


      const client0 = clients[clients.length-1];

      const project = await Project.find({clientId:client0._id}).exec();

      const project0 = project[0];

      return res.json({
        success: false,
        data: {
          projectId: project0._id,
          completed: false,
        },
      });

      return next(generateError("Vous vous êtes déjà inscrit."));
      /*
*/
    
  }


      const client = await new Client(newClientData).save();

      console.log(client);

      sendNewClientEmail(client);

      sendMessageToSlack({
        message: `Le prospect ${client.firstname} ${client.lastname} a été ajouté : ${process.env.APP_URL}/clients/${client._id}`,
      });

      if (["search"].indexOf(serviceType) !== -1) {
        const project = await Project({
          clientId: client,
          type: serviceType,
        }).save();
        await sendNewClientWebhook(project);
        //sendNewTrelloCard(project);


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
        await sendNewClientWebhook(project);
        //sendNewTrelloCard(project);



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
