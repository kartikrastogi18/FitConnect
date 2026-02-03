import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import adminMiddleware from "../middleware/admin-middleware.js";
import { getPendingTrainers, approveRejectTrainer } from "../controllers/admin-controller.js";

const router = express.Router();

router.get("/trainers/pending", authMiddleware, adminMiddleware, getPendingTrainers);
router.put("/trainers/:trainerId/status", authMiddleware, adminMiddleware, approveRejectTrainer);

export default router;
