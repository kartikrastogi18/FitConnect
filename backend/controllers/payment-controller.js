import Stripe from "stripe";
import { Payment, ChatSession, User, TrainerProfile } from "../models/index.js";
import config from "../config/index.js";
import { PAYMENT_STATUS, CHAT_STATUS, PAYMENT_AMOUNTS } from "../utils/constants.js";
import { ValidationError, NotFoundError, ForbiddenError } from "../utils/errors.js";
import sequelize from "../db.js";

const stripe = new Stripe(config.stripe.secretKey);

/**
 * CREATE STRIPE PAYMENT (TEST MODE)
 * POST /payments/create
 */
export const createStripePayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { chatId } = req.body;
    const traineeId = req.user.id;

    if (!chatId) {
      throw new ValidationError("chatId is required");
    }

    const chat = await ChatSession.findByPk(chatId, {
      include: [
        {
          model: User,
          as: "trainer",
          include: [{ model: TrainerProfile, as: "trainerProfile" }],
        },
      ],
    });

    if (!chat || chat.type !== "TRAINER") {
      throw new ValidationError("Invalid trainer chat");
    }

    if (chat.traineeId !== traineeId) {
      throw new ForbiddenError("Not allowed to pay for this chat");
    }

    if (chat.status !== "PENDING") {
      throw new ValidationError("Chat already active or completed");
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      where: { chatId },
    });

    if (existingPayment) {
      throw new ValidationError("Payment already exists for this chat");
    }

    // Get trainer's payout amount or use default
    const trainerProfile = chat.trainer?.trainerProfile;
    const amount = trainerProfile?.currentPayoutPerDay 
      ? trainerProfile.currentPayoutPerDay * 100 // Convert to paise
      : PAYMENT_AMOUNTS.TRAINER_CHAT_PRICE;

    // Create Stripe PaymentIntent (TEST MODE)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: "inr",
      automatic_payment_methods: { enabled: true },
      metadata: {
        chatId: chatId.toString(),
        traineeId: traineeId.toString(),
        trainerId: chat.trainerId.toString(),
      },
    });

    // Store payment in DB
    const payment = await Payment.create(
      {
        chatId,
        traineeId,
        trainerId: chat.trainerId,
        stripePaymentIntentId: paymentIntent.id,
        amount: Math.round(amount),
        status: PAYMENT_STATUS.CREATED,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      amount: Math.round(amount),
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Payment creation error:", error);
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create payment",
    });
  }
};

/**
 * AUTO-UNLOCK CHAT AFTER PAYMENT SUCCESS
 * POST /payments/unlock
 */
export const unlockChatAfterPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { chatId } = req.body;
    const traineeId = req.user.id;

    const payment = await Payment.findOne({
      where: {
        chatId,
        traineeId,
      },
    });

    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    if (payment.status === PAYMENT_STATUS.HELD) {
      throw new ValidationError("Chat already unlocked");
    }

    const chat = await ChatSession.findByPk(chatId);

    if (!chat || chat.status !== CHAT_STATUS.PENDING) {
      throw new ValidationError("Chat already unlocked or invalid");
    }

    // Update payment status to HELD (escrow)
    payment.status = PAYMENT_STATUS.HELD;
    await payment.save({ transaction });

    // Unlock chat
    chat.status = CHAT_STATUS.ACTIVE;
    await chat.save({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Chat unlocked successfully",
      chat,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Chat unlock error:", error);
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to unlock chat",
    });
  }
};

/**
 * RELEASE PAYMENT TO TRAINER (Admin or Auto)
 * POST /payments/:paymentId/release
 */
export const releasePayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findByPk(paymentId, {
      include: [
        { model: ChatSession, as: "chat" },
        { model: User, as: "trainer" },
      ],
    });

    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    if (payment.status !== PAYMENT_STATUS.HELD) {
      throw new ValidationError("Payment is not in HELD status");
    }

    // Update payment status
    payment.status = PAYMENT_STATUS.RELEASED;
    payment.releasedAt = new Date();
    await payment.save({ transaction });

    // Mark chat as completed
    if (payment.chat) {
      payment.chat.status = CHAT_STATUS.COMPLETED;
      await payment.chat.save({ transaction });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Payment released to trainer successfully",
      payment,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Payment release error:", error);
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to release payment",
    });
  }
};

/**
 * REFUND PAYMENT TO TRAINEE (Admin only)
 * POST /payments/:paymentId/refund
 */
export const refundPayment = async (req, res) => {
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

    // Create Stripe refund
    try {
      await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
      });
    } catch (stripeError) {
      console.error("Stripe refund error:", stripeError);
      throw new Error("Failed to process refund with Stripe");
    }

    // Update payment status
    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.refundedAt = new Date();
    await payment.save({ transaction });

    // Mark chat as cancelled
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
    console.error("Payment refund error:", error);
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to refund payment",
    });
  }
};

/**
 * GET PAYMENT STATUS
 * GET /payments/:paymentId
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findByPk(paymentId, {
      include: [
        { model: ChatSession, as: "chat" },
        { model: User, as: "trainee", attributes: ["id", "username", "email"] },
        { model: User, as: "trainer", attributes: ["id", "username", "email"] },
      ],
    });

    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    // Check authorization
    if (
      req.user.role !== "admin" &&
      req.user.id !== payment.traineeId &&
      req.user.id !== payment.trainerId
    ) {
      throw new ForbiddenError("Not authorized to view this payment");
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to get payment status",
    });
  }
};

/**
 * GET MY PAYMENTS (Trainee or Trainer)
 * GET /payments/my
 */
export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let whereClause = {};
    if (role === "trainee") {
      whereClause.traineeId = userId;
    } else if (role === "trainer") {
      whereClause.trainerId = userId;
    } else {
      throw new ForbiddenError("Invalid role for this endpoint");
    }

    const payments = await Payment.findAll({
      where: whereClause,
      include: [
        { model: ChatSession, as: "chat" },
        { model: User, as: "trainee", attributes: ["id", "username"] },
        { model: User, as: "trainer", attributes: ["id", "username"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to get payments",
    });
  }
};
