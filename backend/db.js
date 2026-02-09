import { Sequelize } from "sequelize";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://fit_admin:fit@123@localhost:5432/fitness";

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: process.env.DATABASE_URL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});

export default sequelize;
