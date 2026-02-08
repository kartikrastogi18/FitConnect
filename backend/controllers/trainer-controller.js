import { User, TrainerProfile, ChatSession, Payment } from "../models/index.js";
import { USER_STATUS, PAYMENT_STATUS, CHAT_STATUS } from "../utils/constants.js";
import { ValidationError, NotFoundError, ForbiddenError } from "../utils/errors.js";

/**
 * COMPLETE TRAINER ONBOARDING
 * POST /trainer/onboard
 */
export const completeTrainerOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user || user.role !== "trainer") {
      throw new ForbiddenError("Only trainers can complete this onboarding");
    }

    if (user.onboardingCompleted) {
      throw new ValidationError("Trainer onboarding already completed");
    }

    const { certifications, specialties, experienceYears, bio } = req.body;

    const existingProfile = await TrainerProfile.findOne({ 
      where: { userId } 
    });

    if (existingProfile) {
      throw new ValidationError("Trainer profile already exists");
    }

    await TrainerProfile.create({
      userId,
      certifications,
      specialties,
      experienceYears,
      bio,
    });

    await User.update(
      { onboardingCompleted: true, status: USER_STATUS.PENDING },
      { where: { id: userId } }
    );

    res.status(201).json({
      success: true,
      message: "Trainer onboarding completed successfully. Your account is pending admin approval.",
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Onboarding failed due to server error",
    });
  }
};

/**
 * GET PUBLIC TRAINER PROFILE
 * GET /trainer/:trainerId
 */
export const getPublicTrainerProfile = async (req, res) => {
  try {
    const { trainerId } = req.params;

    const trainerProfile = await TrainerProfile.findOne({
      where: { userId: trainerId },
      attributes: [
        "certifications",
        "specialties",
        "experienceYears",
        "bio",
        "trustScore",
        "currentPayoutPerDay",
      ],
      include: [
        {
          model: User,
          as: "trainerUser",
          attributes: ["id", "username"],
          where: {
            role: "trainer",
            status: USER_STATUS.APPROVED,
          },
        },
      ],
    });

    if (!trainerProfile) {
      throw new NotFoundError("Approved trainer not found");
    }

    res.status(200).json({
      success: true,
      trainer: trainerProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch trainer profile",
    });
  }
};

/**
 * GET ALL APPROVED TRAINERS
 * GET /trainers
 */
export const getAllApprovedTrainers = async (req, res) => {
  try {
    const { specialty, limit = 20, offset = 0 } = req.query;

    const whereClause = {
      role: "trainer",
      status: USER_STATUS.APPROVED,
    };

    const trainers = await User.findAll({
      where: whereClause,
      attributes: ["id", "username"],
      include: [
        {
          model: TrainerProfile,
          as: "trainerProfile",
          attributes: [
            "bio",
            "specialties",
            "experienceYears",
            "trustScore",
            "currentPayoutPerDay",
          ],
          ...(specialty && {
            where: {
              specialties: {
                [Op.like]: `%${specialty}%`,
              },
            },
          }),
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["trainerProfile", "trustScore", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: trainers.length,
      trainers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trainers",
    });
  }
};

/**
 * GET MY EARNINGS (Trainer)
 * GET /trainer/earnings
 */
export const getMyEarnings = async (req, res) => {
  try {
    const trainerId = req.user.id;

    if (req.user.role !== "trainer") {
      throw new ForbiddenError("Only trainers can access earnings");
    }

    // Get all released payments
    const payments = await Payment.findAll({
      where: {
        trainerId,
        status: PAYMENT_STATUS.RELEASED,
      },
      include: [
        {
          model: ChatSession,
          as: "chat",
          attributes: ["id", "createdAt"],
        },
        {
          model: User,
          as: "trainee",
          attributes: ["id", "username"],
        },
      ],
      order: [["releasedAt", "DESC"]],
    });

    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalChats = payments.length;

    // Get pending (held) payments
    const pendingPayments = await Payment.findAll({
      where: {
        trainerId,
        status: PAYMENT_STATUS.HELD,
      },
    });

    const pendingEarnings = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
      success: true,
      earnings: {
        totalEarnings: totalEarnings / 100, // Convert to rupees
        pendingEarnings: pendingEarnings / 100,
        totalChats,
        pendingChats: pendingPayments.length,
        payments,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch earnings",
    });
  }
};

/**
 * GET MY STATS (Trainer)
 * GET /trainer/stats
 */
export const getMyStats = async (req, res) => {
  try {
    const trainerId = req.user.id;

    if (req.user.role !== "trainer") {
      throw new ForbiddenError("Only trainers can access stats");
    }

    const trainer = await User.findByPk(trainerId, {
      include: [{ model: TrainerProfile, as: "trainerProfile" }],
    });

    if (!trainer) {
      throw new NotFoundError("Trainer not found");
    }

    // Get chat stats
    const totalChats = await ChatSession.count({
      where: { trainerId, type: "TRAINER" },
    });

    const activeChats = await ChatSession.count({
      where: { trainerId, type: "TRAINER", status: CHAT_STATUS.ACTIVE },
    });

    const completedChats = await ChatSession.count({
      where: { trainerId, type: "TRAINER", status: CHAT_STATUS.COMPLETED },
    });

    // Get earnings
    const totalEarnings = await Payment.sum("amount", {
      where: { trainerId, status: PAYMENT_STATUS.RELEASED },
    });

    res.status(200).json({
      success: true,
      stats: {
        profile: {
          trustScore: trainer.trainerProfile?.trustScore || 0,
          status: trainer.status,
        },
        chats: {
          totalChats,
          activeChats,
          completedChats,
        },
        earnings: {
          totalEarnings: (totalEarnings || 0) / 100,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch stats",
    });
  }
};