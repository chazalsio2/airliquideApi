import moment from "moment";
import Material from "../models/Material";
import EquipmentAssignments from "../models/EquipmentAssignments";
import Insul_r from "../models/Insul_r";
import User from "../models/User";
import { generateError } from "../lib/utils";
import Project, { projectTypes } from "../models/Project";
import ProjectEvent from "../models/ProjectEvent";
import { sendNewClientWebhook } from '../services/webhook.service';

export async function getClients(req, res, next) {
  try {
    const LIMIT_BY_PAGE = 10;
    const { page = "", filter = "", types } = req.query;
    const pageNumber = Number(page) || 1;

    const projects = await Project.find({
      status: { $nin: ["canceled", "completed",'missing_information', 'wait_mandate','wait_mandate_validation',"wait_project_validation"] }
    }).lean()

    

    const clients5 = projects.map(p => p.clientId)


    const selector = {
      $or: [
        {
          firstname: { $regex: filter, $options: "i" }
        },
        {
          lastname: { $regex: filter, $options: "i" }
        },
        {
          displayName: { $regex: filter, $options: "i" }
        },
        {
          email: { $regex: filter, $options: "i" }
        },
        {
          phone: { $regex: filter, $options: "i" }
        }
      ]
    };

    if (types) {
      const typesSplitted = types.split(',')
      selector.projectTypes = { $elemMatch: { $in: typesSplitted } }
    }

    selector._id = { $in: clients5 }

    
        const client = await Material.find(selector, null, {
          limit: LIMIT_BY_PAGE,
          skip: (pageNumber - 1) * LIMIT_BY_PAGE,
          sort: { createdAt: -1 }
        }).lean();
  

    const clientCount = await Material.countDocuments(selector).exec();


    const clientsWithProjects = await Promise.all(
      client.map(async (client) => {
        const projects = await Project.find({
          clientId: client._id,
          status: { $nin: ["canceled", "completed",'missing_information', 'wait_mandate','wait_mandate_validation','wait_project_validation'] }
        }).lean();

          if(projects.length > 0){
          client.projects = projects
          return client;

          }
        
        ; 
      })
    );


    const pageCount = Math.ceil(clientCount / LIMIT_BY_PAGE);

    return res.json({
      success: true,
      data: { clients: clientsWithProjects, pageCount, total: clientCount }
    });
  } catch (e) {
    return next(generateError(e.message));
  }
}

export async function getClientInsulR(req, res, next) {
  try {
    const LIMIT_BY_PAGE = 10;
    const { page = "", filter = "", types } = req.query;
    const pageNumber = Number(page) || 1;

    const projects = await Project.find({
      status: { $in: ['missing_information', 'wait_mandate','wait_mandate_validation','wait_project_validation'] }
    }).lean()

    

    const clients5 = projects.map(p => p.clientId)


    const selector = {
      $or: [
        {
          firstname: { $regex: filter, $options: "i" }
        },
        {
          lastname: { $regex: filter, $options: "i" }
        },
        {
          displayName: { $regex: filter, $options: "i" }
        },
        {
          email: { $regex: filter, $options: "i" }
        },
        {
          phone: { $regex: filter, $options: "i" }
        }
      ]
    };

    if (types) {
      const typesSplitted = types.split(',')
      selector.projectTypes = { $elemMatch: { $in: typesSplitted } }
    }

    selector._id = { $in: clients5 }

    
        const client = await Material.find(selector, null, {
          limit: LIMIT_BY_PAGE,
          skip: (pageNumber - 1) * LIMIT_BY_PAGE,
          sort: { createdAt: -1 }
        }).lean();
  

    const clientCount = await Material.countDocuments(selector).exec();


    const clientsWithProjects = await Promise.all(
      client.map(async (client) => {
        const projects = await Project.find({
          clientId: client._id,
          status: { $in: ['missing_information', 'wait_mandate','wait_mandate_validation','wait_project_validation'] }
        }).lean();

          if(projects.length > 0){
          client.projects = projects
          return client;

          }
        
        ; 
      })
    );


    const pageCount = Math.ceil(clientCount / LIMIT_BY_PAGE);
          
       
    return res.json({
      success: true,
      data: { clients: clientsWithProjects, pageCount, total: clientCount }
    });
  } catch (e) {
    return next(generateError(e.message));
  }
}

