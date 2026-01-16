import User from "../models/User.js";
import TraineeProfile from "../models/TraineeProfile.js";
import TrainerProfile from "../models/TrainerProfile.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOTP } from "./mail-service.js";
const signupService = async (name , email , password , role)=>{
    try{
        const existingUser=await User.findOne({ where:{email} });
        if(existingUser){
            return{ success:false, message:"User already exists with this email" };
        }
        const hash = await bcrypt.hash(password, 10);
        const otp=Math.floor(100000 + Math.random()*900000);
        const data=await sendOTP(email, otp);
        if(!data.success){
            return{ success:false, message:"Failed to send OTP", error:data.error };

        }
        const newUser=await User.create({
            username:name,
            email,
            password:hash,
            role,
            otp,
            is_otp_verified:false,
            status:role==="trainer"?"PENDING":"APPROVED",
        });
        return { success:true, message:"User registered successfully. Please verify OTP sent to your email.", userId:newUser.id };
    }catch(error){
       return{ success:false, message:"Signup failed", error:error.message };
    }
}
const createToken=(userID)=>{
    const token=jwt.sign({id:userID},"kartik",{expiresIn:"1d"});
    return token;
}
const loginService=async(email,password)=>{
    try{
        const existingUser=await User.findOne({ where:{email} });
        if(!existingUser){
            return{ success:false, message:"User does not exist" };
        }
        if(existingUser.status==="SUSPENDED"){
            return{ success:false, message:"Your account is suspended. Please contact support." };
        }
        if(existingUser.is_otp_verified===false){
            return{ success:false, message:"Please verify your email before logging in." };
        }
        const isMatch=await bcrypt.compare(password,existingUser.password);
        if(!isMatch){
            return{ success:false, message:"Invalid credentials" };
        }
        const token=createToken(existingUser.id);
        return{ success:true, message:"Login successful", token, user:{ id:existingUser.id, username:existingUser.username, email:existingUser.email, role:existingUser.role, status:existingUser.status } };
    }catch(error){
        return{ success:false, message:"Login failed", error:error.message };
    }
}   
export { signupService, loginService };
