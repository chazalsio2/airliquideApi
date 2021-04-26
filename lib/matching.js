import Property from "../models/Property";
import Project from "../models/Project";
import { sendMatchPropertiesEmail, sendNewPropertyMatch } from "./email";

export async function matchPropertiesForSearchMandate(projectId) {
  const project = await Project.findById(projectId).exec();

  if (project.type !== "search") {
    throw new Error("Should be a search mandate");
  }

  const {
    propertyType,
    propertyArea,
    searchSectorCities,
    budget
  } = project.searchSheet;

  let propertyAreaCondition;

  if (propertyArea === "lessthan30") {
    propertyAreaCondition = { livingArea: { $lt: 30 } };
  } else if (propertyArea === "morethan90") {
    propertyAreaCondition = { livingArea: { $gt: 90 } };
  } else {
    propertyAreaCondition = {
      $and: [{ livingArea: { $gte: 30 } }, { livingArea: { $lte: 90 } }]
    };
  }

  const conditions = propertyAreaCondition;
  conditions.type = propertyType;
  conditions.status = "available";
  conditions.propertyStatus = "forsale";
  conditions.public = true;
  conditions.salesPrice = { $lt: budget * 100 };
  const properties = await Property.find(conditions).exec();

  if (!properties.length) return;

  const matchedProperties = properties.filter((property) => {
    if (!searchSectorCities || !searchSectorCities.length) return property;
    return searchSectorCities.indexOf(property.city) !== -1;
  });

  let newMatch;
  if (project.matchedProperties && project.matchedProperties.length) {
    newMatch = matchedProperties.filter(
      (p) => project.matchedProperties.indexOf(p._id) === -1
    );
  } else {
    newMatch = matchedProperties;
  }
  sendMatchPropertiesEmail(project, newMatch);
  const matchedPropertiesId = newMatch.map((p) => p._id);

  await Project.updateOne(
    { _id: projectId },
    { $set: { matchedProperties: matchedPropertiesId } }
  ).exec();

  return true;
}

export async function checkMatchingForProperty(propertyId) {
  const property = await Property.findById(propertyId).lean();

  if (!property) {
    throw new Error("Should be a valid property");
  }

  const searchProjects = await Project.find({
    type: "search",
    status: {
      $in: [
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
      budget
    } = searchProject.searchSheet;

    let isCitiesMatch = false;
    let isPropertyAreaMatch = false;

    if (propertyArea === "lessthan30") {
      isPropertyAreaMatch = property.livingArea < 30;
    } else if (propertyArea === "morethan90") {
      isPropertyAreaMatch = property.livingArea > 90;
    } else {
      isPropertyAreaMatch =
        property.livingArea >= 30 && property.livingArea <= 90;
    }

    if (searchSectorCities && !!searchSectorCities.length) {
      isCitiesMatch = searchSectorCities.indexOf(property.city) !== -1;
    }

    const isPropertyMatch = propertyType === property.type;
    const isBudgetMatch = property.salesPrice < budget * 100;

    if (
      isPropertyMatch &&
      isBudgetMatch &&
      isCitiesMatch &&
      isPropertyAreaMatch
    ) {
      await Project.updateOne(
        { _id: project._id },
        { $addToSet: { matchedProperties: propertyId } }
      ).exec();

      sendNewPropertyMatch(searchProject, property);
    }
  });
}
