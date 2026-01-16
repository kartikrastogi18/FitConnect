import sequelize from "../db.js";
import { DataTypes } from "sequelize";
import ChatSession from "./ChatSession.js";
const Payment=sequelize.define("Payment", {
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
    },
    chatId:{
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:ChatSession,
            key:"id",
        },
        onDelete:"CASCADE",
    },
    traineeId:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    trainerId:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },

    amount:{
        type:DataTypes.FLOAT,
        allowNull:false,

    },
    status:{
        type:DataTypes.ENUM("HELD", "RELEASED", "REFUNDED"),
        defaultValue:"HELD",
    },
},{
    timestamps:true,
});
export default Payment;
    
