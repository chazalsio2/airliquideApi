import {
  generateError,
  isSearchClient,
  isSearchClientVip,
  isAdminOrCommercial
} from "../lib/utils";
import { uploadPhotos } from "../lib/cloudinary";
import Property, { getPropertyType } from "../models/Property";
import { sendMessageToSlack } from "../lib/slack";
import { checkMatchingForProperty } from "../lib/matching";
import {sendNewDProprieteWebhook} from '../services/webhook.service';


const LIMIT_BY_PAGE = 12;

export async function deleteProperty(req, res, next) {
  try {
    const { propertyId } = req.params;

    const properties = await Property.findById(propertyId).lean();

    if (!properties) {
      throw new Error("Cannot find property", 404);
    }

    await Property.deleteOne({ _id: propertyId }).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function editProperty(req, res, next) {
  try {
    const {
      description,
      salesPrice,
      code_postale,
      projectId,
      charges_properties,
      city,
      address,
      landArea,
      livingArea,
      landconstcd,
      varangueArea,
      type,
      virtualVisitLink,
      propertyStatus,
      yearOfConstruction,
      Honoraires_V_R,
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
      commercialPhoneNumber,
      commercialEmail,
      view,
      sanitation,
      doubleGlazing,
      electricRollerShutters,
      hotWater,
      airConditioner,
      equippedKitchen,
      // DPE,
      procedureInProgress,
      freeOfOccupation,
      numberOfCoOwnershipLots,
      photos,
      typeOfInvestment,
      rent,
      coOwnershipCharge,
      assurancePNO,
      propertyTax,
      accounting,
      cga,
      divers,
      notaryFees,
      visionRFees,
      works,
      roomDescription,
      financialExpense,
      equipment,
      agencyFees
    } = req.body;

    const { propertyId } = req.params;

    if (!description || !type || !salesPrice) {
      return next(generateError("Invalid request", 401));
    }

    const property = await Property.findById(propertyId).lean();

    const propertyData = {
      description,
      type,
      salesPrice,
      code_postale,
      projectId,
      Honoraires_V_R,
      charges_properties,
      city,
      //landArea,
      // livingArea,
      propertyStatus
    };

    if (landArea) {
      propertyData.landArea = landArea;
    }
    if (livingArea) {
      propertyData.livingArea = livingArea;
    }
    if (landconstcd) {
      propertyData.landconstcd = landconstcd;
    }
    if (typeOfInvestment) {
      propertyData.typeOfInvestment = typeOfInvestment;
    }
    if (rent) {
      propertyData.rent = Number(rent);
    }
    if (coOwnershipCharge) {
      propertyData.coOwnershipCharge = Number(coOwnershipCharge);
    }
    if (assurancePNO) {
      propertyData.assurancePNO = Number(assurancePNO);
    }
    if (propertyTax) {
      propertyData.propertyTax = Number(propertyTax);
    }
    if (accounting) {
      propertyData.accounting = accounting;
    }
    if (!accounting) {
      propertyData.accounting = accounting;
    }
    if (cga) {
      propertyData.cga = cga;
    }
    if (!cga) {
      propertyData.cga = cga;
    }
    if (divers) {
      propertyData.divers = Number(divers);
    }
    if (notaryFees) {
      propertyData.notaryFees = Number(notaryFees);
    }
    if (visionRFees) {
      propertyData.visionRFees = Number(visionRFees);
    }
    if (works) {
      propertyData.works = Number(works);
    }
    if (financialExpense) {
      propertyData.financialExpense = Number(financialExpense);
    }
    if (equipment) {
      propertyData.equipment = Number(equipment);
    }
    if (agencyFees) {
      propertyData.agencyFees = Number(agencyFees);
    }

    if (photos && photos.length) {
      const results = await uploadPhotos(photos);

      propertyData.photos = results.map((r) => r.url).concat(property.photos);
    }

    if (floor) {
      propertyData.floor = floor;
    }
    // if (DPE) {
    //   propertyData.DPE = DPE === "Soumis";
    // }
    if (numberOfCoOwnershipLots) {
      propertyData.numberOfCoOwnershipLots = Number(numberOfCoOwnershipLots);
    }

    if (freeOfOccupation) {
      propertyData.freeOfOccupation = freeOfOccupation === "Oui";
    }

    if (procedureInProgress) {
      propertyData.procedureInProgress = procedureInProgress === "Oui";
    }

    if (outdoorParking) {
      propertyData.outdoorParking = outdoorParking;
    }

    if (commercialName) {
      propertyData.commercialName = commercialName;
    }

    if (commercialEmail) {
      propertyData.commercialEmail = commercialEmail;
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

    if (view) {
      propertyData.view = view;
    }

    if (sanitation) {
      propertyData.sanitation = sanitation;
    }

    if (doubleGlazing) {
      propertyData.doubleGlazing = doubleGlazing;
    }
    if (electricRollerShutters) {
      propertyData.electricRollerShutters = electricRollerShutters;
    }

    if (hotWater) {
      propertyData.hotWater = hotWater;
    }

    if (airConditioner) {
      propertyData.airConditioner = airConditioner;
    }

    if (equippedKitchen) {
      propertyData.equippedKitchen = equippedKitchen;
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

    // if (city) {
    //   propertyData.city = city;
    // }

    if (roomDescription) {
      propertyData.roomDescription = roomDescription;
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

    propertyData.name = `${getPropertyType(propertyData.type) || ""} ${propertyData.livingArea ? propertyData.livingArea+" m²" : ""}  ${propertyData.city || ""} ${propertyData.landArea ? propertyData.landArea+ " m²" : ""}`;

    const propertyEdited = await Property.updateOne(
      { _id: propertyId },
      { $set: propertyData }
    ).exec();

    return res.json({ success: true, data: propertyEdited });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function updatePropertyVisibility(req, res, next) {
  const { propertyId } = req.params;

  try {
    const property = await Property.findOne({ _id: propertyId }).lean();

    if (!property) {
      throw new Error("Property not found");
    }

    await Property.updateOne(
      { _id: propertyId },
      { $set: { public: !!req.body.public } }
    ).exec();

    if (req.body.public && property.propertyStatus === "forsale")  {
      try {
        checkMatchingForProperty(property._id);
      } catch (e) {
        console.error(e);
      }
    }

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}


export async function editPropertyStatus(req, res, next) {
  const { status } = req.body
  const { propertyId } = req.params;

  if (!status || ['available', 'unavailable'].indexOf(status) === -1) {
    return next(generateError("Invalid request", 401));
  }

  await Property.updateOne({ _id: propertyId }, { $set: { status } }).exec()

  return res.json({ success: true });
}

export async function deletePhoto(req, res, next) {
  const { photo } = req.body;
  const { propertyId } = req.params;

  try {
    await Property.updateOne(
      { _id: propertyId },
      { $pull: { photos: photo } }
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
      propertyStatus,
      salesPrice,
      code_postale,
      landArea,
      commercialName,
      commercialPhoneNumber,
      commercialEmail,
      projectId,
      livingArea,
      varangueArea,
      photos,
      type,
      virtualVisitLink,
      yearOfConstruction,
      Honoraires_V_R,
      charges_properties,
      city,
      address,
      roomDescription,
      kitchenArea,
      bathroomArea,
      numberOfRooms,
      floor,
      outdoorParking,
      coveredParking,
      swimmingPool,
      secureEntrance,
      intercom,
      // commercialName,
      // commercialEmail,
      // commercialPhoneNumber,
      view,
      sanitation,
      doubleGlazing,
      electricRollerShutters,
      hotWater,
      airConditioner,
      equippedKitchen,
      // DPE,
      numberOfCoOwnershipLots,
      procedureInProgress,
      freeOfOccupation,
      typeOfInvestment,
      rent,
      coOwnershipCharge,
      assurancePNO,
      propertyTax,
      accounting,
      cga,
      divers,
      notaryFees,
      visionRFees,
      works,
      financialExpense,
      equipment,
      agencyFees
    } = req.body;
    console.log(projectId);

    if (
      !description ||
      !type ||
      !salesPrice ||
      !city ||
      // !landArea ||
      // !livingArea ||
      !photos
    ) {
      return next(generateError("Invalid request", 401));
    }

    const results = await uploadPhotos(photos);

    const propertyData = {
      description:`
        ${description}


        Prix de vente: ${salesPrice}€ FAI ${charges_properties ? charges_properties ==="Acquéreur" ?"(dont honoraires Vision-R est de : "+Honoraires_V_R+"€)" :"":""}
        Honoraires charges ${charges_properties}
        

        Votre contact Vision-R Immobilier :
        ${commercialName}:${commercialPhoneNumber}
        ${commercialEmail}`,
      type,
      Honoraires_V_R,
      charges_properties,
      salesPrice,
      code_postale,
      projectId,
      city,
      // landArea,
      // livingArea,
      propertyStatus,
      photos: results.map((r) => r.url)
    };
    if (landArea) {
      propertyData.landArea = landArea;
    }
    if (livingArea) {
      propertyData.livingArea = livingArea;
    }
    if (typeOfInvestment) {
      propertyData.typeOfInvestment = typeOfInvestment;
    }
    if (rent) {
      propertyData.rent = Number(rent);
    }
    if (coOwnershipCharge) {
      propertyData.coOwnershipCharge = Number(coOwnershipCharge);
    }
    if (assurancePNO) {
      propertyData.assurancePNO = Number(assurancePNO);
    }
    if (propertyTax) {
      propertyData.propertyTax = Number(propertyTax);
    }
    if (accounting) {
      propertyData.accounting = accounting;
    }
    if (cga) {
      propertyData.cga = cga;
    }
    if (divers) {
      propertyData.divers = Number(divers);
    }
    if (notaryFees) {
      propertyData.notaryFees = Number(notaryFees);
    }
    if (visionRFees) {
      propertyData.visionRFees = Number(visionRFees);
    }
    if (works) {
      propertyData.works = Number(works);
    }
    if (financialExpense) {
      propertyData.financialExpense = Number(financialExpense);
    }
    if (equipment) {
      propertyData.equipment = Number(equipment);
    }
    if (agencyFees) {
      propertyData.agencyFees = Number(agencyFees);
    }

    // to remove (use SalesPrice)
    // if (propertyPrice) {
    //   propertyData.propertyPrice = Number(propertyPrice);
    // }

    if (yearOfConstruction) {
      propertyData.yearOfConstruction = yearOfConstruction;
    }

    if (view) {
      propertyData.view = view;
    }
    // if (DPE) {
    //   propertyData.DPE = DPE === "Soumis";
    // }
    if (sanitation) {
      propertyData.sanitation = sanitation;
    }
    if (doubleGlazing) {
      propertyData.doubleGlazing = doubleGlazing;
    }
    if (electricRollerShutters) {
      propertyData.electricRollerShutters = electricRollerShutters;
    }
    if (hotWater) {
      propertyData.hotWater = hotWater;
    }
    if (airConditioner) {
      propertyData.airConditioner = airConditioner;
    }
    if (numberOfCoOwnershipLots) {
      propertyData.numberOfCoOwnershipLots = Number(numberOfCoOwnershipLots);
    }
    if (procedureInProgress) {
      propertyData.procedureInProgress = procedureInProgress === "Oui";
    }
    if (freeOfOccupation) {
      propertyData.freeOfOccupation = freeOfOccupation === "Oui";
    }
    if (equippedKitchen) {
      propertyData.equippedKitchen = equippedKitchen;
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

    if (roomDescription) {
      propertyData.roomDescription = roomDescription;
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

    // if (city) {
    //   propertyData.city = city;
    // }

    if (varangueArea) {
      propertyData.varangueArea = varangueArea;
    }

    // if (commercialName) {
    //   propertyData.commercialName = commercialName;
    // }

    // if (commercialEmail) {
    //   propertyData.commercialEmail = commercialEmail;
    // }

    // if (commercialPhoneNumber) {
    //   propertyData.commercialPhoneNumber = commercialPhoneNumber;
    // }

    propertyData.commercialEmail = req.user.email;
    propertyData.commercialName = req.user.displayName;
    propertyData.commercialPhoneNumber = req.user.phone;

    const property = await new Property(propertyData).save();

    const slackMessage = `Un nouveau bien a été ajouté (${property.name}) : ${process.env.APP_URL}/biens-immobiliers/${property._id}`;

    sendMessageToSlack({ message: slackMessage, copyToCommercial: true });

    sendNewDProprieteWebhook(property._id);

    return res.json({ success: true, data: property });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getProperties(req, res, next) {
  const { page = "", type = "" } = req.query;
  const pageNumber = Number(page) || 1;

  const selector = {};

  if (type === "forsale") {
    selector.propertyStatus = "forsale";
  }

  if (type === "rental") {
    selector.propertyStatus = "rental"
    ;
  }

  if (
    type === "hunting" ||
    ((isSearchClient(req.user) || isSearchClientVip(req.user)) && !isAdminOrCommercial(req.user))
  ) {
    selector.propertyStatus = "hunting";
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
export async function getPropertie(req, res, next){
  try {
    const folderSelector = isAdminOrCommercial(req.user)? {}
    : { allowedRoles: { $in: req.user.roles } };
    const properties = await Property.find(folderSelector).lean();
  return res.json({
    success: true,
    data: { properties }
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

    if ((isSearchClient(req.user) || isSearchClientVip(req.user)) && !isAdminOrCommercial(req.user)) {
      selector.propertyStatus = "hunting";
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
  "ref name description type yearOfConstruction landArea livingArea salesPrice varangueArea photos virtualVisitLink financialSheet coOwnershipCharge assurancePNO propertyTax accounting cga divers propertyPrice notaryFees works financialExpense equipment financialSheet numberOfRooms kitchenArea roomDescription bathroomArea floor outdoorParking coveredParking swimmingPool secureEntrance intercom commercialName commercialPhoneNumber sanitation hotWater doubleGlazing electricRollerShutters airConditioner view equippedKitchen freeOfOccupation procedureInProgress numberOfCoOwnershipLots typeOfInvestment rent coOwnershipCharge assurancePNO propertyTax accounting cga divers notaryFees visionRFees works financialExpense equipment agencyFees";

export async function getPublicProperties(req, res, next) {
  try {
    const { page = "" } = req.query;
    const selector = {
      propertyStatus: "forsale",
      public: true
    };
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

export async function getPublicPropertiesRental(req, res, next) {
  try {
    const { page = "" } = req.query;
    const selector = {
      propertyStatus: "rental",
      public: true
    };
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
      propertyStatus: "forsale",
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

export async function getPublicPropertyRental(req, res, next) {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return next(generateError("Invalid request", 401));
    }

    const selector = {
      _id: propertyId,
      propertyStatus: "rental",
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
