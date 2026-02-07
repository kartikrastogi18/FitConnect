// import express from "express";
// import sequelize from "./db.js";
// // import cors from "cors";
// const app=express();
// app.use(express.json());
// // app.use(cors({
// //     origin: "*",
// //     methods: ["GET", "POST", "PUT", "DELETE"],
// //     allowedHeaders: ["Content-Type", "Authorization"]
// //   }));
// //   app.use((req, res, next) => {
// //     res.setHeader("Access-Control-Allow-Origin", "*");
// //     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
// //     res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
// //     next();
// //   });
// // app.use("/hotels",hotelRoutes);
// // app.use("/menu",menuRoutes);
// app.get("/", async (req, res) => {
//     try {
//       res.json({ message: "PostgreSQL connected!" });
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Error connecting to DB");
//     }
//   });
//   await sequelize.authenticate();
//   await sequelize.sync({alter:true});

//   app.listen(5000,()=>{
//     console.log("Server is running on port 5000");
//   });
// import express from "express";
// import sequelize from "./models/index.js"; // 👈 IMPORT SEQUELIZE INSTANCE
// import User from "./models/User.js"; // 👈 THIS CREATES TABLE

// const app = express();
// app.use(express.json());

// const startServer = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("DB connected");

//     await sequelize.sync({ alter: true });
//     console.log("Tables synced");

//     app.listen(5000, () => {
//       console.log("Server running on port 5000");
//     });
//   } catch (err) {
//     console.error(err);
//   }
// };

// startServer();
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { socketHandler } from "./socket.js";

socketHandler(io);

import sequelize from "./db.js";
import authRoutes from "./routes/user-routes.js";
import traineeRoutes from "./routes/trainee-routes.js";
import trainerRoutes from "./routes/trainer-routes.js";
import adminRoutes from "./routes/admin-routes.js";

import cors from "cors";
import messageRoutes from "./routes/message-routes.js";
import chatRoutes from "./routes/chat-routes.js";






const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/messages", messageRoutes);
app.use("/chats", chatRoutes);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/", traineeRoutes);
app.use("/", trainerRoutes);

app.get("/", async (req, res) => {
  try {
    res.json({ message: "PostgreSQL connected!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error connecting to DB");
  }
});

await sequelize.authenticate();
await sequelize.sync({ alter: true });

import { Server } from "socket.io";
import http from "http";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io); // 🔥 allow controllers to emit

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
