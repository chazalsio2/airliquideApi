import { generateError } from "../lib/utils";
import { uploadPhotos } from "../lib/cloudinary";
import Property from "../models/Property";
import { sendMessageToSlack } from "../lib/slack";

const LIMIT_BY_PAGE = 12;

export async function editProperty(req, res, next) {
  try {
    const {
      description,
      salesPrice,
      fullAddress,
      landArea,
      livingArea,
      varangueArea,
      type,
      virtualVisitLink,
      rooms,
    } = req.body;

    const { propertyId } = req.params;

    if (!description || !type || !salesPrice || !landArea || !livingArea) {
      return next(generateError("Invalid request", 401));
    }

    const propertyData = {
      description,
      type,
      salesPrice,
      landArea,
      livingArea,
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

    const property = await Property.updateOne(
      { _id: propertyId },
      { $set: propertyData }
    ).exec();

    return res.json({ success: true, data: property });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function updatePropertyVisibility(req, res, next) {
  const { visible } = req.body;
  const { propertyId } = req.params;

  try {
    await Property.updateOne(
      { _id: propertyId },
      { $set: { public: !!visible } }
    ).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function updateFinancialPropertyData(req, res, next) {
  const propertyFinancialData = req.body;
  const { propertyId } = req.params;

  try {
    await Property.updateOne(
      { _id: propertyId },
      {
        $set: {
          financialSheet: {
            typeOfInvestment: propertyFinancialData.typeOfInvestment,
            rent: Number(propertyFinancialData.rent),
            coOwnershipCharge: Number(propertyFinancialData.coOwnershipCharge),
            assurancePNO: Number(propertyFinancialData.assurancePNO),
            propertyTax: Number(propertyFinancialData.propertyTax),
            accounting: Number(propertyFinancialData.accounting),
            cga: Number(propertyFinancialData.cga),
            divers: Number(propertyFinancialData.divers),
            propertyPrice: Number(propertyFinancialData.propertyPrice),
            notaryFees: Number(propertyFinancialData.notaryFees),
            visionRFees: Number(propertyFinancialData.visionRFees),
            works: Number(propertyFinancialData.works),
            financialExpense: Number(propertyFinancialData.financialExpense),
            equipment: Number(propertyFinancialData.equipment),
          },
        },
      }
    ).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function createProperty(req, res, next) {
  try {
    const {
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
  const { page = "", type = "" } = req.query;
  const pageNumber = Number(page) || 1;

  const selector = {};
  if (type === "hunting") {
    selector.classification = "hunting";
  }
  if (type === "selling") {
    selector.classification = "selling";
  }

  const propertiesCount = await Property.countDocuments(selector).exec();
  const pageCount = Math.ceil(propertiesCount / LIMIT_BY_PAGE);

  try {
    const properties = await Property.find(selector, null, {
      sort: { createdAt: -1 },
      skip: (pageNumber - 1) * LIMIT_BY_PAGE,
      limit: LIMIT_BY_PAGE,
    }).lean();
    return res.json({
      success: true,
      data: { properties, pageCount, total: propertiesCount },
    });
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
