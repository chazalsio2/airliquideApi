import Property from "../models/Property";
import Project from "../models/Project";
import { sendMatchPropertiesEmail } from "./email";

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
  // conditions.salesMandate = true;
  conditions.type = propertyType;
  conditions.status = "available";
  // conditions.public = true;
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
