import sequelize from "../db.js";
import { DataTypes } from "sequelize";
const User=sequelize.define("User", {   
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("trainee", "trainer", "admin"),
        allowNull: false,
    },
    otp:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_otp_verified:{
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "SUSPENDED"),
        defaultValue: "APPROVED",
    },
    onboardingCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
}, {
    timestamps: true,
});
export default User;