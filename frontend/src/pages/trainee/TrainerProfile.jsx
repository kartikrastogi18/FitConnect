import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { traineeAPI, chatAPI, paymentAPI } from "../../api";
import { Modal } from "../../components/ui/Modal";
import {
    ArrowLeft,
    Star,
    Award,
    Clock,
    MessageSquare,
    CheckCircle,
    Zap,
    Target,
    Users,
    CreditCard,
    Shield,
    ChevronRight,
    Dumbbell
} from "lucide-react";
import toast from "react-hot-toast";

export const TrainerProfile = () => {
    const { trainerId } = useParams();
    const navigate = useNavigate();
    const [trainer, setTrainer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [creatingChat, setCreatingChat] = useState(false);
    const [paying, setPaying] = useState(false);
    const [newChatId, setNewChatId] = useState(null);

    useEffect(() => {
        loadTrainer();
    }, [trainerId]);

    const loadTrainer = async () => {
        try {
            const response = await traineeAPI.getTrainerProfile(trainerId);
            setTrainer(response.data.trainer || response.data);
        } catch (error) {
            toast.error("Failed to load trainer profile");
            navigate("/trainers");
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = async () => {
        setCreatingChat(true);
        try {
            const response = await chatAPI.createTrainerChat(trainerId);
            const chatId = response.data.chat.id;
            setNewChatId(chatId);
            setShowPaymentModal(true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to start chat");
        } finally {
            setCreatingChat(false);
        }
    };

    const handlePayment = async () => {
        if (!newChatId) return;

        setPaying(true);
        try {
            // Create payment intent
            await paymentAPI.createPayment(newChatId);

            // For demo, simulate successful payment
            toast.success("Processing payment...");

            // Unlock chat after payment
            await paymentAPI.unlockChat(newChatId);

            toast.success("Payment successful! Chat unlocked.");
            setShowPaymentModal(false);
            navigate(`/chat/${newChatId}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Payment failed");
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Loading trainer profile...</p>
                </div>
            </div>
        );
    }

    if (!trainer) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white mb-2">Trainer Not Found</h2>
                    <button onClick={() => navigate("/trainers")} className="btn-neon">
                        Back to Search
                    </button>
                </div>
            </div>
        );
    }

    const trainerProfile = trainer.trainerProfile || trainer;
    const trainerUser = trainer.trainerUser || trainer;
    const specialties = trainerProfile.specialties?.split(",") || [];
    const certifications = trainerProfile.certifications?.split(",") || [];

    return (
        <div className="min-h-screen bg-dark-900 bg-mesh-pattern">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-electric-blue/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl animate-pulse-slow" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-dark-600 bg-dark-900/80 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate("/trainers")}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Trainers
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Header */}
                <div className="card-dark mb-6">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-electric-blue to-neon-cyan flex items-center justify-center shadow-glow-blue">
                                <span className="text-5xl font-bold text-dark-900">
                                    {trainerUser.username?.[0]?.toUpperCase() || "T"}
                                </span>
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-2 bg-dark-800 rounded-lg border border-dark-500">
                                <CheckCircle className="w-6 h-6 text-neon-green" />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">
                                        {trainerUser.username || "Trainer"}
                                    </h1>
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                            <span className="text-white font-bold text-lg">
                                                {trainerProfile.trustScore?.toFixed(1) || "5.0"}
                                            </span>
                                            <span className="text-gray-400 text-sm">Trust Score</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <span>{trainerProfile.experienceYears || 0} years experience</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price & CTA for mobile */}
                                <div className="md:hidden w-full mt-4">
                                    <button
                                        onClick={handleStartChat}
                                        disabled={creatingChat}
                                        className="btn-neon w-full flex items-center justify-center gap-2"
                                    >
                                        {creatingChat ? (
                                            <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <MessageSquare className="w-5 h-5" />
                                                Start Chat - ₹500
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-400 mt-4 leading-relaxed">
                                {trainerProfile.bio || "Certified fitness trainer dedicated to helping you achieve your fitness goals through personalized coaching and expert guidance."}
                            </p>
                        </div>

                        {/* CTA for desktop */}
                        <div className="hidden md:flex flex-col items-end gap-3">
                            <div className="text-right mb-2">
                                <p className="text-gray-400 text-sm">Per Session</p>
                                <p className="text-3xl font-bold text-gradient">₹500</p>
                            </div>
                            <button
                                onClick={handleStartChat}
                                disabled={creatingChat}
                                className="btn-neon flex items-center gap-2"
                            >
                                {creatingChat ? (
                                    <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <MessageSquare className="w-5 h-5" />
                                        Start Chat
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="card-stat text-center py-4">
                        <p className="text-2xl font-bold text-gradient">{trainerProfile.experienceYears || 0}+</p>
                        <p className="text-gray-400 text-sm">Years Experience</p>
                    </div>
                    <div className="card-stat text-center py-4">
                        <p className="text-2xl font-bold text-gradient">{certifications.length}</p>
                        <p className="text-gray-400 text-sm">Certifications</p>
                    </div>
                    <div className="card-stat text-center py-4">
                        <p className="text-2xl font-bold text-gradient">{specialties.length}</p>
                        <p className="text-gray-400 text-sm">Specialties</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Specialties */}
                    <div className="card-dark">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-neon-green" />
                            <h2 className="text-lg font-bold text-white">Specialties</h2>
                        </div>
                        {specialties.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {specialties.map((specialty, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-2 rounded-lg text-sm font-medium bg-neon-green/10 text-neon-green border border-neon-green/30"
                                    >
                                        {specialty.trim()}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No specialties listed</p>
                        )}
                    </div>

                    {/* Certifications */}
                    <div className="card-dark">
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="w-5 h-5 text-electric-blue" />
                            <h2 className="text-lg font-bold text-white">Certifications</h2>
                        </div>
                        {certifications.length > 0 ? (
                            <div className="space-y-2">
                                {certifications.map((cert, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-dark-700">
                                        <CheckCircle className="w-4 h-4 text-electric-blue flex-shrink-0" />
                                        <span className="text-gray-300 text-sm">{cert.trim()}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No certifications listed</p>
                        )}
                    </div>
                </div>

                {/* CTA Banner */}
                <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-700 via-dark-800 to-dark-700 border border-dark-500 p-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 via-electric-blue/5 to-neon-green/5" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green to-electric-blue" />

                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-neon-green/20 border border-neon-green/30">
                                <Zap className="w-8 h-8 text-neon-green" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Ready to Transform?</h3>
                                <p className="text-gray-400">Start your personalized fitness journey today</p>
                            </div>
                        </div>
                        <button
                            onClick={handleStartChat}
                            disabled={creatingChat}
                            className="btn-neon flex items-center gap-2 text-lg px-8 py-4"
                        >
                            {creatingChat ? (
                                <div className="w-6 h-6 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Start Chat - ₹500
                                    <ChevronRight className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>

            {/* Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => !paying && setShowPaymentModal(false)}
                title=""
            >
                <div className="text-center">
                    {/* Trainer Preview */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-electric-blue to-neon-cyan flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl font-bold text-dark-900">
                            {trainerUser.username?.[0]?.toUpperCase() || "T"}
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        Start Chat with {trainerUser.username}
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Unlock personalized coaching and expert fitness guidance
                    </p>

                    {/* Payment Details */}
                    <div className="bg-dark-700 rounded-xl p-6 mb-6 text-left">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400">Session Fee</span>
                            <span className="text-white font-semibold">₹500</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400">Platform Fee</span>
                            <span className="text-white font-semibold">₹0</span>
                        </div>
                        <div className="border-t border-dark-500 pt-3 flex items-center justify-between">
                            <span className="text-white font-bold">Total</span>
                            <span className="text-2xl font-bold text-gradient">₹500</span>
                        </div>
                    </div>

                    {/* Security Info */}
                    <div className="flex items-center gap-3 p-3 bg-neon-green/10 border border-neon-green/30 rounded-lg mb-6">
                        <Shield className="w-5 h-5 text-neon-green flex-shrink-0" />
                        <p className="text-sm text-gray-300 text-left">
                            Your payment is held in escrow until the session is completed. 100% secure.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <button
                        onClick={handlePayment}
                        disabled={paying}
                        className="btn-neon w-full flex items-center justify-center gap-2 text-lg py-4"
                    >
                        {paying ? (
                            <div className="w-6 h-6 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                Pay ₹500 & Start Chat
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => setShowPaymentModal(false)}
                        disabled={paying}
                        className="mt-3 text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>

                    <p className="text-xs text-gray-500 mt-4">
                        Secure payment powered by Stripe (Test Mode)
                    </p>
                </div>
            </Modal>
        </div>
    );
};
