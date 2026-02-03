import express from "express";
import { completeTraineeOnboarding, getTraineeInfo, getTrainerInfo, searchTrainers } from "../controllers/trainee-controller.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { getPublicTrainerProfile } from "../controllers/trainer-controller.js";
const router = express.Router();
router.post("/onboarding/trainee", authMiddleware, completeTraineeOnboarding);
router.get("/trainers/search", authMiddleware, searchTrainers);
router.get("/trainers/information", authMiddleware, getTrainerInfo);
router.get("/trainers/:trainerId", getPublicTrainerProfile);
router.get("/trainee/information", authMiddleware, getTraineeInfo);



export default router;
