import {
  generateError,
  isSearchClient,
  isSearchClientVip,
  isAdminOrCommercial
} from "../lib/utils";
import { uploadPhotos } from "../lib/cloudinary";
import { uploadFile } from "../lib/aws";

import Property, { getPropertyType } from "../models/Property";
import Project from "../models/Project"; 
import Client from "../models/Client"; 
import PropertyCont from "../models/PropertyCont"; 
import { sendMessageToSlack } from "../lib/slack";
import { checkMatchingForProperty } from "../lib/matching";
import {sendNewDProprieteWebhook,sendMatchProjectEmail} from '../services/webhook.service';


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

export async function PropertyUrl(req, res, next) {

  try{
    const {
      url_matching
    } = req.body;

    const { propertyId } = req.params;

    //console.log(propertyId);

    const property = await Property.findById(propertyId).lean();

    if (property.propertyStatus === "forsale")  {
     
        checkMatchingForProperty(property._id);
      
    }

    const propertyEdited = await Property.updateOne(
      { _id: propertyId},
      { public: !!true , 
        url_matching: url_matching }
    ).exec();


    
    /*function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    delay(20000).then(() =>  {*/
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(60000);
    const properties = await Property.findById(propertyId).lean();
      
      // if (properties.matchedProject){

      //   sendMatchProjectEmail( properties,url_matching );
  
      //   }
  //);

    return res.json({ success: true, data: propertyEdited });

  } catch (e) {

    next(generateError(e.message));

  }
}

