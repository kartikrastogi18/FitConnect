import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import sequelize from "./db.js";
import config from "./config/index.js";
import { errorHandler } from "./utils/errors.js";

// routes
import authRoutes from "./routes/user-routes.js";
import traineeRoutes from "./routes/trainee-routes.js";
import trainerRoutes from "./routes/trainer-routes.js";
import adminRoutes from "./routes/admin-routes.js";
import messageRoutes from "./routes/message-routes.js";
import chatRoutes from "./routes/chat-routes.js";
import paymentRoutes from "./routes/payment-routes.js";

// socket handler
import { socketHandler } from "./socket.js";

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://fit-connect-plum-nine.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


/* -------------------- ROUTES -------------------- */
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/messages", messageRoutes);
app.use("/chats", chatRoutes);
app.use("/payments", paymentRoutes);
app.use("/", traineeRoutes);
app.use("/", trainerRoutes);

app.get("/", (req, res) => {
  res.json({ 
    message: "FitConnect API Server",
    version: "2.0.0",
    status: "running"
  });
});

/* -------------------- ERROR HANDLER -------------------- */
app.use(errorHandler);

/* -------------------- DB -------------------- */
try {
  await sequelize.authenticate();
  console.log("✅ Database connected successfully");
  
  await sequelize.sync({ alter: true });
  console.log("✅ Database synced");
} catch (error) {
  console.error("❌ Database connection failed:", error);
  process.exit(1);
}

/* -------------------- HTTP + SOCKET -------------------- */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Attach io to app for use in controllers
app.set("io", io);

// Initialize socket logic
socketHandler(io);

/* -------------------- START SERVER -------------------- */
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Frontend URL: ${config.frontend.url}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    sequelize.close();
    process.exit(0);
  });
});
