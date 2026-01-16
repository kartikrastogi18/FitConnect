import express from "express";
import { completeTraineeOnboarding } from "../controllers/trainee-controller.js";
import authMiddleware from "../middleware/auth-middleware.js";
const router = express.Router();
router.post("/onboarding/trainee", authMiddleware, completeTraineeOnboarding);
export default router;
