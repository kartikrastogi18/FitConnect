import sequelize from "../db.js";
import { DataTypes } from "sequelize";
import User from "./User.js";
const TraineeProfile=sequelize.define("TraineeProfile", {
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
    age: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    gender:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    weightKG: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    heightCM: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    fitnessGoals: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    medicalConditions: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    bmi: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      
      bmiCategory: {
        type: DataTypes.ENUM(
          "underweight",
          "normal",
          "overweight",
          "obese"
        ),
        allowNull: false
      }
      
}, {
    timestamps: true,
});
export default TraineeProfile;