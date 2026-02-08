import { ValidationError } from "../utils/errors.js";
import { 
  isValidEmail, 
  isValidPassword, 
  validateRequired,
  validateEnum 
} from "../utils/validators.js";
import { ROLES, USER_STATUS, CHAT_TYPE } from "../utils/constants.js";

/**
 * Validate signup request
 */
export const validateSignup = (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    validateRequired(["name", "email", "password", "role"], req.body);
    
    if (!isValidEmail(email)) {
      throw new ValidationError("Invalid email format");
    }
    
    if (!isValidPassword(password)) {
      throw new ValidationError("Password must be at least 6 characters");
    }
    
    validateEnum(role, ROLES, "role");
    
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Validate login request
 */
export const validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    validateRequired(["email", "password"], req.body);
    
    if (!isValidEmail(email)) {
      throw new ValidationError("Invalid email format");
    }
    
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Validate OTP verification
 */
export const validateOTP = (req, res, next) => {
  try {
    const { email, otp } = req.body;
    
    validateRequired(["email", "otp"], req.body);
    
    if (!isValidEmail(email)) {
      throw new ValidationError("Invalid email format");
    }
    
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Validate chat creation
 */
export const validateCreateChat = (req, res, next) => {
  try {
    const { trainerId } = req.body;
    
    if (!trainerId) {
      throw new ValidationError("trainerId is required");
    }
    
    if (typeof trainerId !== "number" && isNaN(parseInt(trainerId))) {
      throw new ValidationError("trainerId must be a valid number");
    }
    
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Validate send message
 */
export const validateSendMessage = (req, res, next) => {
  try {
    const { chatId, content } = req.body;
    
    validateRequired(["chatId", "content"], req.body);
    
    if (!content.trim()) {
      throw new ValidationError("Message content cannot be empty");
    }
    
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Validate payment creation
 */
export const validateCreatePayment = (req, res, next) => {
  try {
    const { chatId } = req.body;
    
    validateRequired(["chatId"], req.body);
    
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
