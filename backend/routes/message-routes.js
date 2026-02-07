import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { sendMessage} from "../controllers/message-controller.js";
import { getChatMessages } from "../controllers/message-controller.js";

const router = express.Router();

router.post("/send", authMiddleware, sendMessage);
router.get(
    "/chats/:chatId/messages",
    authMiddleware,
    getChatMessages
  );
  

export default router;