export async function getClient(req, res, next) {
  try {
    const { clientId } = req.params;
    const client = await Material.findById(clientId).lean();
    const insul_r = await Insul_r.findById(clientId).lean();


    if (!client) {
      if (insul_r) {
        
      }else{
        return next(generateError("Material not found", 404));
    }
    }
    if (!insul_r) {
      if (client) {
        
      }else{
        return next(generateError("Material not found", 404));
    }
    }

    if (client) {
  
      if(client.conseillerId){
         client.user = await User.findById(client.conseillerId).lean();
      }
  
      client.projects = await Project.find(
        {
          clientId: client._id,
          //status: {$nin: ["canceled", "completed"]}
        },
        null,
        { sort: { createdAt: -1 } }
      ).lean();
  
    }else{
      if(insul_r.conseillerId){
        insul_r.user = await User.findById(insul_r.conseillerId).lean();
     }
 
     insul_r.projects = await Project.find(
       {
         clientId: insul_r._id,
         //status: {$nin: ["canceled", "completed"]}
       },
       null,
       { sort: { createdAt: -1 } }
     ).lean();
    }

    return res.json({
      success: true,
      data: {client:client,insul_r:insul_r}
    });
  } catch (e) {
    return res.status(500).json({ success: false });
  }
}



export async function getmaterialPC(req, res, next) {
  try {
    const LIMIT_BY_PAGE = 10;
    const { page = "", filter = "", types ,mandate=""} = req.query;
    const pageNumber = Number(page) || 1;
    const selector = {
          type:mandate === "divers" ?{ $nin: ['Ordinateur', 'mobile']}:{ $regex: mandate , $options: "i" }
    };

    if (types) {
      const typesSplitted = types.split(',')
      selector.type = { $elemMatch: { $in: typesSplitted } }
    }
    const MaterialCount = await Material.countDocuments(selector).exec();

    const material = await Material.find(selector, null, {
      limit: LIMIT_BY_PAGE,
      skip: (pageNumber - 1) * LIMIT_BY_PAGE,
      sort: { createdAt: -1 }
    }).lean();

    const assigned = await Promise.all(
      material.map(async (matérial) => {
        matérial.equipe = await EquipmentAssignments.findOne({equipmentId:matérial._id}, "user_id status").lean();
        return matérial
      })
    );

    const mat = await Promise.all(
      assigned.map(async (assigne) => {
        if (assigne.equipe) {
          
          assigne.user = await User.findById(assigne.equipe.user_id,"displayName _id").lean();
        }
        return assigne
  }))
    // console.log(user);

    // const MaterialCountWithUser = await Promise.all(
    //   material.map(async (material) => {
    //     const users = await User.find({
    //       _Id: material.user_id,
    //     }).lean();
    //     Material.user = users;
    //     return Material;
    //   })
    // );
    // console.log(MaterialCountWithUser);

    const pageCount = Math.ceil(MaterialCount / LIMIT_BY_PAGE);

    return res.json({
      success: true,
      data: { Material: mat, pageCount, total: MaterialCount }
    });
  } catch (e) {
    return next(generateError(e.message));
  }
}
export async function getMyMaterial(req, res, next) {
  try {

    const material = await Material.find().lean()
    const assigne = await EquipmentAssignments.find().lean()
    
    return res.json({ success: true, data: material,assigneEquipe: assigne});
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function createMaterial(req, res, next) {
  try {
    const {
      user_id,
      model,
      nom,
      divers,
      num_seri
    } = req.body;
    const type= req.body.referral !=="divers" ? req.body.referral : divers[0];

    const dataMaterial = {
      type,
      model,
      nom,
      num_seri
    }

    const material = await new Material(dataMaterial).save();

    if (user_id !== "") {
      const assigned = await new EquipmentAssignments({
        equipmentId:material._id,
        user_id:user_id
      }).save();
    }

    return res.json({ success: true, data: { completed: true } });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function addProject(req, res, next) {
  try {
    const { clientId } = req.params;
    const { projectType,ZoneSector } = req.body;

    if (
      !clientId ||
      !projectType ||
      !projectTypes.indexOf(projectType) === -1
    ) {
      return next(generateError("Invalid request", 401));
    }

    const client = await Material.findById(clientId).lean();
    const insul_r = await Insul_r.findById(clientId).lean();

    if (!client) {
      if (insul_r) {
        
      }else{
        return next(generateError("Material not found", 404));
    }
    }
    if (!insul_r) {
      if (client) {
        
      }else{
        return next(generateError("Material not found", 404));
    }
    }
    const project = await new Project({ clientId, type: projectType,ZoneSector:ZoneSector }).save();


    if (client) {
      await Material.updateOne({ _id: clientId }, { $addToSet: { projectTypes: projectType } }).exec()

      await ProjectEvent({
        projectId: project._id,
        type: "project_creation"
      }).save();
    }else{
        await Insul_r.updateOne({ _id: clientId }, { $addToSet: { projectTypes: projectType } }).exec()

        await ProjectEvent({
        projectId: project._id,
        type: "project_creation"
        }).save();
    }

    return res.json({ success: true, data: { projectId: project._id } });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function editClient(req, res, next) {
  try {
    const modifier = req.body;
    const {
      birthday,
      email,
      createdAt,
      updatedAt,
      projects,
      referral,
      typeofincome,
      othertypeofincome,
      typeofrentalincome,
      othertypeofrentalincome,
      principalresidence,
      rentamount,
      creditamount,
      personalincome,
      personalindustry,
      personalseniority,
      personalsituation,
      personalstatus,
      rentalIncome
    } = modifier;

    const {
      spousenationalite,
      spousefirstname,
      spouseaddress,
      spouseemail,
      spouseincome,
      spouseindustry,
      spouselastname,
      spousephone,
      spousedate,
      spouseseniority,
      spousesituation
    } = req.body;

    if (spousefirstname) {
      modifier.spouse = {
        nationalite:spousenationalite,
        firstname: spousefirstname,
        lastname: spouselastname,
        email: spouseemail,
        income: spouseincome,
        industry: spouseindustry,
        phone: spousephone,
        date:spousedate,
        address: spouseaddress,
        seniority: spouseseniority,
        situation: spousesituation
      };
    }

    if (createdAt || updatedAt || projects || referral) {
      return next(generateError("Cannot update some fields", 403));
    }

    if (birthday) {
      modifier.birthday = moment(birthday).toDate();
    }

    if (rentalIncome) {
      modifier.rentalIncome = rentalIncome;
    }

    if (typeofincome) {
      modifier.typesOfIncome = typeofincome;
      delete modifier.typeofincome;
    }

    if (othertypeofincome) {
      modifier.othersTypesOfIncome = othertypeofincome;
      delete modifier.othertypeofincome;
    }
    if (typeofrentalincome) {
      modifier.typesOfRentalIncome = typeofrentalincome;
      delete modifier.typeofrentalincome;
    }
    if (othertypeofrentalincome) {
      modifier.othersTypesOfRentalIncome = othertypeofrentalincome;
      delete modifier.othertypeofrentalincome;
    }
    if (principalresidence) {
      modifier.principalResidence = principalresidence;
      delete modifier.principalresidence;
    }
    if (rentamount) {
      modifier.rentAmount = rentamount;
      delete modifier.rentamount;
    }
    if (creditamount) {
      modifier.creditAmount = creditamount;
      delete modifier.creditamount;
    }
    if (personalincome) {
      modifier.income = personalincome;
      delete modifier.personalincome;
    }
    if (personalindustry) {
      modifier.industry = personalindustry;
      delete modifier.personalindustry;
    }
    if (personalseniority) {
      modifier.seniority = personalseniority;
      delete modifier.personalseniority;
    }
    if (personalsituation) {
      modifier.situation = personalsituation;
      delete modifier.personalsituation;
    }
    if (personalstatus) {
      modifier.status = personalstatus;
      delete modifier.personalstatus;
    }

    const { clientId } = req.params;
    const opts = { runValidators: true };
    const client = await Material.updateOne(
      { _id: clientId },
      { $set: modifier },
      opts
    ).exec();

    return res.json({ success: true, data: client });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function deleteClient(req, res, next) {
  try {
    const { clientId } = req.params;

    const client = await Material.findById(clientId).lean();

    if (!client) {
      throw new Error("Cannot find client", 404);
    }

    await Material.deleteOne({ _id: clientId }).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function deleteProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).lean();

    if (!project) {
      return next(generateError("Project not found", 404));
    }

    await Project.deleteOne({ _id: projectId }).exec();
    // project.projects = await Project.deleteOne(
    //   {
    //     projectId: project._id,
    //   }
    // ).exec();

    return res.json({ success: true });
  } catch (e) {
    next(generateError(e.message));
  }
}
