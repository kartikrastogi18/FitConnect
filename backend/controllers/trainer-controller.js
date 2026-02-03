import TraineeProfile from "../models/TraineeProfile.js";
// import TrainerProfile from "../models/TrainerProfile.js";
// import User from "../models/User.js";
import { User, TrainerProfile } from "../models/index.js";

export const completeTrainerOnboarding=async(req,res)=>{
    try{
        console.log("Trainer Onboarding Request Body:");
        const userId=req.id;
        const user=await User.findByPk(userId);
        if(!user || user.role!=="trainer"){
            console.log("Unauthorized onboarding attempt by user:", user.role);
            return res.status(403).json({ success:false, message:"Only trainers can complete this onboarding" });
        }
        if(user.onboardingCompleted){
            return res.status(400).json({ success:false, message:"Trainer onboarding already completed" });
        }
        const {certifications,specialties,experienceYears,bio}=req.body;
        const existingProfile=await TrainerProfile.findOne({ where:{ userId } });
        if(existingProfile){
            return res.status(400).json({ success:false, message:"Trainer profile already exists" });
        }
        await TrainerProfile.create({
            userId,certifications,specialties,experienceYears,bio
        });
        await User.update({ onboardingCompleted:true , status:"PENDING" },{ where:{ id:userId } });
        res.status(201).json({ success:true, message:"Trainer onboarding completed successfully. Your account is pending admin approval." });
    }catch(error){
        res.status(500).json({ success:false, message:"Onboarding failed due to server error" });
    }
}
export const getPublicTrainerProfile=async(req,res)=>{
    try{
        const {trainerId}=req.params;
        const trainerProfile=await TrainerProfile.findOne({
            where:{userId:trainerId
            },
            attributes:[
                "certifications",
                "specialties",
                "experienceYears",
                "bio",
                "trustScore"
               
            ],
            include:[{
                model:User,
                as:"trainerUser",
                attributes:["id","username"],
                where: {
                    role: "trainer",
                    status: "APPROVED" 
                  }
            }]
        });
        if (!trainerProfile) {
            return res.status(404).json({
              success: false,
              message: "Trainer not found"
            });
          }
      
          res.status(200).json({
            success: true,
            trainer: trainerProfile
          });
    }catch(error){

        res.status(500).json({ success:false, message:error.message });
    }
}