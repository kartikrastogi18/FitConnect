import sequelize from "../db.js";
import { DataTypes } from "sequelize";
import User from "./User.js";
const Report=sequelize.define("Report", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    reportedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    reporterUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("PENDING", "REVIEWED", "RESOLVED"),
        defaultValue: "PENDING",
    },
}, {
    timestamps: true,
});
export default Report;