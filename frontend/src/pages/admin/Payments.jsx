import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../api";
import {
    ArrowLeft,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    User
} from "lucide-react";
import toast from "react-hot-toast";

export const AdminPayments = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState({});

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            const response = await adminAPI.getAllPayments();
            setPayments(response.data.payments || []);
        } catch (error) {
            toast.error("Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    const handleRelease = async (paymentId) => {
        if (!confirm("Release this payment to the trainer?")) return;

        setProcessing({ ...processing, [paymentId]: true });
        try {
            await adminAPI.releasePayment(paymentId);
            toast.success("Payment released!");
            loadPayments();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to release payment");
        } finally {
            setProcessing({ ...processing, [paymentId]: false });
        }
    };

    const handleRefund = async (paymentId) => {
        if (!confirm("Refund this payment to the trainee?")) return;

        setProcessing({ ...processing, [paymentId]: true });
        try {
            await adminAPI.refundPayment(paymentId);
            toast.success("Payment refunded!");
            loadPayments();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to refund payment");
        } finally {
            setProcessing({ ...processing, [paymentId]: false });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Loading payments...</p>
                </div>
            </div>
        );
    }

    const heldPayments = payments.filter((p) => p.status === "HELD");
    const releasedPayments = payments.filter((p) => p.status === "RELEASED");
    const refundedPayments = payments.filter((p) => p.status === "REFUNDED");

    return (
        <div className="min-h-screen bg-dark-900 bg-mesh-pattern">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-neon-green/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-slow" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-dark-600 bg-dark-900/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/admin/dashboard")}
                            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Payment <span className="text-gradient">Management</span></h1>
                            <p className="text-gray-500 text-sm">Release or refund escrow payments</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="card-stat text-center py-4">
                        <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm font-medium">Held</span>
                        </div>
                        <p className="text-3xl font-display font-bold text-white">{heldPayments.length}</p>
                    </div>
                    <div className="card-stat text-center py-4">
                        <div className="flex items-center justify-center gap-2 text-neon-green mb-2">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Released</span>
                        </div>
                        <p className="text-3xl font-display font-bold text-white">{releasedPayments.length}</p>
                    </div>
                    <div className="card-stat text-center py-4">
                        <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                            <XCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Refunded</span>
                        </div>
                        <p className="text-3xl font-display font-bold text-white">{refundedPayments.length}</p>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="card-dark overflow-hidden">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-neon-green" />
                        All Payments
                    </h2>

                    {payments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                                <DollarSign className="w-10 h-10 text-gray-600" />
                            </div>
                            <p className="text-gray-400">No payments yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-dark-600">
                                        <th className="text-left py-4 px-4 text-gray-400 font-medium">ID</th>
                                        <th className="text-left py-4 px-4 text-gray-400 font-medium">Trainee</th>
                                        <th className="text-left py-4 px-4 text-gray-400 font-medium">Trainer</th>
                                        <th className="text-left py-4 px-4 text-gray-400 font-medium">Amount</th>
                                        <th className="text-left py-4 px-4 text-gray-400 font-medium">Status</th>
                                        <th className="text-left py-4 px-4 text-gray-400 font-medium">Date</th>
                                        <th className="text-left py-4 px-4 text-gray-400 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                                            <td className="py-4 px-4 text-gray-500 font-mono text-sm">#{payment.id}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <span className="text-white">{payment.trainee?.username || "Unknown"}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-white">{payment.trainer?.username || "Unknown"}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-white font-semibold">₹{(payment.amount / 100).toFixed(0)}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                {payment.status === "RELEASED" && (
                                                    <span className="badge-neon">Released</span>
                                                )}
                                                {payment.status === "HELD" && (
                                                    <span className="badge-pending">Held</span>
                                                )}
                                                {payment.status === "REFUNDED" && (
                                                    <span className="badge-danger">Refunded</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-gray-400 text-sm">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-4">
                                                {payment.status === "HELD" && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleRelease(payment.id)}
                                                            disabled={processing[payment.id]}
                                                            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30 transition-colors flex items-center gap-1"
                                                        >
                                                            {processing[payment.id] ? (
                                                                <div className="w-3 h-3 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Release
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRefund(payment.id)}
                                                            disabled={processing[payment.id]}
                                                            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors flex items-center gap-1"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Refund
                                                        </button>
                                                    </div>
                                                )}
                                                {payment.status !== "HELD" && (
                                                    <span className="text-gray-500 text-sm">No actions</span>
                                                )}
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
