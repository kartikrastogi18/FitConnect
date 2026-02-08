import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { validateSendMessage } from "../middleware/validate.js";
import {
  getChatMessages,
  sendMessage,
} from "../controllers/message-controller.js";

const router = express.Router();

// All message routes require authentication
router.use(authMiddleware);

// Get messages for a chat
router.get("/:chatId", getChatMessages);

// Send a message
router.post("/send", validateSendMessage, sendMessage);

export default router;
