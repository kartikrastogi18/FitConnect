import sequelize from "../db.js";
import { DataTypes } from "sequelize";
import User from "./User.js";
const TrainerProfile=sequelize.define("TrainerProfile", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    certifications: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    specialties: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    experienceYears: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
   trustScore: {
        type: DataTypes.FLOAT,
        defaultValue: 30,
    },
    dailyChatLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    chatsUsedToday: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    currentPayoutPerDay: {  
        type: DataTypes.FLOAT,
        defaultValue: 200,
    },
}, {
    timestamps: true,
});
export default TrainerProfile;