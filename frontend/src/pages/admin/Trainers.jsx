import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../api";
import {
    ArrowLeft,
    Check,
    X,
    Star,
    Award,
    Clock,
    User
} from "lucide-react";
import toast from "react-hot-toast";

export const AdminTrainers = () => {
    const navigate = useNavigate();
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState({});

    useEffect(() => {
        loadPendingTrainers();
    }, []);

    const loadPendingTrainers = async () => {
        try {
            const response = await adminAPI.getPendingTrainers();
            setTrainers(response.data.trainers || []);
        } catch (error) {
            toast.error("Failed to load pending trainers");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (trainerId) => {
        setProcessing({ ...processing, [trainerId]: true });
        try {
            await adminAPI.approveTrainer(trainerId);
            toast.success("Trainer approved!");
            setTrainers(trainers.filter((t) => t.id !== trainerId));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to approve trainer");
        } finally {
            setProcessing({ ...processing, [trainerId]: false });
        }
    };

    const handleReject = async (trainerId) => {
        setProcessing({ ...processing, [trainerId]: true });
        try {
            await adminAPI.rejectTrainer(trainerId);
            toast.success("Trainer rejected");
            setTrainers(trainers.filter((t) => t.id !== trainerId));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reject trainer");
        } finally {
            setProcessing({ ...processing, [trainerId]: false });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-electric-blue border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Loading trainers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 bg-mesh-pattern">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-electric-blue/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl animate-pulse-slow" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-dark-600 bg-dark-900/80 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/admin/dashboard")}
                            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Trainer <span className="text-gradient">Approvals</span></h1>
                            <p className="text-gray-500 text-sm">Review and approve trainer applications</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Bar */}
                <div className="flex items-center justify-between mb-8">
                    <span className="badge-pending text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {trainers.length} Pending Approval{trainers.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {trainers.length === 0 ? (
                    <div className="card-dark text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-neon-green/10 flex items-center justify-center">
                            <Check className="w-12 h-12 text-neon-green" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
                        <p className="text-gray-500">No pending trainer applications</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {trainers.map((trainer) => (
                            <div
                                key={trainer.id}
                                className="card-dark hover:border-dark-400 transition-colors"
                            >
                                <div className="flex flex-col md:flex-row md:items-start gap-6">
                                    {/* Avatar */}
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-electric-blue to-neon-cyan flex items-center justify-center flex-shrink-0">
                                        <span className="text-3xl font-bold text-dark-900">
                                            {trainer.username?.[0]?.toUpperCase() || "T"}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1">{trainer.username}</h3>
                                                <p className="text-gray-400 text-sm">{trainer.email}</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(trainer.id)}
                                                    disabled={processing[trainer.id]}
                                                    className="btn-neon flex items-center gap-2"
                                                >
                                                    {processing[trainer.id] ? (
                                                        <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Check className="w-4 h-4" />
                                                            Approve
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(trainer.id)}
                                                    disabled={processing[trainer.id]}
                                                    className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>

                                        {trainer.trainerProfile && (
                                            <div className="space-y-4">
                                                {/* Bio */}
                                                {trainer.trainerProfile.bio && (
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Bio</p>
                                                        <p className="text-gray-300">{trainer.trainerProfile.bio}</p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {/* Experience */}
                                                    <div className="p-3 bg-dark-700 rounded-lg">
                                                        <p className="text-gray-500 text-xs mb-1">Experience</p>
                                                        <p className="text-white font-semibold">
                                                            {trainer.trainerProfile.experienceYears || 0} years
                                                        </p>
                                                    </div>

                                                    {/* Certifications */}
                                                    {trainer.trainerProfile.certifications && (
                                                        <div className="p-3 bg-dark-700 rounded-lg">
                                                            <p className="text-gray-500 text-xs mb-1">Certifications</p>
                                                            <p className="text-white font-semibold truncate">
                                                                {trainer.trainerProfile.certifications.split(",")[0]}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Specialties Count */}
                                                    {trainer.trainerProfile.specialties && (
                                                        <div className="p-3 bg-dark-700 rounded-lg">
                                                            <p className="text-gray-500 text-xs mb-1">Specialties</p>
                                                            <p className="text-white font-semibold">
                                                                {trainer.trainerProfile.specialties.split(",").length} areas
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Specialties Tags */}
                                                {trainer.trainerProfile.specialties && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {trainer.trainerProfile.specialties.split(",").map((s, idx) => (
                                                            <span key={idx} className="px-3 py-1 rounded-lg text-xs font-medium bg-electric-blue/10 text-electric-blue border border-electric-blue/30">
                                                                {s.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
