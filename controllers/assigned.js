import Material from "../models/Material";
import EquipmentAssignments from "../models/EquipmentAssignments";
import { generateError, isAdmin, isAdminOrCommercial } from "../lib/utils";
import { User } from "../models";

export async function DemandeAssignedUser(req, res, next) {
  try {
    const material_id = req.params.materialid;
    const user_email = req.body.email;
    const user = await User.findOne({email:user_email}).exec();

    if (!user) {
      return next(generateError("Wrong arguments", 401));
    }

         await new EquipmentAssignments({
          equipmentId:material_id,
          user_id:user._id,
          status:"demande"
        }).save();
    
    return res.json({ success: true, data: { completed: true } });
  } catch (e) {
    next(generateError(e.message));
  }
}

export async function getAssigne(req, res,next) {
  try{
    const Atente = await EquipmentAssignments.find({
      status:"demande"
    }).lean()

    const materiel = await Promise.all(
      Atente.map(async (Atente) => {
        Atente.material = await Material.findOne({_id:Atente.equipmentId}).lean();
        return Atente
      })
    );

   const user = await Promise.all(
      Atente.map(async (Atente) => {
          
        Atente.user = await User.findOne({_id:Atente.user_id}).lean();
        if(Atente.user){
          return Atente

        }
  }))

    return res.json({ success: true, data: { completed: true ,data:Atente} });

  }catch(e){
    next(generateError(e.message));
  }
}

export async function UpAsignmentsMaterial(req, res,next) {
  try {
    const material_id = req.params.materialid;
          const equipe = await  EquipmentAssignments.updateOne({
          _id:material_id},
          {status:"validate"
        }).exec();
    return res.json({ success: true, data: { completed: true } });
  } catch (e) {
    next(generateError(e.message));
  }
}
export async function asignmentsMaterial(req, res, next) {
    try {
      const material_id = req.params.materialid;
      const user_id = req.body.user_id;
            await new EquipmentAssignments({
            equipmentId:material_id,
            user_id:user_id,
            status:"validate"
          }).save();
      
      return res.json({ success: true, data: { completed: true } });
    } catch (e) {
      next(generateError(e.message));
    }
  }

  export async function SuppAsignmentsMaterial(req, res, next) {
    try {
      const material_id = req.params.materialid;
      // const user_id = req.body.user_id;
      await EquipmentAssignments.deleteOne({equipmentId:material_id}).exec();
      
      return res.json({ success: true, data: { completed: true } });
    } catch (e) {
      next(generateError(e.message));
    }
  }

  export async function fetchAsignments(req, res, next) {
    try {
      const material_id = req.params.materialid;
      if(material_id !== undefined){

        const assigne = await EquipmentAssignments.find({equipmentId: material_id}).lean();
        if (!assigne) {
          return res.json({ success: true, data: { completed: false } });
        }
        return res.json({ success: true, data: { completed: true, assigne:assigne } });
      }

    } catch (e) {
      next(generateError(e.message));
    }
  }
  
  