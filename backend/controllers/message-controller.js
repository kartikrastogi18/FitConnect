import { ChatSession, Message, Payment } from "../models/index.js";
import { getAIReply } from "../services/ai-service.js";
import { CHAT_TYPE, CHAT_STATUS, MESSAGE_SENDER, PAYMENT_STATUS } from "../utils/constants.js";
import { ValidationError, NotFoundError, ForbiddenError } from "../utils/errors.js";

/**
 * GET CHAT MESSAGES
 * GET /messages/:chatId
 */
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const chat = await ChatSession.findByPk(chatId);
    if (!chat) {
      throw new NotFoundError("Chat not found");
    }

    // Check authorization
    if (
      req.user.id !== chat.traineeId &&
      req.user.id !== chat.trainerId &&
      req.user.role !== "admin"
    ) {
      throw new ForbiddenError("Not authorized to view these messages");
    }

    const messages = await Message.findAll({
      where: { chatId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "ASC"]],
    });

    res.json({ 
      success: true, 
      count: messages.length,
      messages 
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch messages",
    });
  }
};

/**
 * BUILD AI CONTEXT FROM MESSAGE HISTORY
 */
export const buildAIContext = (messages) => {
  return messages.map((msg) => ({
    role:
      msg.senderRole === MESSAGE_SENDER.TRAINEE
        ? "user"
        : msg.senderRole === MESSAGE_SENDER.AI
        ? "assistant"
        : "system",
    content: msg.content,
  }));
};

/**
 * SEND MESSAGE
 * POST /messages/send
 */
export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const { id: userId, role } = req.user;

    if (!chatId || !content) {
      throw new ValidationError("chatId and content are required");
    }

    if (!content.trim()) {
      throw new ValidationError("Message content cannot be empty");
    }

    const chat = await ChatSession.findByPk(chatId);

    if (!chat) {
      throw new NotFoundError("Chat not found");
    }

    // Check if chat is active
    if (chat.status !== CHAT_STATUS.ACTIVE) {
      throw new ForbiddenError("Chat is locked or inactive. Payment may be required.");
    }

    // ========== AI CHAT ==========
    if (chat.type === CHAT_TYPE.AI) {
      if (role !== MESSAGE_SENDER.TRAINEE) {
        throw new ForbiddenError("Only trainees can use AI chat");
      }

      if (userId !== chat.traineeId) {
        throw new ForbiddenError("Not authorized to send messages in this chat");
      }

      // Save user message
      const userMessage = await Message.create({
        chatId,
        senderRole: MESSAGE_SENDER.TRAINEE,
        content: content.trim(),
      });

      // Get recent message history for context
      const history = await Message.findAll({
        where: { chatId },
        order: [["createdAt", "DESC"]],
        limit: 10, // Increased from 2 for better context
      });

      const context = buildAIContext(history.reverse());
      context.unshift({
        role: "system",
        content: "You are a fitness coach. Answer in 3–4 lines.",
      });

      // Get AI reply
      const aiReply = await getAIReply(context);

      // Save AI message
      const aiMessage = await Message.create({
        chatId,
        senderRole: MESSAGE_SENDER.AI,
        content: aiReply,
      });

      // Update chat timestamp
      chat.changed("updatedAt", true);
      await chat.save();

      return res.json({
        success: true,
        userMessage,
        aiMessage,
      });
    }

    // ========== TRAINER CHAT ==========
    if (chat.type === CHAT_TYPE.TRAINER) {
      // Verify user is part of this chat
      if (
        userId !== chat.traineeId &&
        userId !== chat.trainerId
      ) {
        throw new ForbiddenError("Not part of this chat");
      }

      // Verify payment is completed
      const payment = await Payment.findOne({
        where: { chatId },
      });

      if (!payment || payment.status !== PAYMENT_STATUS.HELD) {
        throw new ForbiddenError("Payment required to send messages");
      }

      // Determine sender role
      let senderRole;
      if (userId === chat.traineeId) {
        senderRole = MESSAGE_SENDER.TRAINEE;
      } else if (userId === chat.trainerId) {
        senderRole = MESSAGE_SENDER.TRAINER;
      }

      // Save message
      const message = await Message.create({
        chatId,
        senderRole,
        content: content.trim(),
      });

      // Update chat timestamp
      chat.changed("updatedAt", true);
      await chat.save();

      // Emit via Socket.IO to receiver
      const io = req.app.get("io");
      const receiverId =
        userId === chat.traineeId
          ? chat.trainerId
          : chat.traineeId;

      io.to(`user_${receiverId}`).emit("new_message", {
        chatId,
        message: {
          id: message.id,
          senderRole,
          content: message.content,
          createdAt: message.createdAt,
        },
      });

      return res.json({ 
        success: true, 
        message 
      });
    }
  } catch (error) {
    console.error("Send message error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to send message",
    });
  }
};
