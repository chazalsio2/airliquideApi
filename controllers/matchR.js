import Property from "../models/Property";
import Project from "../models/Project";

export async function matchProperties(req, res, next) {
  
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
  
    // if (project.type !== "search") {
    //   throw new Error("Should be a search mandate");
    // }
    try {
    const {
      propertyArea,
      propertyLandArea,
      searchSectorCities,
      budget,
      livingArea,
      ProjectSize,
      typeProject,
      ProjectType,
      ProjectSizeDetail
    } = req.body;

    console.log(req.body);
    
    let propertyAreaCondition;
    let ProjectSizeCondition;
    let properties;
  
  
    
  
  
      if (typeProject == setvalue(typeProject)){
  
    //   if (propertyArea === "lessthan30") {
    //     propertyAreaCondition = { livingArea: { $gt: 0 } };
    //   } else if (propertyArea === "morethan90") {
    //     propertyAreaCondition = { livingArea: { $gte: 76 } };
    //   } else {
    //     propertyAreaCondition = {
    //       $and: [{ livingArea: { $gte: 22 } }]
    //     };
    //   }
      
      }
  
    //   if (typeProject == terrGar(typeProject)){
    //       propertyAreaCondition = { landArea: { $gte: propertyLandArea-(propertyLandArea * 0.15) } };
    //     }
          
    
  
  
    const conditions = {};
    conditions.type = ProjectType;
    conditions.status = "available";
    conditions.propertyStatus = typeProject;
    conditions.public = true;
    conditions.salesPrice = { $lte: (budget * 1.15).toFixed(0) };
    if (ProjectType == terrGar(ProjectType)){
       conditions.landArea = { $gte: propertyLandArea-(propertyLandArea * 0.15) };
    }
    if (ProjectType == setvalue(ProjectType)){
        conditions.livingArea = { $gte: livingArea-(livingArea * 0.15) };
     }
    if (ProjectType == AppartMaison(ProjectType)){
      if(ProjectSize > 4){
         conditions.numberOfRooms = { $gte: 4 };
      }else if (ProjectSize === 1){
         conditions.numberOfRooms = { $gte: 1 } ;
      }else if (ProjectSize === 2){
        conditions.numberOfRooms = { $gte: 1 };
     }else if (ProjectSize === 3){
      conditions.numberOfRooms = { $gte: 2 };
   }else if (ProjectSize === 4){
    conditions.numberOfRooms = { $gte: 3 };
  }
    }
    console.log(conditions);
     properties = await Property.find(conditions).exec();
    console.log(properties);
 
    console.log("Recherche des property selon les conditions");
  
  
    // if (!properties.length) {
    //   if (project.matchedProperties && project.matchedProperties.length) {
    //     await Project.updateOne(
    //       { _id: projectId },
    //       { $unset: { matchedProperties } }
    //     ).exec();
    //     return;
    //   }
    //   return;}
  
    const matchedProperties = properties.filter((property) => {
      if (!searchSectorCities || !searchSectorCities.length) return property;
      return searchSectorCities.indexOf(property.city) !== -1;
    });
  
    // let newMatch;
    /*if (project.matchedProperties && project.matchedProperties.length) {
      newMatch = matchedProperties.filter(
        (p) => project.matchedProperties.indexOf(p._id) === -1
      );
    } else {}*/
  
    
    //   newMatch = matchedProperties;
    
    // // sendMatchPropertiesEmail(project, properties);
    // const matchedPropertiesId = properties.map((p) => p._id);
  
    // await Project.updateOne(
    //   { _id: projectId },
    //   { $set: { matchedProperties: matchedPropertiesId } }
    // ).exec();
  
    return res.json({ success: true,data: matchedProperties });
} catch (e) {
  next(generateError(e.message));
}
  }
  