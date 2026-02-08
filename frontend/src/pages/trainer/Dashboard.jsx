import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { trainerAPI, chatAPI } from "../../api";
import { Badge } from "../../components/ui/Badge";
import {
    MessageSquare,
    DollarSign,
    Users,
    LogOut,
    Star,
    Clock,
    CheckCircle,
    Zap,
    TrendingUp,
    ChevronRight,
    User,
    AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

export const TrainerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [stats, setStats] = useState(null);
    const [earningsData, setEarningsData] = useState({ totalEarnings: 0, pendingEarnings: 0, payments: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [chatsRes, statsRes, earningsRes] = await Promise.all([
                chatAPI.getMyChats(),
                trainerAPI.getMyStats().catch(() => ({ data: { stats: {} } })),
                trainerAPI.getMyEarnings().catch(() => ({ data: { earnings: { totalEarnings: 0, pendingEarnings: 0, payments: [] } } })),
            ]);
            setChats(chatsRes.data.chats || []);
            setStats(statsRes.data.stats || {});
            // The API returns earnings as an object with totalEarnings, pendingEarnings, payments
            const earningsObj = earningsRes.data.earnings || { totalEarnings: 0, pendingEarnings: 0, payments: [] };
            setEarningsData(earningsObj);
        } catch (error) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 font-medium">Loading Trainer HQ...</p>
                </div>
            </div>
        );
    }

    const pendingChats = chats.filter((chat) => chat.status === "PENDING");
    const activeChats = chats.filter((chat) => chat.status === "ACTIVE");
    const completedChats = chats.filter((chat) => chat.status === "COMPLETED");

    // Extract values from earningsData object (already in rupees, not paisa)
    const totalEarnings = earningsData.totalEarnings || 0;
    const pendingEarnings = earningsData.pendingEarnings || 0;
    const payments = earningsData.payments || [];

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
                            <div className="p-2 bg-electric-blue/20 rounded-lg">
                                <Zap className="w-8 h-8 text-electric-blue" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-display font-bold text-white">
                                    TRAINER <span className="text-electric-blue">HQ</span>
                                </h1>
                                <p className="text-gray-500 text-sm">Command Center</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-dark-700 rounded-lg border border-dark-500">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="text-white font-semibold">{stats?.profile?.trustScore?.toFixed(1) || "5.0"}</span>
                                </div>
                                <div className="w-px h-4 bg-dark-500" />
                                <span className="text-gray-400 text-sm">{user?.username}</span>
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
                            <span className="text-gray-400 text-sm font-medium">Total Earnings</span>
                            <DollarSign className="w-5 h-5 text-neon-green" />
                        </div>
                        <p className="stat-number">₹{totalEarnings.toFixed(0)}</p>
                    </div>

                    <div className="card-stat">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm font-medium">Pending</span>
                            <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <p className="text-4xl font-display font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            ₹{pendingEarnings.toFixed(0)}
                        </p>
                    </div>

                    <div className="card-stat">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm font-medium">Active Chats</span>
                            <MessageSquare className="w-5 h-5 text-electric-blue" />
                        </div>
                        <p className="stat-number">{activeChats.length}</p>
                    </div>

                    <div className="card-stat">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm font-medium">Trust Score</span>
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        </div>
                        <p className="stat-number">{stats?.profile?.trustScore?.toFixed(1) || "5.0"}</p>
                    </div>
                </div>

                {/* Pending Chat Requests Alert */}
                {pendingChats.length > 0 && (
                    <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-yellow-400">
                                    {pendingChats.length} Pending Chat Request{pendingChats.length > 1 ? "s" : ""}
                                </h3>
                                <p className="text-gray-400 text-sm">Trainees are waiting for payment approval to chat with you</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Chats */}
                    <div className="card-dark">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-6 h-6 text-neon-green" />
                                <h2 className="text-xl font-bold text-white">Active Chats</h2>
                            </div>
                            <span className="badge-neon">{activeChats.length} Active</span>
                        </div>

                        {activeChats.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                                    <MessageSquare className="w-8 h-8 text-gray-600" />
                                </div>
                                <p className="text-gray-400">No active chats yet</p>
                                <p className="text-gray-500 text-sm mt-1">Chats will appear here when trainees pay</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activeChats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        onClick={() => navigate(`/chat/${chat.id}`)}
                                        className="group p-4 rounded-xl bg-dark-700/50 border border-dark-500 hover:border-neon-green/30 cursor-pointer transition-all duration-200 hover:bg-dark-700"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green to-neon-lime flex items-center justify-center">
                                                    <span className="text-lg font-bold text-dark-900">
                                                        {chat.trainee?.username?.[0]?.toUpperCase() || "T"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{chat.trainee?.username || "Trainee"}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="badge-neon">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Active
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="opacity-0 group-hover:opacity-100 transition-opacity btn-dark py-2 px-4 text-sm">
                                                Open Chat <ChevronRight className="w-4 h-4 ml-1 inline" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pending Requests */}
                    <div className="card-dark">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Clock className="w-6 h-6 text-yellow-400" />
                                <h2 className="text-xl font-bold text-white">Pending Requests</h2>
                            </div>
                            <span className="badge-pending">{pendingChats.length} Pending</span>
                        </div>

                        {pendingChats.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                                    <Clock className="w-8 h-8 text-gray-600" />
                                </div>
                                <p className="text-gray-400">No pending requests</p>
                                <p className="text-gray-500 text-sm mt-1">When trainees request a chat, they'll appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingChats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className="p-4 rounded-xl bg-dark-700/50 border border-yellow-500/30"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                                                    <span className="text-lg font-bold text-dark-900">
                                                        {chat.trainee?.username?.[0]?.toUpperCase() || "T"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{chat.trainee?.username || "Trainee"}</p>
                                                    <p className="text-yellow-400 text-sm">Waiting for payment</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-semibold">₹{(chat.payment?.amount || 50000) / 100}</p>
                                                <p className="text-gray-500 text-xs">Session fee</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Earnings */}
                <div className="mt-6 card-dark">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-neon-green" />
                            <h2 className="text-xl font-bold text-white">Recent Earnings</h2>
                        </div>
                    </div>

                    {payments.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                                <DollarSign className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-gray-400">No earnings yet</p>
                            <p className="text-gray-500 text-sm mt-1">Complete paid sessions to earn</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-dark-600">
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Trainee</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.slice(0, 5).map((earning, idx) => (
                                        <tr key={idx} className="border-b border-dark-700 hover:bg-dark-700/50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <span className="text-white">{earning.trainee?.username || "Trainee"}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-white font-semibold">₹{(earning.amount / 100).toFixed(0)}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {earning.status === "RELEASED" && (
                                                    <span className="badge-neon">Released</span>
                                                )}
                                                {earning.status === "HELD" && (
                                                    <span className="badge-pending">Held</span>
                                                )}
                                                {earning.status === "REFUNDED" && (
                                                    <span className="badge-danger">Refunded</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-gray-400">
                                                {new Date(earning.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
