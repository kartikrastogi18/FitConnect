import sequelize from "../db.js";
import { DataTypes } from "sequelize";
import User from "./User.js";

const ChatSession = sequelize.define(
  "ChatSession",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    traineeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },

    // 🔥 NULL for AI chat
    trainerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "SET NULL",
    },

    // 🔥 EXPLICIT CHAT TYPE
    type: {
      type: DataTypes.ENUM("TRAINER", "AI"),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("PENDING","ACTIVE", "COMPLETED", "CANCELLED"),
      allowNull: false,
      defaultValue: "ACTIVE", // AI chats start active, trainer chats set to PENDING explicitly
    },
  },
  {
    timestamps: true,
  }
);

export default ChatSession;
