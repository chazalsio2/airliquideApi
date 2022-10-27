import Property from "../models/Property";
import Project from "../models/Project";
import Client from "../models/Client";
import Insul_r from "../models/Insul_r";
import User from "../models/User";
import { generateError, isAdmin, isAdminOrCommercial } from "../lib/utils";


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
    const {
      typeProject,
    } = req.body;

    if(typeProject=="Bien"){
      try {
        const {
          propertyArea,
          landArea,
          searchSectorCities,
          budget,
          livingArea,
          ProjectSize,
          typeProject,
          ProjectType,
          ProjectSizeDetail
        } = req.body;
    
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
        conditions.propertyStatus = "forsale";
        conditions.public = true;
        conditions.salesPrice = { $lte: (budget * 1.15).toFixed(0) };
        if (ProjectType == terrGar(ProjectType)){
           conditions.landArea = { $gte: landArea-(landArea * 0.15) };
        }
        if (ProjectType == setvalue(ProjectType)){
            conditions.livingArea = { $gte: livingArea-(livingArea * 0.15) };
         }
        if (ProjectType == AppartMaison(ProjectType)){
          if(ProjectSize === "bigger"){
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
      
        return res.json({ success: true,data: properties.length > 0 ?properties:null ,body:true,search:req.body});
    } catch (e) {
      next(generateError(e.message));
    }
    }else if(typeProject==="Project"){
      try {
        // const searchProjects = await Project.find({
      //   type: "search",
      //   status: {
      //     $in: [
      //       "wait_mandate",
      //       "wait_mandate_validation",
      //       "wait_purchase_offer"]
      //   }
      // }).lean();

      const {
        landArea,
        budget,
        livingArea,
        ProjectSize,
        ProjectType,
        ProjectSizeDetail
      } = req.body;
 console.log(req.body);

//  if (!landArea||
//   !budget||
//   !livingArea||
//   !ProjectSize||
//   !ProjectType||
//   !ProjectSizeDetail) {

//     return next(generateError( 403));
//  }
      
    const conditions = {
    };
    // searchSheet: {
    //   propertyArea:ProjectType === setvalue(ProjectType) ? livingArea < 30 ? {$in:["lessthan30","lessthan90","morethan90"]}:livingArea >76 ? {$in:["lessthan90","morethan90"]}:{$in:["lessthan30","lessthan90","morethan90"]}:null,
    //   propertyLandArea:ProjectType === terrGar(ProjectType) ? { $gte:landArea - (landArea * 0.15)}:null,
    //   propertySize:ProjectType == AppartMaison(ProjectType) ? ProjectSize > 4 ?{ $gte: 4}: ProjectSize === 2?{ $gte: 1}:ProjectSize === 1?{ $gte: 1}:ProjectSize === 3? {$gte: 2}: {$gte: 3}:null,
    //   propertyType:ProjectType,
    //   budget:{ $lte: (budget * 1.15).toFixed(0)}
    // }
    //   if(ProjectType === setvalue(ProjectType)){
    //   if (livingArea < 30) {
    //     // isPropertyAreaMatch = property.livingArea >0;
    //     conditions = {'searchSheet.propertyArea':{$in:["lessthan30","lessthan90","morethan90"]}};
    //   } else if (livingArea >76) {
    //     // isPropertyAreaMatch = property.livingArea > 76;
    //     conditions={'searchSheet.propertyArea':{$in:["lessthan90","morethan90"]}};
    //   } else {
    //    // isPropertyAreaMatch = property.livingArea > 22 ;
    //     conditions={'searchSheet.propertyArea':{$in:["lessthan30","lessthan90","morethan90"]}};

    //   }
    // }
  
    // if(ProjectType === terrGar(ProjectType)){
    //   conditions ={'searchSheet.propertyArea': { $gte:landArea - (landArea * 0.15)}};
    // }
  
      // if (searchSectorCities && !!searchSectorCities.length) {
      //   isCitiesMatch = searchSectorCities.indexOf(property.city) !== -1;
      // }
  
  //     if (ProjectType == AppartMaison(ProjectType)){
  //       if(ProjectSize > 4){
  //         conditions = {'searchSheet.propertySize':{ $gte: 4}};
  //       }else if (ProjectSize === 1){
  //         conditions ={'searchSheet.propertySize': { $gte: 1}};
  //      }else if (ProjectSize === 2){
  //         conditions={'searchSheet.propertySize': { $gte: 1}};
  //     }else if (ProjectSize === 3){
  //         conditions={'searchSheet.propertySize':{ $gte: 2}};
  //   }else if (ProjectSize === 4){
  //       conditions={'searchSheet.propertySize':{ $gte: 3}};
  // }
  //     }   
  
      // conditions= {'searchSheet.propertyType':ProjectType};
      // conditions ={'searchSheet.budget':{ $lte: (budget * 1.15).toFixed(0)}};
      conditions.type="search"
      conditions.status={$in: ["missing_information","wait_mandate","wait_mandate_validation","wait_purchase_offer","wait_project_validation"]}
     
      // if (
      //   isPropertyMatch &&
      //   isBudgetMatch &&
      //   isPropertyAreaMatch&&
      //   propertySizeCondition||
      //   isPropertyMatch &&
      //   isBudgetMatch &&
      //   isPropertyAreaMatch){
      //     //sendMatchProjectEmail(searchProjects, property);
  
      //   console.log(searchProjects._id);
        const project = await Project.find(conditions).lean();

        
        const clientEnrichedPromises = project.map(async (project) => {
          project.client = (await Client.findById(project.clientId).lean()||await Insul_r.findById(project.clientId).lean())
          if (project.commercialId) {
            project.commercial = await User.findById(
              project.commercialId,
              "displayName"
            ).lean();
          }
          return project;
        });
    

        const projectsEnriched = await Promise.all(clientEnrichedPromises);

        
        if (projectsEnriched) {
          const projectes = projectsEnriched.filter(projects=>{
          if(projects.searchSheet){
            let isCitiesMatch = false;
            let isPropertyAreaMatch = false;
            let propertySizeCondition ;

            if(ProjectType === setvalue(ProjectType)){
                if (livingArea < 30) {
                  isPropertyAreaMatch = projects.searchSheet.propertyArea ==="lessthan30";
                  // conditions = {'searchSheet.propertyArea':{$in:["lessthan30","lessthan90","morethan90"]}};
                } else if (livingArea >90) {
                  isPropertyAreaMatch = projects.searchSheet.propertyArea ==="lessthan30"||"lessthan90"||"morethan90";
                  // conditions={'searchSheet.propertyArea':{$in:["lessthan90","morethan90"]}};
                } else {
                  isPropertyAreaMatch = projects.searchSheet.propertyArea ==="lessthan30"||"lessthan90";
                  // conditions={'searchSheet.propertyArea':{$in:["lessthan30","lessthan90","morethan90"]}};
        
                }
              }

          if(ProjectType === terrGar(ProjectType)){
            isPropertyAreaMatch = projects.searchSheet.propertyLandArea <= landArea - (landArea * 0.15);
          }
        
            // if (searchSectorCities && !!searchSectorCities.length) {
            //   isCitiesMatch = searchSectorCities.indexOf(property.city) !== -1;
            // }
            // console.log("ProjectSizeDetail  "+ ProjectSizeDetail);
            if (ProjectType == AppartMaison(ProjectType)){
              if(projects.searchSheet.propertySize){
              if(ProjectSize === "bigger"){
              propertySizeCondition = projects.searchSheet.propertySize <= ProjectSizeDetail+1;
              } if (ProjectSize === "1"){
                propertySizeCondition = projects.searchSheet.propertySize <= 2 ;
             } if (ProjectSize === "2"){
              propertySizeCondition = projects.searchSheet.propertySize <= 3 ;
            } if (ProjectSize === "3"){
              propertySizeCondition = projects.searchSheet.propertySize <= 4 ;
          } if (ProjectSize === "4"){
            propertySizeCondition = projects.searchSheet.propertySize <= 5 ;
        }
      }
            }   



            const isPropertyMatch = projects.searchSheet.propertyType === ProjectType;
            const isBudgetMatch = projects.searchSheet.budget >= budget * 0.15;
            //const is
            /*console.log(isPropertyMatch &&
              isBudgetMatch &&
              isPropertyAreaMatch&&
              propertySizeCondition||
              isPropertyMatch &&
              isBudgetMatch &&
              isPropertyAreaMatch );*/
               
              // console.log(projects._id +"  "+ isPropertyMatch + " "+
              // isBudgetMatch + " "+
              // isPropertyAreaMatch+ " "+
              // propertySizeCondition);
              // console.log("_id            " +projects._id) 
              // console.log("isPropertyMatch            " +isPropertyMatch) 
              // console.log("isBudgetMatch             "+isBudgetMatch) 
              //   console.log("isPropertyAreaMatch            "+projects.searchSheet.propertyType +"       "+ ProjectType)
              //   console.log("propertySizeCondition         "+propertySizeCondition)

              if(ProjectType == AppartMaison(ProjectType)){
                if (isPropertyMatch &&
                    isBudgetMatch &&
                    isPropertyAreaMatch&&
                    propertySizeCondition){
                    // console.log(projects);
                    //sendMatchProjectEmail(searchProjects, property);
                    return projects
                  }
              }
              if(ProjectType === terrGar(ProjectType)){
                if (isPropertyMatch &&
                  isBudgetMatch &&
                  isPropertyAreaMatch){
                  console.log(projects);
                  //sendMatchProjectEmail(searchProjects, property);
                  return projects
                }
              }
        }})

        console.log(projectes.length);

  return res.json({ status:400, success: true,project: projectes.length > 0 ? projectes : null ,body:true,search:req.body});
      }

      
          }catch (e) {
            next(generateError(e.message));
          }
          // }
    
        /*if (
          isPropertyMatch &&
          isBudgetMatch &&
          isPropertyAreaMatch,
          propertySizeCondition
        ) {
         
        }*/
    }
    }

   
  