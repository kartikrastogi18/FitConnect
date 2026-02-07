import ChatSession from "../models/ChatSession.js";

import User from "../models/User.js";

export const listMyChats = async (req, res) => {
  try {
    let chats = [];

    if (req.user.role === "trainee") {
      chats = await ChatSession.findAll({
        where: { traineeId: req.user.id },
        order: [["updatedAt", "DESC"]],
      });
    }

    if (req.user.role === "trainer") {
      chats = await ChatSession.findAll({
        where: { trainerId: req.user.id },
        order: [["updatedAt", "DESC"]],
      });
    }

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
    });
  }
};


export const createAIChat = async (req, res) => {
  try {
    const userId = req.user.id;

    // check if active AI chat already exists
    const existingChat = await ChatSession.findOne({
      where: {
        traineeId: userId,
        type: "AI",
        status: "ACTIVE"
      }
    });

    if (existingChat) {
      return res.status(200).json({
        success: true,
        chat: existingChat
      });
    }

    const chat = await ChatSession.create({
      traineeId: userId,
      trainerId: null,
      type: "AI"
    });

    res.status(201).json({
      success: true,
      chat
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create AI chat"
    });
  }
};
export const createTrainerChat = async (req, res) => {
    try {
      const { trainerId } = req.body;
  
      if (req.user.role !== "trainee") {
        return res.status(403).json({ message: "Only trainees can start trainer chat" });
      }
  
      const chat = await ChatSession.create({
        traineeId: req.user.id,
        trainerId,
        type: "TRAINER",
        status: "PENDING"
      });
  
      res.status(201).json({ success: true, chat });
    } catch (error) {
      res.status(500).json({ message: "Failed to create trainer chat" });
    }
  };
  export const acceptTrainerChat = async (req, res) => {
    const chat = await ChatSession.findByPk(req.params.chatId);
  
    if (!chat || chat.trainerId !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }
  
    chat.status = "ACTIVE";
    await chat.save();
  
    res.json({ success: true, chat });
  };
  