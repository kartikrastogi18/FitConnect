import sequelize from "../db.js";
import { DataTypes } from "sequelize";
import ChatSession from "./ChatSession.js";

const Payment = sequelize.define("Payment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  chatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // One payment per chat
    references: {
      model: ChatSession,
      key: "id",
    },
    onDelete: "CASCADE",
  },

  traineeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  trainerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // 🔑 STRIPE PAYMENT DATA
  stripePaymentIntentId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  amount: {
    type: DataTypes.INTEGER, // ALWAYS store in paise/cents
    allowNull: false,
  },

  currency: {
    type: DataTypes.STRING,
    defaultValue: "inr",
  },

  status: {
    type: DataTypes.ENUM(
      "CREATED",   // payment intent created
      "HELD",      // payment success, money in escrow
      "RELEASED",  // paid to trainer
      "REFUNDED",  // refunded to trainee
      "FAILED"
    ),
    defaultValue: "CREATED",
  },

  // Lifecycle timestamps
  releasedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },

}, {
  timestamps: true,
});

export default Payment;

