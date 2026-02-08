import { ChatSession, User, TrainerProfile, Payment } from "../models/index.js";
import { CHAT_TYPE, CHAT_STATUS, USER_STATUS } from "../utils/constants.js";
import { ValidationError, NotFoundError, ForbiddenError } from "../utils/errors.js";

/**
 * GET MY CHATS
 * GET /chats/my
 */
export const listMyChats = async (req, res) => {
  try {
    let chats = [];

    if (req.user.role === "trainee") {
      chats = await ChatSession.findAll({
        where: { traineeId: req.user.id },
        include: [
          {
            model: User,
            as: "trainer",
            attributes: ["id", "username"],
            required: false,
            include: [
              {
                model: TrainerProfile,
                as: "trainerProfile",
                attributes: ["bio", "trustScore"],
              },
            ],
          },
          {
            model: Payment,
            as: "payment",
            attributes: ["id", "status", "amount"],
            required: false,
          },
        ],
        order: [["updatedAt", "DESC"]],
      });
    }

    if (req.user.role === "trainer") {
      chats = await ChatSession.findAll({
        where: { trainerId: req.user.id },
        include: [
          {
            model: User,
            as: "trainee",
            attributes: ["id", "username"],
          },
          {
            model: Payment,
            as: "payment",
            attributes: ["id", "status", "amount"],
            required: false,
          },
        ],
        order: [["updatedAt", "DESC"]],
      });
    }

    res.json({ success: true, count: chats.length, chats });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
    });
  }
};

/**
 * CREATE AI CHAT
 * POST /chats/ai
 */
export const createAIChat = async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== "trainee") {
      throw new ForbiddenError("Only trainees can create AI chats");
    }

    // Check if active AI chat already exists
    const existingChat = await ChatSession.findOne({
      where: {
        traineeId: userId,
        type: CHAT_TYPE.AI,
        status: CHAT_STATUS.ACTIVE,
      },
    });

    if (existingChat) {
      return res.status(200).json({
        success: true,
        message: "Active AI chat already exists",
        chat: existingChat,
      });
    }

    // Create new AI chat (status defaults to ACTIVE)
    const chat = await ChatSession.create({
      traineeId: userId,
      trainerId: null,
      type: CHAT_TYPE.AI,
      status: CHAT_STATUS.ACTIVE,
    });

    res.status(201).json({
      success: true,
      message: "AI chat created successfully",
      chat,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create AI chat",
    });
  }
};

/**
 * CREATE TRAINER CHAT
 * POST /chats/trainer
 */
export const createTrainerChat = async (req, res) => {
  try {
    const { trainerId } = req.body;

    if (req.user.role !== "trainee") {
      throw new ForbiddenError("Only trainees can start trainer chat");
    }

    if (!trainerId) {
      throw new ValidationError("trainerId is required");
    }

    // Verify trainer exists and is approved
    const trainer = await User.findOne({
      where: {
        id: trainerId,
        role: "trainer",
        status: USER_STATUS.APPROVED,
      },
      include: [{ model: TrainerProfile, as: "trainerProfile" }],
    });

    if (!trainer) {
      throw new NotFoundError("Approved trainer not found");
    }

    // Check if chat already exists between these users
    const existingChat = await ChatSession.findOne({
      where: {
        traineeId: req.user.id,
        trainerId,
        type: CHAT_TYPE.TRAINER,
        status: [CHAT_STATUS.PENDING, CHAT_STATUS.ACTIVE],
      },
    });

    if (existingChat) {
      return res.status(200).json({
        success: true,
        message: "Chat already exists",
        chat: existingChat,
      });
    }

    // Create trainer chat (starts as PENDING until payment)
    const chat = await ChatSession.create({
      traineeId: req.user.id,
      trainerId,
      type: CHAT_TYPE.TRAINER,
      status: CHAT_STATUS.PENDING,
    });

    res.status(201).json({
      success: true,
      message: "Trainer chat created. Payment required to unlock.",
      chat,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create trainer chat",
    });
  }
};

/**
 * GET CHAT DETAILS
 * GET /chats/:chatId
 */
export const getChatDetails = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await ChatSession.findByPk(chatId, {
      include: [
        {
          model: User,
          as: "trainee",
          attributes: ["id", "username", "email"],
        },
        {
          model: User,
          as: "trainer",
          attributes: ["id", "username", "email"],
          required: false,
          include: [
            {
              model: TrainerProfile,
              as: "trainerProfile",
              attributes: ["bio", "specialties", "trustScore"],
            },
          ],
        },
        {
          model: Payment,
          as: "payment",
          attributes: ["id", "status", "amount", "createdAt"],
          required: false,
        },
      ],
    });

    if (!chat) {
      throw new NotFoundError("Chat not found");
    }

    // Check authorization
    if (
      req.user.role !== "admin" &&
      req.user.id !== chat.traineeId &&
      req.user.id !== chat.trainerId
    ) {
      throw new ForbiddenError("Not authorized to view this chat");
    }

    res.json({ success: true, chat });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch chat details",
    });
  }
};

/**
 * COMPLETE CHAT (Mark as completed)
 * PUT /chats/:chatId/complete
 */
export const completeChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await ChatSession.findByPk(chatId);

    if (!chat) {
      throw new NotFoundError("Chat not found");
    }

    // Only trainer or admin can mark as complete
    if (
      req.user.role !== "admin" &&
      req.user.id !== chat.trainerId
    ) {
      throw new ForbiddenError("Only trainer or admin can complete chat");
    }

    if (chat.status !== CHAT_STATUS.ACTIVE) {
      throw new ValidationError("Chat is not active");
    }

    chat.status = CHAT_STATUS.COMPLETED;
    await chat.save();

    res.json({
      success: true,
      message: "Chat marked as completed",
      chat,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to complete chat",
    });
  }
};