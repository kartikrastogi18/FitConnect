import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { requireAdmin } from "../middleware/role-check.js";
import {
  getPendingTrainers,
  approveRejectTrainer,
  getAllPayments,
  releasePaymentAdmin,
  refundPaymentAdmin,
  getTrainerEarnings,
  getPlatformStats,
} from "../controllers/admin-controller.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

// Trainer management
router.get("/trainers/pending", getPendingTrainers);
router.put("/trainers/:trainerId/status", approveRejectTrainer);
router.get("/trainers/:trainerId/earnings", getTrainerEarnings);

// Payment management
router.get("/payments", getAllPayments);
router.post("/payments/:paymentId/release", releasePaymentAdmin);
router.post("/payments/:paymentId/refund", refundPaymentAdmin);

// Platform stats
router.get("/stats", getPlatformStats);

export default router;
