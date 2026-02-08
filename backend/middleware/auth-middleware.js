import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { UnauthorizedError } from "../utils/errors.js";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }
    
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired" 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: error.message || "Unauthorized access" 
    });
  }
};

export default authMiddleware;