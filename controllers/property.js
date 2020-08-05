import { generateError } from "../lib/utils";
import { uploadPhotos } from "../lib/cloudinary";
import Property from "../models/Property";

export async function createProperty(req, res, next) {
  try {
    const { files, area, type } = req.body;
    console.log("createProperty -> type", type);
    console.log("createProperty -> area", area);
    console.log("createProperty -> files", files.length);

    if (!type || !area || !files) {
      return next(generateError("Invalid request", 401));
    }

    const results = await uploadPhotos(files);
    console.log("createProperty -> results", results);

    const property = await new Property({ type, area }).save();

    return res.json({ success: true, data: property });
  } catch (e) {
    console.log("createProperty -> e", e);
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
    console.log("getProperty -> propertyId", propertyId);

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
