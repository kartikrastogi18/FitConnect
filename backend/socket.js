import jwt from "jsonwebtoken";

export const socketHandler = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, "kartik");

      socket.user = {
        id: decoded.id,
        role: decoded.role,
      };

      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.user);

    socket.join(`user_${socket.user.id}`);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.user.id);
    });
  });
};
