import express from "express";
import { validateSignup, validateLogin, validateOTP } from "../middleware/validate.js";
import { signup, login, verify } from "../controllers/user-controller.js";

const router = express.Router();

router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.post("/verify", validateOTP, verify);

export default router;