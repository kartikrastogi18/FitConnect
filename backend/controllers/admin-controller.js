import { User, TrainerProfile, Payment, ChatSession } from "../models/index.js";
import { USER_STATUS, PAYMENT_STATUS, CHAT_STATUS } from "../utils/constants.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { Op } from "sequelize";
import sequelize from "../db.js";

// ==============================
// GET PENDING TRAINERS
// ==============================
export const getPendingTrainers = async (req, res) => {
  try {
    const trainers = await User.findAll({
      where: {
        role: "trainer",
        status: USER_STATUS.PENDING,
      },
      attributes: ["id", "username", "email", "status", "createdAt"],
      include: [
        {
          model: TrainerProfile,
          as: "trainerProfile",
          attributes: [
            "certifications",
            "specialties",
            "experienceYears",
            "bio",
            "trustScore",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
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
      message: "Failed to fetch pending trainers",
    });
  }
};

// ==============================
// APPROVE / REJECT TRAINER
// ==============================
export const approveRejectTrainer = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const { status } = req.body;

    if (![USER_STATUS.APPROVED, USER_STATUS.REJECTED].includes(status)) {
      throw new ValidationError("Invalid status value");
    }

    const trainer = await User.findOne({
      where: {
        id: trainerId,
        role: "trainer",
      },
    });

    if (!trainer) {
      throw new NotFoundError("Trainer not found");
    }

    trainer.status = status;
    await trainer.save();

    res.status(200).json({
      success: true,
      message: `Trainer ${status.toLowerCase()} successfully`,
      trainer: {
        id: trainer.id,
        username: trainer.username,
        status: trainer.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update trainer status",
    });
  }
};

// ==============================
// GET ALL PAYMENTS (Admin)
// ==============================
export const getAllPayments = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const whereClause = {};
    if (status && Object.values(PAYMENT_STATUS).includes(status)) {
      whereClause.status = status;
    }

    const payments = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: ChatSession,
          as: "chat",
          attributes: ["id", "type", "status"],
        },
        {
          model: User,
          as: "trainee",
          attributes: ["id", "username", "email"],
        },
        {
          model: User,
          as: "trainer",
          attributes: ["id", "username", "email"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: payments.count,
      payments: payments.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};

// ==============================
// RELEASE PAYMENT (Admin)
// ==============================
export const releasePaymentAdmin = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { paymentId } = req.params;

    const payment = await Payment.findByPk(paymentId, {
      include: [{ model: ChatSession, as: "chat" }],
    });

    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    if (payment.status !== PAYMENT_STATUS.HELD) {
      throw new ValidationError("Payment is not in HELD status");
    }

    // Update payment
    payment.status = PAYMENT_STATUS.RELEASED;
    payment.releasedAt = new Date();
    await payment.save({ transaction });

    // Update chat status
    if (payment.chat) {
      payment.chat.status = CHAT_STATUS.COMPLETED;
      await payment.chat.save({ transaction });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Payment released successfully",
      payment,
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to release payment",
    });
  }
};

// ==============================
// REFUND PAYMENT (Admin)
// ==============================
export const refundPaymentAdmin = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { paymentId } = req.params;

    const payment = await Payment.findByPk(paymentId, {
      include: [{ model: ChatSession, as: "chat" }],
    });

    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    if (payment.status !== PAYMENT_STATUS.HELD) {
      throw new ValidationError("Payment is not in HELD status");
    }

    // Update payment
    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.refundedAt = new Date();
    await payment.save({ transaction });

    // Update chat status
    if (payment.chat) {
      payment.chat.status = CHAT_STATUS.CANCELLED;
      await payment.chat.save({ transaction });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      payment,
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to refund payment",
    });
  }
};

// ==============================
// GET TRAINER EARNINGS (Admin)
// ==============================
export const getTrainerEarnings = async (req, res) => {
  try {
    const { trainerId } = req.params;

    const trainer = await User.findOne({
      where: { id: trainerId, role: "trainer" },
      include: [{ model: TrainerProfile, as: "trainerProfile" }],
    });

    if (!trainer) {
      throw new NotFoundError("Trainer not found");
    }

    // Get all released payments for this trainer
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
      ],
      order: [["releasedAt", "DESC"]],
    });

    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalChats = payments.length;

    res.status(200).json({
      success: true,
      trainer: {
        id: trainer.id,
        username: trainer.username,
        email: trainer.email,
      },
      earnings: {
        totalEarnings: totalEarnings / 100, // Convert to rupees
        totalChats,
        payments,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch trainer earnings",
    });
  }
};

// ==============================
// GET PLATFORM STATS (Admin Dashboard)
// ==============================
export const getPlatformStats = async (req, res) => {
  try {
    // Total users by role
    const totalTrainees = await User.count({ where: { role: "trainee" } });
    const totalTrainers = await User.count({ 
      where: { role: "trainer", status: USER_STATUS.APPROVED } 
    });
    const pendingTrainers = await User.count({ 
      where: { role: "trainer", status: USER_STATUS.PENDING } 
    });

    // Total chats
    const totalChats = await ChatSession.count();
    const activeChats = await ChatSession.count({ 
      where: { status: CHAT_STATUS.ACTIVE } 
    });

    // Payment stats
    const totalPayments = await Payment.count();
    const heldPayments = await Payment.count({ 
      where: { status: PAYMENT_STATUS.HELD } 
    });
    const releasedPayments = await Payment.count({ 
      where: { status: PAYMENT_STATUS.RELEASED } 
    });

    // Total revenue
    const revenueResult = await Payment.sum("amount", {
      where: { status: PAYMENT_STATUS.RELEASED },
    });
    const totalRevenue = (revenueResult || 0) / 100; // Convert to rupees

    res.status(200).json({
      success: true,
      stats: {
        users: {
          totalTrainees,
          totalTrainers,
          pendingTrainers,
        },
        chats: {
          totalChats,
          activeChats,
        },
        payments: {
          totalPayments,
          heldPayments,
          releasedPayments,
        },
        revenue: {
          totalRevenue,
          currency: "INR",
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch platform stats",
    });
  }
};
