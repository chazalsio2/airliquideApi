import Property from "../models/Property";
import Project from "../models/Project";
import { sendMatchPropertiesEmail, sendNewPropertyMatch } from "./email";
import { sendMatchProjectEmail } from "../services/webhook.service"

export async function matchPropertiesForSearchMandate(projectId) {
  const project = await Project.findById(projectId).exec();

  function terrGar(v){
    if(v=="Terrain de construction") return "Terrain de construction";
    if(v=="Garage / Parking") return "Garage / Parking";
  }

  function setvalue(v) {
    if(v=="Appartement") return "Appartement";
    if(v=="Maison") return "Maison";
    if(v=="Local commercial") return "Local commercial";
    if(v=="Immeuble") return "Immeuble";
  }

  function AppartMaison(v) {
    if(v=="Appartement") return "Appartement";
    if(v=="Maison") return "Maison";
  }

  if (project.type !== "search") {
    throw new Error("Should be a search mandate");
  }

  const {
    propertyType,
    propertyArea,
    propertyLandArea,
    searchSectorCities,
    budget,
    propertySize,
    propertySizeDetail
  } = project.searchSheet;

  let propertyAreaCondition;
  let propertySizeCondition;
  let properties;


  


    if (propertyType == setvalue(propertyType)){

    if (propertyArea === "lessthan30") {
      propertyAreaCondition = { livingArea: { $gt: 0 } };
    } else if (propertyArea === "morethan90") {
      propertyAreaCondition = { livingArea: { $gte: 76 } };
    } else {
      propertyAreaCondition = {
        $and: [{ livingArea: { $gte: 22 } }]
      };
    }
    
    }

    if (propertyType == terrGar(propertyType)){
        propertyAreaCondition = { landArea: { $gte: propertyLandArea-(propertyLandArea * 0.15) } };
      }
        
  


  const conditions = propertyAreaCondition;
  conditions.url_matching;
  conditions.type = propertyType;
  conditions.status = "available";
  conditions.propertyStatus = "forsale";
  conditions.public = true;
  conditions.salesPrice = { $lte: (budget * 1.15).toFixed(0) };
  conditions.propertySizeCondition;
  if (propertyType == terrGar(propertyType)){
     conditions.landArea = { $gte: propertyLandArea-(propertyLandArea * 0.15) };
  }
  if (propertyType == AppartMaison(propertyType)){
    if(propertySize > 4){
       conditions.numberOfRooms = { $gte: 4 };
    }else if (propertySize === 1){
       conditions.numberOfRooms = { $gte: 1 } ;
    }else if (propertySize === 2){
      conditions.numberOfRooms = { $gte: 1 };
   }else if (propertySize === 3){
    conditions.numberOfRooms = { $gte: 2 };
 }else if (propertySize === 4){
  conditions.numberOfRooms = { $gte: 3 };
}
  }
  console.log(conditions);
if(conditions){
   properties = await Property.find(conditions).exec();
  console.log("2 condition");
}else{
   properties = await Property.find(conditions).exec();
  console.log("1 condition");
}
  console.log("Recherche des property selon les conditions");


  if (!properties.length) {
    if (project.matchedProperties && project.matchedProperties.length) {
      await Project.updateOne(
        { _id: projectId },
        { $unset: { matchedProperties } }
      ).exec();
      return;
    }
    return;}

  const matchedProperties = properties.filter((property) => {
    if (!searchSectorCities || !searchSectorCities.length) return property;
    return searchSectorCities.indexOf(property.city) !== -1;
  });

  let newMatch;
  /*if (project.matchedProperties && project.matchedProperties.length) {
    newMatch = matchedProperties.filter(
      (p) => project.matchedProperties.indexOf(p._id) === -1
    );
  } else {}*/

  
    newMatch = matchedProperties;
  
  // sendMatchPropertiesEmail(project, properties);
  const matchedPropertiesId = properties.map((p) => p._id);

  await Project.updateOne(
    { _id: projectId },
    { $set: { matchedProperties: matchedPropertiesId } }
  ).exec();


  return true;
}

export async function checkMatchingForProperty(propertyId) {

  function terrGar(v){
    if(v=="Terrain de construction") return "Terrain de construction";
    if(v=="Garage / Parking") return "Garage / Parking";
  }

  function setvalue(v) {
    console.log(v);
    if(v=="Appartement") return "Appartement";
    if(v=="Maison") return "Maison";
    if(v=="Local commercial") return "Local commercial";
    if(v=="Immeuble") return "Immeuble";
  }

  function AppartMaison(v) {
    if(v=="Appartement") return "Appartement";
    if(v=="Maison") return "Maison";
  }

  const property = await Property.findById(propertyId).lean();

  if (!property) {
    throw new Error("Should be a valid property");
  }

  const searchProjects = await Project.find({
    type: "search",
    status: {
      $in: [
        "wait_mandate",
        "wait_mandate_validation",
        "wait_purchase_offer"]
    }
  }).lean();
if(searchProjects){
  searchProjects.forEach(async (searchProjects) => {
    const {
      propertyType,
      propertyArea,
      searchSectorCities,
      propertyLandArea,
      budget,
      propertySize,
      propertySizeDetail
    } = searchProjects.searchSheet;

    let isCitiesMatch = false;
    let isPropertyAreaMatch = false;
    let propertySizeCondition;

    if(propertyType === setvalue(propertyType)){
    if (propertyArea === "lessthan30") {
      isPropertyAreaMatch = property.livingArea >0;
    } else if (propertyArea === "morethan90") {
      isPropertyAreaMatch = property.livingArea > 76;
    } else {
      isPropertyAreaMatch =
        property.livingArea > 22 ;
    }
  }

  if(propertyType === terrGar(propertyType)){
    isPropertyAreaMatch = property.landArea >= property.landArea - (property.landArea * 0.15);
  }

    if (searchSectorCities && !!searchSectorCities.length) {
      isCitiesMatch = searchSectorCities.indexOf(property.city) !== -1;
    }

    if (propertyType == AppartMaison(propertyType)){
      if(propertySize > 4){
      propertySizeCondition = property.numberOfRooms >= 4;
      }else if (propertySize === 1){
        propertySizeCondition = property.numberOfRooms >= 1  ;
     }else if (propertySize === 2){
      propertySizeCondition = property.numberOfRooms >= 1 ;
    }else if (propertySize === 3){
      propertySizeCondition = property.numberOfRooms >= 2 ;
  }else if (propertySize === 4){
    propertySizeCondition = property.numberOfRooms >= 3 ;
}
    }   

    const isPropertyMatch = propertyType === property.type;
    const isBudgetMatch = property.salesPrice <= budget * 1.15;
    //const is
    /*console.log(isPropertyMatch &&
      isBudgetMatch &&
      isPropertyAreaMatch&&
      propertySizeCondition||
      isPropertyMatch &&
      isBudgetMatch &&
      isPropertyAreaMatch );*/
    
    if (
      isPropertyMatch &&
      isBudgetMatch &&
      isPropertyAreaMatch&&
      propertySizeCondition||
      isPropertyMatch &&
      isBudgetMatch &&
      isPropertyAreaMatch){
        //sendMatchProjectEmail(searchProjects, property);

      console.log(searchProjects._id);
      await Property.updateOne(
        { _id: propertyId },
        { $addToSet: { matchedProject: searchProjects._id } }
      ).exec();
      }

    /*if (
      isPropertyMatch &&
      isBudgetMatch &&
      isPropertyAreaMatch,
      propertySizeCondition
    ) {
     
    }*/
  });
}
}
