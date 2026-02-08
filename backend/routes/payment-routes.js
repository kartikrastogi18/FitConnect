import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { requireTrainee, requireAdmin } from "../middleware/role-check.js";
import { validateCreatePayment } from "../middleware/validate.js";
import {
  createStripePayment,
  unlockChatAfterPayment,
  releasePayment,
  refundPayment,
  getPaymentStatus,
  getMyPayments,
} from "../controllers/payment-controller.js";

const router = express.Router();

// Trainee routes
router.post("/create", authMiddleware, requireTrainee, validateCreatePayment, createStripePayment);
router.post("/unlock", authMiddleware, requireTrainee, unlockChatAfterPayment);
router.get("/my", authMiddleware, getMyPayments);
router.get("/:paymentId", authMiddleware, getPaymentStatus);

// Admin routes
router.post("/:paymentId/release", authMiddleware, requireAdmin, releasePayment);
router.post("/:paymentId/refund", authMiddleware, requireAdmin, refundPayment);

export default router;
