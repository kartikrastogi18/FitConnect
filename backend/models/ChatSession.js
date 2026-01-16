import sequelize from "../db.js";
import { DataTypes } from "sequelize";
import User from "./User.js";
const ChatSession=sequelize.define("ChatSession", {
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
    trainerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    status: {
        type: DataTypes.ENUM("ACTIVE", "COMPLETED", "CANCELLED"),
        defaultValue: "ACTIVE",
    },
}, {
    timestamps: true,
});
export default ChatSession;