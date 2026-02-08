import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { chatAPI, paymentAPI, traineeAPI } from "../../api";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import {
    MessageSquare,
    Bot,
    Users,
    LogOut,
    DollarSign,
    Lock,
    CheckCircle,
    Clock,
    Zap,
    Dumbbell,
    Target,
    TrendingUp,
    ChevronRight,
    Search,
    Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

export const TraineeDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creatingAI, setCreatingAI] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [chatsRes] = await Promise.all([
                chatAPI.getMyChats(),
            ]);
            setChats(chatsRes.data.chats || []);
        } catch (error) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const createAIChat = async () => {
        setCreatingAI(true);
        try {
            const response = await chatAPI.createAIChat();
            const chatId = response.data.chat.id;
            toast.success("AI Coach activated!");
            navigate(`/chat/${chatId}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create AI chat");
        } finally {
            setCreatingAI(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 font-medium">Loading Mission Control...</p>
                </div>
            </div>
        );
    }

    const aiChats = chats.filter((chat) => chat.type === "AI");
    const trainerChats = chats.filter((chat) => chat.type === "TRAINER");
    const activeChats = chats.filter((chat) => chat.status === "ACTIVE");
    const pendingChats = chats.filter((chat) => chat.status === "PENDING");

    return (
        <div className="min-h-screen bg-dark-900 bg-mesh-pattern">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-neon-green/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-electric-blue/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/3 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-dark-600 bg-dark-900/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-neon-green/20 rounded-lg">
                                <Zap className="w-8 h-8 text-neon-green" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-display font-bold text-white">
                                    FIT<span className="text-neon-green">CONNECT</span>
                                </h1>
                                <p className="text-gray-500 text-sm">Mission Control</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-dark-700 rounded-lg border border-dark-500">
                                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                                <span className="text-gray-400 text-sm">
                                    Welcome, <span className="text-white font-semibold">{user?.username}</span>
                                </span>
                            </div>
                            <button onClick={logout} className="btn-ghost flex items-center gap-2">
                                <LogOut className="w-5 h-5" />
                                <span className="hidden md:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card-stat">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm font-medium">Active Chats</span>
                            <MessageSquare className="w-5 h-5 text-neon-green" />
                        </div>
                        <p className="stat-number">{activeChats.length}</p>
                    </div>

                    <div className="card-stat">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm font-medium">AI Sessions</span>
                            <Bot className="w-5 h-5 text-electric-blue" />
                        </div>
                        <p className="stat-number">{aiChats.length}</p>
                    </div>

                    <div className="card-stat">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm font-medium">Trainers</span>
                            <Users className="w-5 h-5 text-neon-purple" />
                        </div>
                        <p className="stat-number">{trainerChats.length}</p>
                    </div>

                    <div className="card-stat">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm font-medium">Pending</span>
                            <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <p className="stat-number">{pendingChats.length}</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* AI Coach Card */}
                    <div
                        onClick={!creatingAI ? createAIChat : undefined}
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-500 p-6 cursor-pointer transition-all duration-300 hover:border-neon-green/50 hover:shadow-glow"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/10 rounded-full blur-2xl transition-all duration-300 group-hover:w-48 group-hover:h-48" />

                        <div className="relative flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-neon-green/30 to-neon-lime/10 rounded-xl border border-neon-green/30 transition-all duration-300 group-hover:scale-110">
                                <Bot className="w-10 h-10 text-neon-green" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">AI Fitness Coach</h3>
                                <p className="text-gray-400 text-sm">Get instant fitness advice powered by AI</p>
                                <span className="inline-flex items-center gap-1 mt-2 text-neon-green text-xs font-bold uppercase tracking-wider">
                                    <Sparkles className="w-3 h-3" /> Free & Unlimited
                                </span>
                            </div>
                            <button
                                disabled={creatingAI}
                                className="btn-neon flex items-center gap-2"
                            >
                                {creatingAI ? (
                                    <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Start <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Find Trainer Card */}
                    <div
                        onClick={() => navigate("/trainers")}
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-500 p-6 cursor-pointer transition-all duration-300 hover:border-electric-blue/50 hover:shadow-glow-blue"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-electric-blue/10 rounded-full blur-2xl transition-all duration-300 group-hover:w-48 group-hover:h-48" />

                        <div className="relative flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-electric-blue/30 to-neon-cyan/10 rounded-xl border border-electric-blue/30 transition-all duration-300 group-hover:scale-110">
                                <Dumbbell className="w-10 h-10 text-electric-blue" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">Find a Trainer</h3>
                                <p className="text-gray-400 text-sm">Connect with certified fitness experts</p>
                                <span className="inline-flex items-center gap-1 mt-2 text-electric-blue text-xs font-bold uppercase tracking-wider">
                                    <Target className="w-3 h-3" /> Personalized Coaching
                                </span>
                            </div>
                            <button className="btn-electric flex items-center gap-2">
                                Browse <Search className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat List */}
                <div className="card-dark">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-6 h-6 text-neon-green" />
                            <h2 className="text-xl font-bold text-white">My Chats</h2>
                        </div>
                        {pendingChats.length > 0 && (
                            <span className="badge-pending">
                                <Clock className="w-3 h-3 mr-1" />
                                {pendingChats.length} Pending
                            </span>
                        )}
                    </div>

                    {chats.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                                <MessageSquare className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">No Chats Yet</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                Start your fitness journey by chatting with our AI coach or connecting with a certified trainer.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={createAIChat} className="btn-neon flex items-center gap-2">
                                    <Bot className="w-5 h-5" />
                                    AI Chat
                                </button>
                                <button onClick={() => navigate("/trainers")} className="btn-dark flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Find Trainer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {chats.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => navigate(`/chat/${chat.id}`)}
                                    className="group p-4 rounded-xl bg-dark-700/50 border border-dark-500 hover:border-neon-green/30 cursor-pointer transition-all duration-200 hover:bg-dark-700"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {chat.type === "AI" ? (
                                                <div className="p-3 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-lime/10 border border-neon-green/30">
                                                    <Bot className="w-6 h-6 text-neon-green" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-blue to-neon-cyan flex items-center justify-center">
                                                    <span className="text-lg font-bold text-dark-900">
                                                        {chat.trainer?.username?.[0]?.toUpperCase() || "T"}
                                                    </span>
                                                </div>
                                            )}

                                            <div>
                                                <p className="font-semibold text-white">
                                                    {chat.type === "AI" ? "AI Fitness Coach" : chat.trainer?.username || "Trainer"}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {chat.status === "ACTIVE" && (
                                                        <span className="badge-neon">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Active
                                                        </span>
                                                    )}
                                                    {chat.status === "PENDING" && (
                                                        <span className="badge-pending">
                                                            <Lock className="w-3 h-3 mr-1" />
                                                            Payment Required
                                                        </span>
                                                    )}
                                                    {chat.status === "COMPLETED" && (
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                                                            Completed
                                                        </span>
                                                    )}
                                                    {chat.type === "TRAINER" && chat.payment && (
                                                        <span className="text-sm text-gray-500">
                                                            ₹{(chat.payment.amount / 100).toFixed(0)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity btn-dark py-2 px-4 text-sm">
                                            {chat.status === "PENDING" ? "Unlock" : "Open"}
                                            <ChevronRight className="w-4 h-4 ml-1 inline" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
