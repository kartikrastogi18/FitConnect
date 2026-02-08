import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { requireTrainee } from "../middleware/role-check.js";
import { validateCreateChat } from "../middleware/validate.js";
import {
  listMyChats,
  createAIChat,
  createTrainerChat,
  getChatDetails,
  completeChat,
} from "../controllers/chat-controller.js";

const router = express.Router();

// All chat routes require authentication
router.use(authMiddleware);

// Get my chats (trainee or trainer)
router.get("/my", listMyChats);

// Get specific chat details
router.get("/:chatId", getChatDetails);

// Create AI chat (trainee only)
router.post("/ai", requireTrainee, createAIChat);

// Create trainer chat (trainee only)
router.post("/trainer", requireTrainee, validateCreateChat, createTrainerChat);

// Complete chat (trainer or admin)
router.put("/:chatId/complete", completeChat);

export default router;
