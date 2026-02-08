import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import { chatAPI, messageAPI, paymentAPI } from "../../api";
import { Modal } from "../../components/ui/Modal";
import {
    Send,
    ArrowLeft,
    Lock,
    Bot,
    User,
    Zap,
    MessageSquare,
    CreditCard,
    Shield,
    CheckCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "../../components/payment/CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const Chat = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket, connected, joinChat, leaveChat, sendTyping } = useSocket();

    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [paying, setPaying] = useState(false);
    const [clientSecret, setClientSecret] = useState("");

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Load chat and messages
    useEffect(() => {
        loadChat();
        loadMessages();
    }, [chatId]);

    // Join Socket.IO room
    useEffect(() => {
        if (connected && chatId) {
            joinChat(chatId);
            return () => leaveChat(chatId);
        }
    }, [connected, chatId]);

    // Listen for new messages
    useEffect(() => {
        if (!socket) return;

        socket.on("new_message", (data) => {
            if (data.chatId === parseInt(chatId)) {
                setMessages((prev) => [...prev, data.message]);
            }
        });

        socket.on("typing", (data) => {
            if (data.chatId === parseInt(chatId)) {
                setIsTyping(data.isTyping);
                if (data.isTyping) {
                    setTimeout(() => setIsTyping(false), 3000);
                }
            }
        });

        return () => {
            socket.off("new_message");
            socket.off("typing");
        };
    }, [socket, chatId]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadChat = async () => {
        try {
            const response = await chatAPI.getChatDetails(chatId);
            setChat(response.data.chat);

            // Check if payment required for trainer chat
            if (response.data.chat.type === "TRAINER" &&
                response.data.chat.status === "PENDING" &&
                user?.role === "trainee") {
                setShowPaymentModal(true);
            }
        } catch (error) {
            toast.error("Failed to load chat");
            const dashboardPath = user?.role === "trainer" ? "/trainer/dashboard" : "/trainee/dashboard";
            navigate(dashboardPath);
        }
    };

    const loadMessages = async () => {
        try {
            const response = await messageAPI.getChatMessages(chatId);
            setMessages(response.data.messages || []);
        } catch (error) {
            // Messages might be empty for new chats
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        const messageContent = newMessage.trim();
        setNewMessage("");
        setSending(true);

        try {
            const response = await messageAPI.sendMessage({
                chatId: parseInt(chatId),
                content: messageContent,
            });

            // For AI chat, add both user and AI messages
            if (response.data.aiMessage) {
                setMessages((prev) => [
                    ...prev,
                    response.data.userMessage,
                    response.data.aiMessage,
                ]);
            } else {
                // For trainer chat, add user message (real-time will handle trainer response)
                setMessages((prev) => [...prev, response.data.message]);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
            setNewMessage(messageContent); // Restore message on error
        } finally {
            setSending(false);
        }
    };

    const handleTyping = () => {
        if (chat?.type === "TRAINER" && socket && connected) {
            sendTyping(chatId, true);

            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                sendTyping(chatId, false);
            }, 1000);
        }
    };

    const handlePayment = async () => {
        setPaying(true);
        try {
            // Create payment intent and get client secret
            const response = await paymentAPI.createPayment(chatId);
            setClientSecret(response.data.clientSecret);
            toast.success("Initializing secure payment...");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to initialize payment");
        } finally {
            setPaying(false);
        }
    };

    const handlePaymentSuccess = async () => {
        setPaying(true);
        try {
            // Unlock chat after successful Stripe payment
            await paymentAPI.unlockChat(chatId);
            toast.success("Payment successful! Chat unlocked.");
            setShowPaymentModal(false);
            setClientSecret("");
            // Reload chat to update status
            await loadChat();
        } catch (error) {
            toast.error("Payment was successful but failed to unlock chat. Please refresh.");
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Loading chat...</p>
                </div>
            </div>
        );
    }

    const getChatTitle = () => {
        if (chat?.type === "AI") return "AI Fitness Coach";
        if (user?.role === "trainer") return chat?.trainee?.username || "Trainee";
        return chat?.trainer?.username || "Trainer";
    };

    const getChatAvatar = () => {
        if (chat?.type === "AI") {
            return (
                <div className="p-2 rounded-full bg-gradient-to-br from-neon-green/30 to-neon-lime/10 border border-neon-green/30">
                    <Bot className="w-6 h-6 text-neon-green" />
                </div>
            );
        }
        const name = user?.role === "trainer"
            ? chat?.trainee?.username
            : chat?.trainer?.username;
        return (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-blue to-neon-cyan flex items-center justify-center">
                <span className="text-lg font-bold text-dark-900">{name?.[0]?.toUpperCase() || "U"}</span>
            </div>
        );
    };

    const dashboardPath = user?.role === "trainer" ? "/trainer/dashboard" : "/trainee/dashboard";

    return (
        <div className="h-screen flex flex-col bg-dark-900">
            {/* Header */}
            <header className="bg-dark-800 border-b border-dark-600 px-4 py-3 flex items-center gap-4 flex-shrink-0">
                <button
                    onClick={() => navigate(dashboardPath)}
                    className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>

                <div className="flex items-center gap-3 flex-1">
                    {getChatAvatar()}
                    <div>
                        <h2 className="font-bold text-white">{getChatTitle()}</h2>
                        {isTyping && (
                            <p className="text-sm text-neon-green animate-pulse">typing...</p>
                        )}
                    </div>
                </div>

                {chat?.status === "PENDING" && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                        <Lock className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm font-medium">Locked</span>
                    </div>
                )}
                {chat?.status === "ACTIVE" && chat?.type === "TRAINER" && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-neon-green/20 border border-neon-green/30 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-neon-green" />
                        <span className="text-neon-green text-sm font-medium">Active</span>
                    </div>
                )}
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-900">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                                <MessageSquare className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Start the Conversation</h3>
                            <p className="text-gray-500 max-w-sm">
                                {chat?.type === "AI"
                                    ? "Ask anything about fitness, nutrition, or workout plans!"
                                    : "Send a message to start your fitness journey."}
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isOwnMessage =
                            (user?.role === "trainee" && msg.senderRole === "trainee") ||
                            (user?.role === "trainer" && msg.senderRole === "trainer");
                        const isAI = msg.senderRole === "ai";

                        return (
                            <div
                                key={idx}
                                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} animate-in`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${isOwnMessage
                                        ? "bg-gradient-to-r from-neon-green to-neon-lime text-dark-900"
                                        : isAI
                                            ? "bg-dark-700 border border-neon-green/30"
                                            : "bg-dark-700 border border-dark-500"
                                        }`}
                                >
                                    {isAI && (
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dark-500">
                                            <Bot className="w-4 h-4 text-neon-green" />
                                            <span className="text-xs font-bold text-neon-green uppercase tracking-wider">AI Coach</span>
                                        </div>
                                    )}
                                    <p className={`whitespace-pre-wrap break-words ${isOwnMessage ? "text-dark-900" : "text-white"}`}>
                                        {msg.content}
                                    </p>
                                    <p className={`text-xs mt-2 ${isOwnMessage ? "text-dark-900/60" : "text-gray-500"}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input or Locked State */}
            {chat?.status === "ACTIVE" || chat?.type === "AI" ? (
                <form onSubmit={handleSendMessage} className="bg-dark-800 border-t border-dark-600 p-4 flex-shrink-0">
                    <div className="flex gap-3 max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            placeholder={chat?.type === "AI" ? "Ask the AI coach anything..." : "Type a message..."}
                            className="input-dark flex-1"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="btn-neon flex items-center gap-2"
                        >
                            {sending ? (
                                <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span className="hidden md:inline">Send</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-dark-800 border-t border-dark-600 p-6 text-center flex-shrink-0">
                    <div className="max-w-md mx-auto">
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-4">
                            <Lock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                            <p className="text-yellow-400 font-medium">Chat is Locked</p>
                            <p className="text-gray-400 text-sm mt-1">Complete payment to unlock this chat</p>
                        </div>
                        <button onClick={() => setShowPaymentModal(true)} className="btn-neon w-full flex items-center justify-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Unlock Chat - ₹{(chat?.payment?.amount || 50000) / 100}
                        </button>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => !paying && setShowPaymentModal(false)}
                title=""
            >
                <div className="text-center">
                    {!clientSecret ? (
                        <>
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-electric-blue to-neon-cyan flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-dark-900" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">
                                Unlock Chat
                            </h2>
                            <p className="text-gray-400 mb-6">
                                Pay to start chatting with {chat?.trainer?.username || "your trainer"}
                            </p>

                            <div className="bg-dark-700 rounded-xl p-6 mb-6 text-left">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-gray-400">Session Fee</span>
                                    <span className="text-white font-semibold">₹{(chat?.payment?.amount || 50000) / 100}</span>
                                </div>
                                <div className="border-t border-dark-500 pt-3 flex items-center justify-between">
                                    <span className="text-white font-bold">Total</span>
                                    <span className="text-2xl font-bold text-gradient">₹{(chat?.payment?.amount || 50000) / 100}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={paying}
                                className="btn-neon w-full flex items-center justify-center gap-2 py-4 shadow-glow"
                            >
                                {paying ? (
                                    <div className="w-6 h-6 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Continue to Payment
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center gap-4 mb-6 text-left">
                                <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-neon-green" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Payment Details</h3>
                                    <p className="text-gray-500 text-sm">Secure checkout powered by Stripe</p>
                                </div>
                            </div>

                            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#39ff14' } } }}>
                                <CheckoutForm
                                    onPaymentSuccess={handlePaymentSuccess}
                                    amount={(chat?.payment?.amount || 50000) / 100}
                                />
                            </Elements>
                        </div>
                    )}

                    <button
                        onClick={() => { setShowPaymentModal(false); setClientSecret(""); }}
                        disabled={paying}
                        className="mt-4 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
        </div>
    );
};
