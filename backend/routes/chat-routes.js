import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { acceptTrainerChat, createAIChat, createTrainerChat, listMyChats } from "../controllers/chat-controller.js";

const router = express.Router();

router.post("/ai", authMiddleware, createAIChat);
router.post("/trainer", authMiddleware, createTrainerChat);
router.patch("/chats/:chatId/accept", authMiddleware, acceptTrainerChat);
router.get("/my", authMiddleware, listMyChats);




export default router;
