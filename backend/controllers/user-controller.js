import { loginService , signupService } from "../services/user-service.js";
import User from "../models/User.js";
export const verify=async(req,res)=>{
    try{
        const{email,otp}=req.body;
        if(!email || !otp){
            return res.status(400).json({success:false,message:"All fields are required"});
        }
        const record=await User.findOne({where:{email}});
        if(!record){
            return res.status(400).json({success:false,message:"User does not exist"});
        }
        if(record.otpVerified){
            return res.status(400).json({success:false,message:"OTP already verified"});
        }
        if(Number(record.otp)!==Number(otp)){
            return res.status(400).json({success:false,message:"Invalid OTP"});
        }
        await User.update({is_otp_verified: true},{where:{email}});
        return res.status(200).json({success:true,message:"OTP verified successfully"});
    }catch(err){
        return res.status(500).json({success:false,message:err.message});
    }
}
export const signup=async(req,res)=>{
    try{
        const {name,email,password,role}=req.body;
        if(!name || !email || !password || !role){
            return res.status(400).json({ success:false, message:"All fields are required" });
        }
        const data=await signupService(name , email , password , role); 
        if(!data.success){
            return res.status(400).json({ success:false, message:data.message });
        }
        res.status(201).json({ success:true, message:data.message, userId:data.userId });

    }catch(error){
        res.status(500).json({ success:false, message:"Signup failed due to server error" });
    }

};
export const login=async(req,res)=>{
    try{
        const{email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({ success:false, message:"Email and password are required" });
        }
        const data=await loginService(email,password);
        if(!data.success){
            return res.status(400).json({ success:false, message:data.message });
        }
        const user=await User.findOne({ where:{email} });
         if(user.role==="trainer" && user.status==="PENDING"){
            return res.status(403).json({ success:false, message:"Your trainer account is still pending approval. Please wait for admin approval." });
        }
        if(user.role==="trainer" && user.status==="SUSPENDED"){
            return res.status(403).json({ success:false, message:"Your trainer account has been suspended. Please contact support for more information." });
        }
        if(!user.is_otp_verified){
            return res.status(403).json({ success:false, message:"Please verify your email before logging in." });
        }
        
        res.status(200).json({ success:true, message:data.message, token:data.token, user:data.user });
    }catch(error){
        res.status(500).json({ success:false, message:"Login failed due to server error" });
    }
};
