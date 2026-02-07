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

  // 🔑 PAYMENT GATEWAY DATA
  orderId: {
    type: DataTypes.STRING,
    allowNull: false, // Razorpay order_id
  },

  paymentId: {
    type: DataTypes.STRING, // Razorpay payment_id
    allowNull: true,
  },

  signature: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  amount: {
    type: DataTypes.INTEGER, // ALWAYS store in paise
    allowNull: false,
  },

  currency: {
    type: DataTypes.STRING,
    defaultValue: "INR",
  },

  status: {
    type: DataTypes.ENUM(
      "CREATED",   // order created
      "HELD",      // payment success, money in escrow
      "RELEASED",  // paid to trainer
      "REFUNDED",  // refunded to trainee
      "FAILED"
    ),
    defaultValue: "CREATED",
  },

}, {
  timestamps: true,
});

export default Payment;