export async function propertyLike(req, res, next) {

  try{
    const {
      like
    } = req.body;

    const { propertyId } = req.params;


    let likes;

    if(like === true){
        await Property.updateOne(
      { _id: propertyId },
      {$addToSet:{likeId: req.body.user._id }},
    ).lean();
    likes = await Property.findById(propertyId).lean();
    console.log("likes ",likes)


    }else{
       await Property.updateOne(
        { _id: propertyId },
        { $pull: { likeId:req.body.user._id }}
      ).lean();
      likes = await Property.findById(propertyId).lean();

    }

    return res.json({ success: true, data: likes });

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
      propertyStatus,
      address,
      landArea,
      livingArea,
      landconstcd,
      varangueArea,
      type,
      surface,
      virtualVisitLink,
      yearOfConstruction,
      Honoraires_V_R,
      kitchenArea,
      bathroomArea,
      numberOfRooms,
      propertySizeDetail,
      floor,
      level,
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
      surface,
      city,
      //landArea,
      // livingArea,
      propertyStatus
    };

    //console.log(propertyStatus);
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

      propertyData.photos = results.map((r) => r).concat(property.photos);
    }

    if (floor) {
      propertyData.floor = floor;
    }
    if (level) {
      propertyData.level = level;
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
      propertyData.numberOfRooms = numberOfRooms === "bigger" ? propertySizeDetail : Number(numberOfRooms);
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

  //console.log(req.body.public);
  try {
    const property = await Property.findOne({ _id: propertyId }).lean();

    if (!property) {
      throw new Error("Property not found");
    }

    await Property.updateOne(
      { _id: propertyId },
      { $set: { public: !!req.body.public } }
    ).exec();

    /*if (req.body.public && property.propertyStatus === "forsale")  {
      try {
        checkMatchingForProperty(property._id);
      } catch (e) {
        console.error(e);
      }
    }*/

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
export async function PhotoCouv (req, res, next) {
  const { photo } = req.body;
  const { propertyId } = req.params;
    const properties = await Property.findById(propertyId).lean();
    properties.photos.splice(0,0,photo.photo)
    properties.photos.splice(photo.photos+1,1,)
    
  try {
    await Property.updateOne(
      { _id: propertyId },
      {photos: properties.photos }
    ).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
export async function createProperty(req, res, next) {
  try {
    const {
      ZoneSector,
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
      surface,
      Honoraires_V_R,
      charges_properties,
      city,
      address,
      roomDescription,
      kitchenArea,
      bathroomArea,
      numberOfRooms,
      propertySizeDetail,
      floor,
      level,
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

    if (
      !description ||
      !type ||
      !salesPrice ||
      !city ||
      // !landArea ||
      // !livingArea ||
      !photos[0]
    ) {
      return next(generateError("Invalid request", 401));
    }
    // const results = await uploadFile(
    //   `propriété__/${document._id}_${document.name}`,
    //   fileData,
    //   contentType
    // );

    const results = await uploadPhotos(photos);
    console.log(results);
    const propertyData = {
      ZoneSector,
      description:`
        ${description}


        Prix de vente: ${salesPrice}€ Frais d'agence inclus ${charges_properties ? charges_properties ==="Acquéreur" ?"(dont honoraires Vision-R est de : "+Honoraires_V_R+"€)" :"":""}
        ${charges_properties === "Vendeur" ? "Les honoraires sont à la charge du "+charges_properties:"Les honoraires sont à la charge de l'"+charges_properties}
        
        Ref annonce : 
        Non soumis au diagnostic de performance énergétique

        Votre contact Vision-R Immobilier :
        ${commercialName}:${commercialPhoneNumber}
        ${commercialEmail}`,
      type,
      Honoraires_V_R,
      charges_properties,
      salesPrice,
      surface,
      code_postale:`${city.slice(-6,-1)}`,
      projectId,
      city,
      // landArea,
      // livingArea,
      propertyStatus,
      photos: results.map((r) => r)
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
    if (level) {
      propertyData.level = level;
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

      propertyData.numberOfRooms = numberOfRooms === "bigger" ? propertySizeDetail : Number(numberOfRooms);
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
     await new PropertyCont(
       {name:property.name}
     ).save();


    const slackMessage = `Un nouveau bien a été ajouté (${property.name}) : ${process.env.APP_URL}/biens-immobiliers/${property._id}`;

    sendMessageToSlack({ message: slackMessage, copyToCommercial: true });

    sendNewDProprieteWebhook(property._id);

    return res.json({ success: true, data: property });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getProperties(req, res, next) {
  const { page = "", type = "" ,typeBien="",PrixMin, PrixMax,city="",zone="" } = req.query;
  const pageNumber = Number(page) || 1;

  let selectorPrix;

  console.log(zone);

  const selector = {};

  if (typeBien||PrixMin||PrixMax||city||zone) {
    if (typeBien) {
      selector.type=typeBien;
      }
      if(PrixMin && PrixMax){
        selector.salesPrice = {$and: [ { $gte: PrixMin } , { $lte: PrixMax } ]};
      }
    if (PrixMin) {
      if(!PrixMax){
        selector.salesPrice= { $gte: PrixMin };
    }
      }
    if (PrixMax) {
      if(!PrixMin){
      selector.salesPrice= { $lte: PrixMax };
      }
      }  
    if (city) {
      selector.city=city;
      }
      if (zone) {
        selector.ZoneSector=zone;
        }
      
  }
  
  // if (req.user.ZoneSector.indexOf("reunion") !== -1 ) {
    // selector.ZoneSector = {$in:req.user.ZoneSector}
  // }
  // if (req.user.ZoneSector.indexOf("maurice") !== -1 ) {
  //   selector.ZoneSector = "maurice"
  // }
  // if (req.user.ZoneSector.indexOf("alsace") !== -1 ) {
  //   selector.ZoneSector = "alsace"
  // }
  if(type === "user") {
    selector.commercialEmail = req.user.email;
    if (typeBien||PrixMin||PrixMax||city||zone) {
      if (typeBien) {
        selector.type=typeBien;
        }
       // if(PrixMin && PrixMax){
      //   selector.salesPrice = {$and: [ { $gte: PrixMin } , { $lte: PrixMax } ]};
      // }
      if (PrixMin) {
        if(!PrixMax){
        selector.salesPrice= { $gte: PrixMin };
      }
        }
      if (PrixMax) {
        if(!PrixMin){
        selector.salesPrice= { $lte: PrixMax };
        }
        }  
      if (city) {
        selector.city=city;
        }
        if (zone) {
          selector.ZoneSector=zone;
          }
        
    }
  }
 

  if (type === "forsale") {
    selector.propertyStatus = "forsale";
    if (typeBien||PrixMin||PrixMax||city) {
      if (typeBien) {
        selector.type=typeBien;
        }
       // if(PrixMin && PrixMax){
      //   selector.salesPrice = {$and: [ { $gte: PrixMin } , { $lte: PrixMax } ]};
      // }
      if (PrixMin) {
        if(!PrixMax){
        selector.salesPrice= { $gte: PrixMin };
      }
        }
      if (PrixMax) {
        if(!PrixMin){
        selector.salesPrice= { $lte: PrixMax };
        }
        }  
      if (city) {
        selector.city=city;
        }
        if (zone) {
          selector.ZoneSector=zone;
          }
        
    }
  }

  if (type === "rental") {
    selector.propertyStatus = "rental";
    if (typeBien||PrixMin||PrixMax||city) {
      if (typeBien) {
        selector.type=typeBien;
        }
       // if(PrixMin && PrixMax){
      //   selector.salesPrice = {$and: [ { $gte: PrixMin } , { $lte: PrixMax } ]};
      // }
      if (PrixMin) {
        if(!PrixMax){
        selector.salesPrice= { $gte: PrixMin };
      }
        }
      if (PrixMax) {
        if(!PrixMin){
        selector.salesPrice= { $lte: PrixMax };
        }
        }  
      if (city) {
        selector.city=city;
        }
        if (zone) {
          selector.ZoneSector=zone;
          }
        
    }
    ;
  }

  if (
    type === "hunting" ||
    ((isSearchClient(req.user||req.body) || isSearchClientVip(req.user||req.body)) && !isAdminOrCommercial(req.user||req.body))
  ) {
    selector.propertyStatus = "forsale";
    if (typeBien||PrixMin||PrixMax||city) {
      if (typeBien) {
        selector.type=typeBien;
        }
       // if(PrixMin && PrixMax){
      //   selector.salesPrice = {$and: [ { $gte: PrixMin } , { $lte: PrixMax } ]};
      // }
      if (PrixMin) {
        if(!PrixMax){
        selector.salesPrice= { $gte: PrixMin };
      }
        }
      if (PrixMax) {
        if(!PrixMin){
        selector.salesPrice= { $lte: PrixMax };
        }
        }  
      if (city) {
        selector.city=city;
        }
        if (zone) {
          selector.ZoneSector=zone;
          }
        
    }
  }

  const propertiesCount = await Property.countDocuments(selector).exec();
  const pageCount = Math.ceil(propertiesCount / LIMIT_BY_PAGE);
  //console.log(selector)
  try {
    const properties = await Property.find(
      selector,
      "photos name ref description city propertyStatus salesPrice likeId",
      {
        sort: { createdAt: -1 },
        skip: (pageNumber - 1) * LIMIT_BY_PAGE,
        limit: LIMIT_BY_PAGE
      }
    ).lean();
    //console.log(properties);
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

    if (property.projectId){    
      const project = await Project.findOne({ _id: property.projectId }, null).lean();
      property.project = project;
      const client = await Client.findOne({ _id: project.clientId}, null).lean();
      property.client = client;
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
  "ref name description type yearOfConstruction landArea livingArea salesPrice varangueArea photos virtualVisitLink financialSheet coOwnershipCharge assurancePNO propertyTax accounting cga divers propertyPrice notaryFees works financialExpense equipment financialSheet numberOfRooms kitchenArea roomDescription bathroomArea floor level outdoorParking coveredParking swimmingPool secureEntrance intercom commercialName commercialPhoneNumber sanitation hotWater doubleGlazing electricRollerShutters airConditioner view equippedKitchen freeOfOccupation procedureInProgress numberOfCoOwnershipLots typeOfInvestment rent coOwnershipCharge assurancePNO propertyTax accounting cga divers notaryFees visionRFees works financialExpense equipment agencyFees";

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
