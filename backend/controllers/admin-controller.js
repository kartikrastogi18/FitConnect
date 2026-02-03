import {User, TrainerProfile} from "../models/index.js";
export const getPendingTrainers=async(req,res)=>{
    try{
        const trainer=await User.findAll({
            where:{
                role:trainer,
                status:"PENDING"
        
            },
             attributes:["id","username","email","status"],
             include:[{
                model:TrainerProfile,
                attributes:["certifications","specialties","experienceYears","bio","trustScore"],

             }]
        });
        res.status(200).json({
            success: true,
            count: trainer.length,
            trainer
          });
    }
    catch(error){
        res.status(500).json({ success:false, message:"Failed to fetch pending trainers" });
    }
}
export const approveRejectTrainer=async(req,res)=>{
    try{
        const {trainerId}=req.params;
        const {status}=req.body;
        if(!["APPROVED","REJECTED"].include(status)){
            return res.status(400).json({success:false,message:"Invalid status value"});
        }
        const trainer = await User.findOne({
            where: {
              id: trainerId,
              role: "trainer"
            }
          });
        if(!trainer){
            return res.status(404).json({success:false,message:"Trainer not found"});
        }
        
    trainer.status = status;
    await trainer.save();
    res.status(200).json({
        success: true,
        message: `Trainer ${status.toLowerCase()} successfully`
      });
    }catch(error){
        res.status(500).json({success:false,message:"Failed to update trainer status"});
    }
}

