import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { adminAPI } from "../../api";
import {
    Users,
    MessageSquare,
    DollarSign,
    TrendingUp,
    LogOut,
    UserCheck,
    CreditCard,
    Zap,
    Shield,
    ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";

export const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await adminAPI.getPlatformStats();
            setStats(response.data.stats);
        } catch (error) {
            toast.error("Failed to load platform stats");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-neon-purple border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 font-medium">Loading Admin Console...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 bg-mesh-pattern">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-neon-purple/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl animate-pulse-slow" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-dark-600 bg-dark-900/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-neon-purple/20 rounded-lg">
                                <Shield className="w-8 h-8 text-neon-purple" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-display font-bold text-white">
                                    ADMIN <span className="text-neon-purple">CONSOLE</span>
                                </h1>
                                <p className="text-gray-500 text-sm">Platform Control</p>
                            </div>
                        </div>

                        <button onClick={logout} className="btn-ghost flex items-center gap-2">
                            <LogOut className="w-5 h-5" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card-stat">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm font-medium">Total Users</span>
                            <Users className="w-5 h-5 text-electric-blue" />
                        </div>
                        <p className="stat-number">{stats?.users?.total || 0}</p>
                        <p className="text-gray-500 text-xs mt-1">
                            {stats?.users?.trainees || 0} trainees, {stats?.users?.trainers || 0} trainers
                        </p>
                    </div>

                    <div className="card-stat">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm font-medium">Total Chats</span>
                            <MessageSquare className="w-5 h-5 text-neon-green" />
                        </div>
                        <p className="stat-number">{stats?.chats?.total || 0}</p>
                        <p className="text-gray-500 text-xs mt-1">
                            {stats?.chats?.active || 0} active
                        </p>
                    </div>

                    <div className="card-stat">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm font-medium">Total Revenue</span>
                            <DollarSign className="w-5 h-5 text-neon-lime" />
                        </div>
                        <p className="stat-number">₹{((stats?.payments?.totalRevenue || 0) / 100).toFixed(0)}</p>
                        <p className="text-gray-500 text-xs mt-1">
                            {stats?.payments?.total || 0} transactions
                        </p>
                    </div>

                    <div className="card-stat">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm font-medium">Pending</span>
                            <UserCheck className="w-5 h-5 text-yellow-400" />
                        </div>
                        <p className="text-4xl font-display font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            {stats?.users?.pendingTrainers || 0}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">Trainer approvals</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div
                        onClick={() => navigate("/admin/trainers")}
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-500 p-6 cursor-pointer transition-all duration-300 hover:border-electric-blue/50 hover:shadow-glow-blue"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-electric-blue/10 rounded-full blur-2xl transition-all duration-300 group-hover:w-48 group-hover:h-48" />

                        <div className="relative flex items-center gap-4">
                            <div className="p-4 bg-electric-blue/20 rounded-xl border border-electric-blue/30 transition-all duration-300 group-hover:scale-110">
                                <UserCheck className="w-10 h-10 text-electric-blue" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">Manage Trainers</h3>
                                <p className="text-gray-400 text-sm">Approve or reject applications</p>
                                {stats?.users?.pendingTrainers > 0 && (
                                    <span className="badge-pending mt-2 inline-flex">
                                        {stats.users.pendingTrainers} Pending
                                    </span>
                                )}
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-electric-blue transition-colors" />
                        </div>
                    </div>

                    <div
                        onClick={() => navigate("/admin/payments")}
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-500 p-6 cursor-pointer transition-all duration-300 hover:border-neon-green/50 hover:shadow-glow"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/10 rounded-full blur-2xl transition-all duration-300 group-hover:w-48 group-hover:h-48" />

                        <div className="relative flex items-center gap-4">
                            <div className="p-4 bg-neon-green/20 rounded-xl border border-neon-green/30 transition-all duration-300 group-hover:scale-110">
                                <CreditCard className="w-10 h-10 text-neon-green" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">Manage Payments</h3>
                                <p className="text-gray-400 text-sm">Release or refund payments</p>
                                <span className="text-neon-green text-xs font-bold uppercase tracking-wider mt-2 inline-block">
                                    Escrow Control
                                </span>
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-neon-green transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payment Stats */}
                    <div className="card-dark">
                        <div className="flex items-center gap-3 mb-6">
                            <DollarSign className="w-6 h-6 text-neon-green" />
                            <h2 className="text-xl font-bold text-white">Payment Overview</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-dark-700 rounded-lg">
                                <span className="text-gray-400">Total Payments</span>
                                <span className="font-semibold text-white">{stats?.payments?.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-neon-green/10 border border-neon-green/20 rounded-lg">
                                <span className="text-gray-400">Released</span>
                                <span className="font-semibold text-neon-green">{stats?.payments?.released || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <span className="text-gray-400">Held (Escrow)</span>
                                <span className="font-semibold text-yellow-400">{stats?.payments?.held || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <span className="text-gray-400">Refunded</span>
                                <span className="font-semibold text-red-400">{stats?.payments?.refunded || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Chat Stats */}
                    <div className="card-dark">
                        <div className="flex items-center gap-3 mb-6">
                            <MessageSquare className="w-6 h-6 text-electric-blue" />
                            <h2 className="text-xl font-bold text-white">Chat Overview</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-dark-700 rounded-lg">
                                <span className="text-gray-400">Total Chats</span>
                                <span className="font-semibold text-white">{stats?.chats?.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-electric-blue/10 border border-electric-blue/20 rounded-lg">
                                <span className="text-gray-400">Active</span>
                                <span className="font-semibold text-electric-blue">{stats?.chats?.active || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-neon-green/10 border border-neon-green/20 rounded-lg">
                                <span className="text-gray-400">Completed</span>
                                <span className="font-semibold text-neon-green">{stats?.chats?.completed || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-neon-purple/10 border border-neon-purple/20 rounded-lg">
                                <span className="text-gray-400">AI Chats</span>
                                <span className="font-semibold text-neon-purple">{stats?.chats?.ai || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
