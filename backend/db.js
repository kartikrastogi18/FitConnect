import {Sequelize} from "sequelize";
const sequelize=new Sequelize("fitness","fit_admin","fit@123",{
    host:"localhost",
    dialect:"postgres",
    logging:false,
});
// sequelize.authenticate().then(()=>{
//     console.log("Database connected successfully");
// }).catch((err)=>{
//     console.error("Unable to connect to the database:",err);
// });
export default sequelize;