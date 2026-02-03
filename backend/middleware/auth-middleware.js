import jwt from "jsonwebtoken";
const authMiddleware = (req, res, next) => {
   try{
        const token = req.headers.authorization?.split(" ")[1];
        console.log("Auth Middleware Token:1", token);
        if (!token) {
            return res.status(401).json({ success:false, message:"No token provided" });
        }
        const decoded = jwt.verify(token, "kartik");
        console.log("Auth Middleware Token:", token);
        // req.id = decoded.id;
        // req.role = decoded.role;
        req.user = {
            id: decoded.id,
            role: decoded.role // may be undefined for now, that's OK
          };
        console.log("Decoded Token in Auth Middleware:", decoded);
        next(); 
   }catch(error){
       return res.status(401).json({ success:false, message:"Unauthorized access" });
   }
};
export default authMiddleware;