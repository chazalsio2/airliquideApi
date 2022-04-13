import Property from "../models/Property";
import Project from "../models/Project";
import { sendMatchPropertiesEmail, sendNewPropertyMatch } from "./email";

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
      propertyAreaCondition = { livingArea: { $lt: 30 } };
    } else if (propertyArea === "morethan90") {
      propertyAreaCondition = { livingArea: { $gt: 90 } };
    } else {
      propertyAreaCondition = {
        $and: [{ livingArea: { $gte: 30 } }, { livingArea: { $lte: 90 } }]
      };
    }
    
    }

    if (propertyType == terrGar(propertyType)){
        propertyAreaCondition = { landArea: { $gte: propertyLandArea-(propertyLandArea * 0.15) } };
      }
      if (propertyType == AppartMaison(propertyType)){
        if(propertySize === "bigger"){
        propertySizeCondition = { propertySizeDetail : propertySizeDetail}
        }else {
          propertySizeCondition = {numberOfRooms: propertySize}
        }
      }   
  


  const conditions = propertyAreaCondition;
  conditions.type = propertyType;
  conditions.status = "available";
  conditions.propertyStatus = "forsale";
  conditions.public = true;
  conditions.salesPrice = { $lte: (budget * 1.15).toFixed(0) };
  const condition = propertySizeCondition;
  console.log(conditions);
  console.log(condition);
if(condition){
   properties = await Property.find(conditions && condition).exec();
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
  
  sendMatchPropertiesEmail(project, properties);
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
        "wait_purchase_offer",
        "wait_purchase_offer_validation"
      ]
    }
  }).lean();

  searchProjects.forEach(async (searchProject) => {
    const {
      propertyType,
      propertyArea,
      searchSectorCities,
      propertyLandArea,
      budget,
      propertySize,
      propertySizeDetail
    } = searchProject.searchSheet;

    let isCitiesMatch = false;
    let isPropertyAreaMatch = false;
    let propertySizeCondition;

    if(propertyType === setvalue(propertyType)){
    if (propertyArea === "lessthan30") {
      console.log("-30");
      isPropertyAreaMatch = property.livingArea < 30;
    } else if (propertyArea === "morethan90") {
      console.log("+90");
      isPropertyAreaMatch = property.livingArea > 90;
    } else {
      console.log("30 90");
      console.log(searchProject._id);
      isPropertyAreaMatch =
        property.livingArea >= 30 && property.livingArea <= 90;
    }
  }

  if(propertyType === terrGar(propertyType)){
    isPropertyAreaMatch = property.landArea >= property.landArea - (property.landArea * 0.15);
  }

    if (searchSectorCities && !!searchSectorCities.length) {
      isCitiesMatch = searchSectorCities.indexOf(property.city) !== -1;
    }

    if (propertyType == AppartMaison(propertyType)){
      if(propertySize === "bigger"){
      propertySizeCondition = property.propertySizeDetail === propertySizeDetail;
      }else {
        propertySizeCondition = property.numberOfRooms === propertySize;
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
    
      console.log(searchProject);
      await Project.updateOne(
        { _id: searchProject._id },
        { $addToSet: { matchedProperties: propertyId } }
      ).exec();
      }
    /*if (
      isPropertyMatch &&
      isBudgetMatch &&
      isPropertyAreaMatch,
      propertySizeCondition
    ) {
      

      sendNewPropertyMatch(searchProject, property);
    }*/
  });
}
