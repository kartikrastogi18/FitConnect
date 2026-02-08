import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { trainerAPI } from "../../api";
import {
    Dumbbell,
    Award,
    Clock,
    FileText,
    Zap,
    ChevronRight,
    CheckCircle
} from "lucide-react";
import toast from "react-hot-toast";

export const TrainerOnboarding = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        certifications: "",
        specialties: [],
        experienceYears: "",
        bio: "",
    });

    const specialtyOptions = [
        { id: "weight_training", label: "Weight Training" },
        { id: "cardio", label: "Cardio & HIIT" },
        { id: "yoga", label: "Yoga & Flexibility" },
        { id: "nutrition", label: "Nutrition" },
        { id: "bodybuilding", label: "Bodybuilding" },
        { id: "crossfit", label: "CrossFit" },
        { id: "sports", label: "Sports Training" },
        { id: "rehabilitation", label: "Rehabilitation" },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSpecialty = (specialty) => {
        const current = formData.specialties;
        if (current.includes(specialty)) {
            setFormData({
                ...formData,
                specialties: current.filter((s) => s !== specialty),
            });
        } else {
            setFormData({
                ...formData,
                specialties: [...current, specialty],
            });
        }
    };

    const handleSubmit = async () => {
        if (!formData.certifications || formData.specialties.length === 0 || !formData.experienceYears || !formData.bio) {
            toast.error("Please complete all fields");
            return;
        }

        setLoading(true);
        try {
            await trainerAPI.completeOnboarding({
                certifications: formData.certifications,
                specialties: formData.specialties.join(", "),
                experienceYears: parseInt(formData.experienceYears),
                bio: formData.bio,
            });

            toast.success("Profile submitted! Awaiting admin approval.");

            if (refreshUser) await refreshUser();

            navigate("/trainer/dashboard");
        } catch (error) {
            toast.error(error.response?.data?.message || "Onboarding failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 bg-mesh-pattern flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-electric-blue/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl animate-pulse-slow" />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-electric-blue/10 border border-electric-blue/30 rounded-full mb-4">
                        <Dumbbell className="w-5 h-5 text-electric-blue" />
                        <span className="text-electric-blue font-bold text-sm uppercase tracking-wider">
                            Trainer Setup
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4">
                        BUILD YOUR <span className="text-gradient">PROFILE</span>
                    </h1>
                    <p className="text-gray-400">
                        Welcome, <span className="text-electric-blue font-semibold">{user?.username}</span>! Let's set up your trainer profile.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step
                                    ? "bg-gradient-to-r from-electric-blue to-neon-cyan"
                                    : "bg-dark-600"
                                }`}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8 shadow-2xl">
                    {/* Step 1: Certifications & Experience */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-electric-blue/20 rounded-xl">
                                    <Award className="w-6 h-6 text-electric-blue" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Credentials</h2>
                                    <p className="text-gray-500 text-sm">Your certifications and experience</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Certifications (comma separated)
                                </label>
                                <input
                                    type="text"
                                    name="certifications"
                                    value={formData.certifications}
                                    onChange={handleChange}
                                    placeholder="ACE Certified, NASM-CPT, CrossFit Level 1..."
                                    className="input-dark"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Years of Experience
                                </label>
                                <select
                                    name="experienceYears"
                                    value={formData.experienceYears}
                                    onChange={handleChange}
                                    className="input-dark"
                                >
                                    <option value="">Select...</option>
                                    <option value="1">1-2 years</option>
                                    <option value="3">3-5 years</option>
                                    <option value="5">5-10 years</option>
                                    <option value="10">10+ years</option>
                                </select>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.certifications || !formData.experienceYears}
                                className="btn-electric w-full flex items-center justify-center gap-2"
                            >
                                Continue <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Specialties */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-neon-green/20 rounded-xl">
                                    <Dumbbell className="w-6 h-6 text-neon-green" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Specialties</h2>
                                    <p className="text-gray-500 text-sm">Select your areas of expertise</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {specialtyOptions.map((specialty) => (
                                    <button
                                        key={specialty.id}
                                        onClick={() => toggleSpecialty(specialty.id)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${formData.specialties.includes(specialty.id)
                                                ? "border-neon-green bg-neon-green/10"
                                                : "border-dark-500 hover:border-dark-400 bg-dark-700"
                                            }`}
                                    >
                                        {formData.specialties.includes(specialty.id) && (
                                            <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0" />
                                        )}
                                        <span className={`font-medium ${formData.specialties.includes(specialty.id) ? "text-white" : "text-gray-400"}`}>
                                            {specialty.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="btn-dark flex-1">
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={formData.specialties.length === 0}
                                    className="btn-electric flex-1 flex items-center justify-center gap-2"
                                >
                                    Continue <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Bio */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-neon-purple/20 rounded-xl">
                                    <FileText className="w-6 h-6 text-neon-purple" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Your Bio</h2>
                                    <p className="text-gray-500 text-sm">Tell trainees about yourself</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Professional Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Tell potential clients about your training philosophy, achievements, and what makes you unique as a trainer..."
                                    rows={6}
                                    className="input-dark resize-none"
                                />
                            </div>

                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                                <p className="text-yellow-400 text-sm">
                                    <strong>Note:</strong> After submitting, your profile will be reviewed by an admin. You'll be notified once approved.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep(2)} className="btn-dark flex-1">
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.bio || loading}
                                    className="btn-neon flex-1 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5" />
                                            Submit Profile
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
