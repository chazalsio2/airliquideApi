import { generateError } from "../lib/utils";
import { uploadPhotos } from "../lib/cloudinary";
import Property from "../models/Property";

export async function createProperty(req, res, next) {
  try {
    const { files, area, type, virtualVisitLink } = req.body;

    if (!type || !area || !files) {
      return next(generateError("Invalid request", 401));
    }

    const results = await uploadPhotos(files);

    const propertyData = {
      type,
      area,
      photos: results.map((r) => r.url),
    };

    if (virtualVisitLink) {
      propertyData.virtualVisitLink = virtualVisitLink;
    }

    const property = await new Property(propertyData).save();

    return res.json({ success: true, data: property });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getProperties(req, res, next) {
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
