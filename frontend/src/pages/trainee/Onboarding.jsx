import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { traineeAPI } from "../../api";
import { Button } from "../../components/ui/Button";
import {
    Dumbbell,
    Target,
    Heart,
    Scale,
    Ruler,
    Zap,
    ChevronRight,
    User
} from "lucide-react";
import toast from "react-hot-toast";

export const TraineeOnboarding = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        age: "",
        gender: "",
        heightCM: "",
        weightKG: "",
        fitnessGoals: "",
        medicalConditions: "",
    });

    const goals = [
        { id: "weight_loss", label: "Weight Loss", icon: Scale, color: "from-red-500 to-orange-500" },
        { id: "muscle_gain", label: "Build Muscle", icon: Dumbbell, color: "from-purple-500 to-pink-500" },
        { id: "endurance", label: "Endurance", icon: Heart, color: "from-blue-500 to-cyan-500" },
        { id: "flexibility", label: "Flexibility", icon: Target, color: "from-green-500 to-lime-500" },
        { id: "general", label: "General Fitness", icon: Zap, color: "from-yellow-500 to-amber-500" },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoalSelect = (goal) => {
        setFormData({ ...formData, fitnessGoals: goal });
    };

    const handleSubmit = async () => {
        if (!formData.age || !formData.gender || !formData.heightCM || !formData.weightKG || !formData.fitnessGoals) {
            toast.error("Please complete all fields");
            return;
        }

        setLoading(true);
        try {
            const response = await traineeAPI.completeOnboarding({
                age: parseInt(formData.age),
                gender: formData.gender,
                heightCM: parseFloat(formData.heightCM),
                weightKG: parseFloat(formData.weightKG),
                fitnessGoals: formData.fitnessGoals,
                medicalConditions: formData.medicalConditions || "",
            });

            toast.success(`Your BMI: ${response.data.bmi?.toFixed(1)} (${response.data.bmiCategory})`);

            if (refreshUser) await refreshUser();

            navigate("/trainee/dashboard");
        } catch (error) {
            toast.error(error.response?.data?.message || "Onboarding failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 bg-mesh-pattern flex items-center justify-center p-4">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-neon-green/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-electric-blue/5 rounded-full blur-3xl animate-pulse-slow" />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green/10 border border-neon-green/30 rounded-full mb-4">
                        <Zap className="w-5 h-5 text-neon-green" />
                        <span className="text-neon-green font-bold text-sm uppercase tracking-wider">
                            Mission Setup
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4">
                        PREPARE FOR <span className="text-gradient">TRANSFORMATION</span>
                    </h1>
                    <p className="text-gray-400">
                        Welcome, <span className="text-neon-green font-semibold">{user?.username}</span>! Let's configure your fitness mission.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step
                                    ? "bg-gradient-to-r from-neon-green to-electric-blue"
                                    : "bg-dark-600"
                                }`}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8 shadow-2xl">
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-neon-green/20 rounded-xl">
                                    <User className="w-6 h-6 text-neon-green" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Basic Information</h2>
                                    <p className="text-gray-500 text-sm">Tell us about yourself</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="25"
                                        className="input-dark"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="input-dark"
                                    >
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.age || !formData.gender}
                                className="btn-neon w-full flex items-center justify-center gap-2"
                            >
                                Continue <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Body Metrics */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-electric-blue/20 rounded-xl">
                                    <Scale className="w-6 h-6 text-electric-blue" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Body Metrics</h2>
                                    <p className="text-gray-500 text-sm">We'll calculate your BMI</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        <Ruler className="w-4 h-4 inline mr-1" />
                                        Height (cm)
                                    </label>
                                    <input
                                        type="number"
                                        name="heightCM"
                                        value={formData.heightCM}
                                        onChange={handleChange}
                                        placeholder="175"
                                        className="input-dark"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        <Scale className="w-4 h-4 inline mr-1" />
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        name="weightKG"
                                        value={formData.weightKG}
                                        onChange={handleChange}
                                        placeholder="70"
                                        className="input-dark"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Medical Conditions (optional)
                                </label>
                                <textarea
                                    name="medicalConditions"
                                    value={formData.medicalConditions}
                                    onChange={handleChange}
                                    placeholder="Any injuries, allergies, or conditions we should know about..."
                                    rows={3}
                                    className="input-dark resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="btn-dark flex-1">
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!formData.heightCM || !formData.weightKG}
                                    className="btn-neon flex-1 flex items-center justify-center gap-2"
                                >
                                    Continue <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Fitness Goals */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-neon-purple/20 rounded-xl">
                                    <Target className="w-6 h-6 text-neon-purple" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Select Your Goal</h2>
                                    <p className="text-gray-500 text-sm">What's your primary objective?</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {goals.map((goal) => (
                                    <button
                                        key={goal.id}
                                        onClick={() => handleGoalSelect(goal.id)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${formData.fitnessGoals === goal.id
                                                ? "border-neon-green bg-neon-green/10 shadow-neon-green"
                                                : "border-dark-500 hover:border-dark-400 bg-dark-700"
                                            }`}
                                    >
                                        <div className={`p-3 rounded-lg bg-gradient-to-br ${goal.color}`}>
                                            <goal.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="font-bold text-lg">{goal.label}</span>
                                        {formData.fitnessGoals === goal.id && (
                                            <div className="ml-auto w-6 h-6 rounded-full bg-neon-green flex items-center justify-center">
                                                <ChevronRight className="w-4 h-4 text-dark-900" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep(2)} className="btn-dark flex-1">
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.fitnessGoals || loading}
                                    className="btn-neon flex-1 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5" />
                                            Launch Mission
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
