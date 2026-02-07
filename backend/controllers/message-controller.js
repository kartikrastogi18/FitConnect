
import { ChatSession, Message } from "../models/index.js";
import { getAIReply } from "../services/ai-service.js";


export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await ChatSession.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // 🔐 ACCESS CONTROL
    if (
      req.user.id !== chat.traineeId &&
      req.user.id !== chat.trainerId
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const messages = await Message.findAll({
      where: { chatId },
      order: [["createdAt", "ASC"]],
    });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};


export const buildAIContext = (messages) => {
    return messages.map((msg) => ({
      role:
        msg.senderRole === "trainee" ? "user" :
        msg.senderRole === "ai" ? "assistant" :
        "system",
      content: msg.content
    }));
  };

export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const { id: userId, role } = req.user;

    if (!chatId || !content) {
      return res.status(400).json({
        success: false,
        message: "chatId and content are required"
      });
    }

    const chat = await ChatSession.findByPk(chatId);

    if (!chat || chat.status !== "ACTIVE") {
      return res.status(404).json({
        success: false,
        message: "Chat not found or inactive"
      });
    }

    // AI chat → trainee only
    if (chat.type === "AI" && role !== "trainee") {
        console.log(role );
      return res.status(403).json({
        success: false,
        message: "Only trainees can use AI chat"
      });
    }

    // Save trainee message
    const userMessage = await Message.create({
      chatId,
      senderRole: role,
      content
    });

    let aiMessage = null;

    if (chat.type === "AI") {
      const history = await Message.findAll({
        where: { chatId },
        order: [["createdAt", "ASC"]],
        limit: 2// low RAM safe
      });

      const context = buildAIContext(history);

      context.unshift({
        role: "system",
        content:
          "You are a fitness coach. Answer in 3–4 lines."
      });

      const aiReply = await getAIReply(context);

      aiMessage = await Message.create({
        chatId,
        senderRole: "ai",
        content: aiReply
      });
    }
    if (chat.type === "TRAINER") {
        if (
          req.user.id !== chat.traineeId &&
          req.user.id !== chat.trainerId
        ) {
          return res.status(403).json({ message: "Not part of this chat" });
        }
      
        await Message.create({
          chatId,
          senderRole: req.user.role, // trainee OR trainer
          content
        });
        const io = req.app.get("io");

if (chat.type === "TRAINER") {
  const receiverId =
    req.user.id === chat.traineeId
      ? chat.trainerId
      : chat.traineeId;

  io.to(`user_${receiverId}`).emit("new_message", {
    chatId,
    senderRole: req.user.role,
    content,
  });
}

        return res.json({ success: true });
      }
      

    res.status(201).json({
      success: true,
      userMessage,
      aiMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to send message"
    });
  }
};

