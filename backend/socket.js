import jwt from "jsonwebtoken";
import config from "./config/index.js";

export const socketHandler = (io) => {
  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error("Authentication token required"));
      }
      
      const decoded = jwt.verify(token, config.jwt.secret);

      socket.user = {
        id: decoded.id,
        role: decoded.role,
      };

      next();
    } catch (error) {
      console.error("Socket auth error:", error.message);
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: User ${socket.user.id} (${socket.user.role})`);

    // Join user's personal room
    socket.join(`user_${socket.user.id}`);

    // Join specific chat room
    socket.on("join_chat", (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`User ${socket.user.id} joined chat ${chatId}`);
    });

    // Leave chat room
    socket.on("leave_chat", (chatId) => {
      socket.leave(`chat_${chatId}`);
      console.log(`User ${socket.user.id} left chat ${chatId}`);
    });

    // Typing indicator
    socket.on("typing", ({ chatId, isTyping }) => {
      socket.to(`chat_${chatId}`).emit("user_typing", {
        userId: socket.user.id,
        isTyping,
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: User ${socket.user.id}`);
    });
  });
};
