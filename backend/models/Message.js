import sequelize from "../db.js";
import { DataTypes } from "sequelize";
import ChatSession from "./ChatSession.js";
const Message=sequelize.define("Message", {
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
    senderRole: {
        type: DataTypes.ENUM("trainee", "trainer"),
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    timestamps: true,
});
export default Message;