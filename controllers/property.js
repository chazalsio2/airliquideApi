import {
  generateError,
  isSearchClient,
  isAdminOrCommercial
} from "../lib/utils";
import { uploadPhotos } from "../lib/cloudinary";
import Property from "../models/Property";
import { sendMessageToSlack } from "../lib/slack";
import { checkMatchingForProperty } from "../lib/matching";

const LIMIT_BY_PAGE = 12;

export async function editProperty(req, res, next) {
  try {
    const {
      description,
      salesPrice,
      city,
      address,
      landArea,
      livingArea,
      varangueArea,
      type,
      virtualVisitLink,
      salesMandate,
      yearOfConstruction,
      room1Area,
      room2Area,
      kitchenArea,
      bathroomArea,
      numberOfRooms,
      floor,
      outdoorParking,
      coveredParking,
      swimmingPool,
      secureEntrance,
      intercom,
      commercialName,
      commercialPhoneNumber
    } = req.body;

    const { propertyId } = req.params;

    if (!description || !type || !salesPrice) {
      return next(generateError("Invalid request", 401));
    }

    const propertyData = {
      description,
      type,
      salesPrice,
      landArea,
      livingArea,
      salesMandate
    };

    if (floor) {
      propertyData.floor = floor;
    }

    if (outdoorParking) {
      propertyData.outdoorParking = outdoorParking;
    }

    if (commercialName) {
      propertyData.commercialName = commercialName;
    }

    if (commercialPhoneNumber) {
      propertyData.commercialPhoneNumber = commercialPhoneNumber;
    }

    if (coveredParking) {
      propertyData.coveredParking = coveredParking;
    }

    if (swimmingPool) {
      propertyData.swimmingPool = swimmingPool;
    }

    if (secureEntrance) {
      propertyData.secureEntrance = secureEntrance;
    }

    if (intercom) {
      propertyData.intercom = intercom;
    }

    if (virtualVisitLink) {
      propertyData.virtualVisitLink = virtualVisitLink;
    }

    if (yearOfConstruction) {
      propertyData.yearOfConstruction = yearOfConstruction;
    }

    if (address) {
      propertyData.address = address;
    }

    if (varangueArea) {
      propertyData.varangueArea = varangueArea;
    }

    if (city) {
      propertyData.city = city;
    }

    if (room1Area) {
      propertyData.room1Area = Number(room1Area);
    }

    if (room2Area) {
      propertyData.room2Area = Number(room2Area);
    }

    if (kitchenArea) {
      propertyData.kitchenArea = Number(kitchenArea);
    }

    if (bathroomArea) {
      propertyData.bathroomArea = Number(bathroomArea);
    }

    if (numberOfRooms) {
      propertyData.numberOfRooms = Number(numberOfRooms);
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
            agencyFees: Number(propertyFinancialData.agencyFees)
          }
        }
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
      landArea,
      livingArea,
      varangueArea,
      photos,
      type,
      virtualVisitLink,
      salesMandate,
      yearOfConstruction,
      city,
      address,
      room1Area,
      room2Area,
      kitchenArea,
      bathroomArea,
      numberOfRooms,
      floor,
      outdoorParking,
      coveredParking,
      swimmingPool,
      secureEntrance,
      intercom,
      commercialName,
      commercialPhoneNumber
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
      salesMandate,
      photos: results.map((r) => r.url)
    };

    if (yearOfConstruction) {
      propertyData.yearOfConstruction = yearOfConstruction;
    }

    if (virtualVisitLink) {
      propertyData.virtualVisitLink = virtualVisitLink;
    }

    if (floor) {
      propertyData.floor = floor;
    }
    if (outdoorParking) {
      propertyData.outdoorParking = outdoorParking;
    }
    if (coveredParking) {
      propertyData.coveredParking = coveredParking;
    }
    if (swimmingPool) {
      propertyData.swimmingPool = swimmingPool;
    }

    if (secureEntrance) {
      propertyData.secureEntrance = secureEntrance;
    }

    if (intercom) {
      propertyData.intercom = intercom;
    }

    // room1Area, room2Area, kitchenArea, bathroomArea, numberOfRooms;

    if (room1Area) {
      propertyData.room1Area = Number(room1Area);
    }

    if (room2Area) {
      propertyData.room2Area = Number(room2Area);
    }

    if (kitchenArea) {
      propertyData.kitchenArea = Number(kitchenArea);
    }

    if (bathroomArea) {
      propertyData.bathroomArea = Number(bathroomArea);
    }

    if (numberOfRooms) {
      propertyData.numberOfRooms = Number(numberOfRooms);
    }

    if (address) {
      propertyData.address = address;
    }
    if (city) {
      propertyData.city = city;
    }

    if (varangueArea) {
      propertyData.varangueArea = varangueArea;
    }

    if (commercialName) {
      propertyData.commercialName = commercialName;
    }

    if (commercialPhoneNumber) {
      propertyData.commercialPhoneNumber = commercialPhoneNumber;
    }

    const property = await new Property(propertyData).save();

    const slackMessage = `Un nouveau bien a été ajouté (${property.name}) : ${process.env.APP_URL}/biens-immobiliers/${property._id}`;

    sendMessageToSlack({ message: slackMessage, copyToCommercial: true });

    try {
      checkMatchingForProperty(property._id);
    } catch (e) {
      console.error(e);
    }

    return res.json({ success: true, data: property });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getProperties(req, res, next) {
  const { page = "", type = "" } = req.query;
  const pageNumber = Number(page) || 1;

  const selector = {};

  if (type === "sales") {
    selector.salesMandate = true;
  }

  if (isSearchClient(req.user) && !isAdminOrCommercial(req.user)) {
    selector.salesMandate = false;
  }

  const propertiesCount = await Property.countDocuments(selector).exec();
  const pageCount = Math.ceil(propertiesCount / LIMIT_BY_PAGE);

  try {
    const properties = await Property.find(
      selector,
      "photos name ref description city",
      {
        sort: { createdAt: -1 },
        skip: (pageNumber - 1) * LIMIT_BY_PAGE,
        limit: LIMIT_BY_PAGE
      }
    ).lean();
    return res.json({
      success: true,
      data: { properties, pageCount, total: propertiesCount }
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

    const selector = { _id: propertyId };

    if (isSearchClient(req.user) && !isAdminOrCommercial(req.user)) {
      selector.salesMandate = false;
    }

    const property = await Property.findOne(selector).lean();

    if (!property) {
      return next(generateError("Property not found", 404));
    }

    if (!isAdminOrCommercial(req.user)) {
      delete property.address;
    }

    return res.json({ success: true, data: property });
  } catch (e) {
    next(generateError(e.message));
  }
}

const propertiesPublicFields =
  "ref name description type yearOfConstruction landArea livingArea salesPrice varangueArea photos virtualVisitLink financialSheet coOwnershipCharge assurancePNO propertyTax accounting cga divers propertyPrice notaryFees works financialExpense equipment financialSheet numberOfRooms kitchenArea room1Area room2Area bathroomArea floor outdoorParking coveredParking swimmingPool secureEntrance intercom commercialName commercialPhoneNumber";

export async function getPublicProperties(req, res, next) {
  try {
    const { page = "", type = "" } = req.query;
    const selector = { salesMandate: true, public: true };
    const pageNumber = Number(page) || 1;

    const propertiesCount = await Property.countDocuments(selector).exec();
    const pageCount = Math.ceil(propertiesCount / LIMIT_BY_PAGE);

    const properties = await Property.find(
      selector,
      "name description photos salesPrice",
      {
        sort: { createdAt: -1 },
        limit: LIMIT_BY_PAGE,
        skip: (pageNumber - 1) * LIMIT_BY_PAGE
      }
    ).lean();

    return res.json({
      success: true,
      data: {
        properties,
        pageCount,
        total: propertiesCount
      }
    });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getPublicProperty(req, res, next) {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return next(generateError("Invalid request", 401));
    }

    const selector = {
      _id: propertyId,
      salesMandate: true,
      public: true
    };

    const property = await Property.findOne(
      selector,
      propertiesPublicFields
    ).lean();

    if (!property) {
      return next(generateError("Property not found", 404));
    }
    return res.json({ success: true, data: property });
  } catch (e) {
    next(generateError(e.message));
  }
}
