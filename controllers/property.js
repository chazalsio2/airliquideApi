import { generateError } from "../lib/utils";
import { uploadPhotos } from "../lib/cloudinary";
import Property from "../models/Property";
import { sendMessageToSlack } from "../lib/slack";

export async function createProperty(req, res, next) {
  try {
    const {
      name,
      description,
      salesPrice,
      fullAddress,
      landArea,
      livingArea,
      varangueArea,
      photos,
      type,
      virtualVisitLink,
      rooms,
    } = req.body;

    if (
      !name ||
      !description ||
      !type ||
      !salesPrice ||
      !landArea ||
      !livingArea ||
      !photos
    ) {
      return next(generateError("Invalid request", 401));
    }

    const results = await uploadPhotos(photos);

    const propertyData = {
      name,
      description,
      type,
      salesPrice,
      landArea,
      livingArea,
      photos: results.map((r) => r.url),
    };

    if (virtualVisitLink) {
      propertyData.virtualVisitLink = virtualVisitLink;
    }

    if (fullAddress) {
      propertyData.fullAddress = fullAddress;
    }

    if (varangueArea) {
      propertyData.varangueArea = varangueArea;
    }

    if (rooms) {
      propertyData.rooms = rooms;
    }

    const property = await new Property(propertyData).save();

    const slackMessage = `Un nouveau bien a été ajouté (${property.name}) : ${process.env.APP_URL}/biens-immobiliers/${property._id}`;

    sendMessageToSlack({ message: slackMessage, copyToCommercial: true });

    return res.json({ success: true, data: property });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getProperties(req, res, next) {
  // TODO : Handle pagination here
  try {
    const properties = await Property.find().lean();
    return res.json({ success: true, data: properties });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getProperty(req, res, next) {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return next(generateError("Invalid request", 401));
    }

    const property = await Property.findById(propertyId).lean();

    if (!property) {
      return next(generateError("Property not found", 404));
    }
    return res.json({ success: true, data: property });
  } catch (e) {
    next(generateError(e.message));
  }
}
