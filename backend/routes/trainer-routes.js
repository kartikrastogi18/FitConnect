import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { requireTrainer } from "../middleware/role-check.js";
import {
  completeTrainerOnboarding,
  getPublicTrainerProfile,
  getAllApprovedTrainers,
  getMyEarnings,
  getMyStats,
} from "../controllers/trainer-controller.js";

const router = express.Router();

// Public routes (no auth required)
router.get("/trainers", getAllApprovedTrainers);
router.get("/trainers/:trainerId", getPublicTrainerProfile);

// Protected trainer routes
router.post("/trainer/onboard", authMiddleware, requireTrainer, completeTrainerOnboarding);
router.get("/trainer/earnings", authMiddleware, requireTrainer, getMyEarnings);
router.get("/trainer/stats", authMiddleware, requireTrainer, getMyStats);

export default router;
