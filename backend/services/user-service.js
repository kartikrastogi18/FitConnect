import User from "../models/User.js";
import TraineeProfile from "../models/TraineeProfile.js";
import TrainerProfile from "../models/TrainerProfile.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOTPAsync } from "./mail-service.js";
import config from "../config/index.js";

/**
 * Non-blocking signup service
 * Creates user and returns immediately, sends OTP asynchronously
 */
const signupService = async (name, email, password, role) => {
  try {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return { success: false, message: "User already exists with this email" };
    }

    // 2. Hash password
    const hash = await bcrypt.hash(password, 10);

    // 3. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // 4. Create user in database
    const newUser = await User.create({
      username: name,
      email,
      password: hash,
      role,
      otp,
      is_otp_verified: false,
      status: role === "trainer" ? "PENDING" : "APPROVED",
    });

    // 5. Send OTP asynchronously (non-blocking) ⚡
    // This happens in the background and doesn't block the response
    sendOTPAsync(email, otp);

    // 6. Return success immediately
    return {
      success: true,
      message: "User registered successfully. Please check your email for OTP verification.",
      userId: newUser.id,
    };
  } catch (error) {
    console.error("❌ Signup error:", error);
    return { success: false, message: "Signup failed", error: error.message };
  }
};
const createToken=(userID,role)=>{
    const token=jwt.sign(
        {id:userID,role:role},
        config.jwt.secret,
        {expiresIn:config.jwt.expiresIn}
    );
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
        const token=createToken(existingUser.id,existingUser.role);
        return{ success:true, message:"Login successful", token, user:{ id:existingUser.id, username:existingUser.username, email:existingUser.email, role:existingUser.role, status:existingUser.status, onboardingCompleted:existingUser.onboardingCompleted } };
    }catch(error){
        return{ success:false, message:"Login failed", error:error.message };
    }
}   
export { signupService, loginService };
