import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within SocketProvider");
    }
    return context;
};

const SOCKET_URL = import.meta.env.VITE_API_URL;

export const SocketProvider = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        // Create socket connection
        const newSocket = io(SOCKET_URL, {
            auth: { token },
            autoConnect: true,
        });

        newSocket.on("connect", () => {
            console.log("✅ Socket connected");
            setConnected(true);
        });

        newSocket.on("disconnect", () => {
            console.log("❌ Socket disconnected");
            setConnected(false);
        });

        newSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
            setConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [token, isAuthenticated]);

    const joinChat = (chatId) => {
        if (socket && connected) {
            socket.emit("join_chat", chatId);
        }
    };

    const leaveChat = (chatId) => {
        if (socket && connected) {
            socket.emit("leave_chat", chatId);
        }
    };

    const sendTyping = (chatId, isTyping) => {
        if (socket && connected) {
            socket.emit("typing", { chatId, isTyping });
        }
    };

    const value = {
        socket,
        connected,
        joinChat,
        leaveChat,
        sendTyping,
    };

    return (
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    );
};
