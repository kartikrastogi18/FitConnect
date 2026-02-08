import TraineeProfile from "../models/TraineeProfile.js";
// import TrainerProfile from "../models/TrainerProfile.js";
import { User, TrainerProfile } from "../models/index.js";

import { signupService, loginService } from "../services/user-service.js";
import { calculateBMI, getBMICategory } from "../utils/bmi.js";
// import User from "../models/User.js";
import { Op } from "sequelize";
export const completeTraineeOnboarding=async(req,res)=>{
    try{
        const userId=req.user.id;
        const user=await User.findByPk(userId);
        if(!user || user.role!=="trainee"){
            return res.status(403).json({ success:false, message:"Only trainees can complete this onboarding" });
        }
        if(user.onboardingCompleted){
            return res.status(400).json({ success:false, message:"Trainee onboarding already completed" });
        }
        
        const {age,gender,heightCM,weightKG,fitnessGoals,medicalConditions}=req.body;
        const existingProfile=await TraineeProfile.findOne({ where:{ userId } });
        if(existingProfile){
            return res.status(400).json({ success:false, message:"Trainee profile already exists" });
        }
        const bmi = calculateBMI(heightCM, weightKG);
        const bmiCategory = getBMICategory(bmi);
        await TraineeProfile.create({
            userId,age,gender,heightCM,weightKG,fitnessGoals,medicalConditions,  bmi,
            bmiCategory,
        }),
        await User.update({ onboardingCompleted:true },{ where:{ id:userId } });
        res.status(201).json({ success:true, message:"Trainee onboarding completed successfully", bmi,
            bmiCategory });
    }catch(error){
        res.status(500).json({ success:false, message:"Onboarding failed due to server error" });
    }
}


export const searchTrainers = async (req, res) => {
  try {
    const { q, minExperience } = req.query;

    const whereClause = {};

    if (q) {
      whereClause[Op.or] = [
        { specialties: { [Op.iLike]: `%${q}%` } },
        { certifications: { [Op.iLike]: `%${q}%` } },
        { bio: { [Op.iLike]: `%${q}%` } },
        { "$trainerUser.username$": { [Op.iLike]: `%${q}%` } },
        { "$trainerUser.email$": { [Op.iLike]: `%${q}%` } }
      ];
    }

    if (minExperience) {
      whereClause.experienceYears = {
        [Op.gte]: Number(minExperience)
      };
    }

    const trainers = await TrainerProfile.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "trainerUser",
          attributes: ["id", "username", "email"],
          where: {
            role: "trainer",
            status: "APPROVED" 
          }
        }
      ],
      
    });

    res.json({
      success: true,
      count: trainers.length,
      trainers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const getTrainerInfo=async(req,res)=>{
    try{
        const userId=req.user.id;
        const user=await User.findByPk(userId);
        if(!user || user.role!=="trainer"){
            return res.status(403).json({ success:false, message:"Only trainers can access this information" });
        }
        const trainerProfile=await TrainerProfile.findOne({where:{ userId } });
        if(!trainerProfile){
            return res.status(404).json({ success:false, message:"Trainer profile not found" });
        }
        res.status(200).json({ success:true, trainerProfile });
    }
    catch(error){
    console.log(error);
        res.status(500).json({ success:false, message:error.message });
    }
}
export const getTraineeInfo=async(req,res)=>{
    try{
        const userId=req.user.id;
        const user=await User.findByPk(userId);
        if(!user || user.role!=="trainee"){
            return res.status(403).json({ success:false, message:"Only trainees can access this information" });
        }
        const traineeProfile=await TraineeProfile.findOne({where:{ userId } });
        if(!traineeProfile){
            return res.status(404).json({ success:false, message:"Trainee profile not found" });
        }
        res.status(200).json({ success:true, traineeProfile });
    }
    catch(error){
        res.status(500).json({ success:false, message:"Failed to retrieve trainee information due to server error" });
    }
}