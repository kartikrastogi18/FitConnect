import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
    Zap,
    Mail,
    Lock,
    User,
    ChevronRight,
    Eye,
    EyeOff,
    Dumbbell,
    Users,
    CheckCircle,
    Info
} from "lucide-react";

export const Register = () => {
    const navigate = useNavigate();
    const { signup, verify } = useAuth();
    const [step, setStep] = useState(1); // 1: Form, 2: Role, 3: OTP
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [otpFallback, setOtpFallback] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
        otp: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSignup = async () => {
        setLoading(true);
        const result = await signup(formData.name, formData.email, formData.password, formData.role);

        if (result.success) {
            setOtpFallback(result.otpFallback || false);
            setStep(3);
        }
        setLoading(false);
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await verify(formData.email, formData.otp);

        if (result.success) {
            navigate("/login");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-dark-900 bg-mesh-pattern flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-electric-blue/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-purple/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-electric-blue/10 border border-electric-blue/30 rounded-full mb-6">
                        <Zap className="w-5 h-5 text-electric-blue" />
                        <span className="text-electric-blue font-bold text-sm uppercase tracking-wider">
                            {step === 3 ? "Verify Email" : "Join the Mission"}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-2">
                        FIT<span className="text-gradient">CONNECT</span>
                    </h1>
                    <p className="text-gray-400">
                        {step === 1 && "Create your account to start your journey"}
                        {step === 2 && "Select your role"}
                        {step === 3 && "Enter the OTP sent to your email"}
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

                {/* Form Card */}
                <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8 shadow-2xl">
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="input-dark pl-12 w-full"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="input-dark pl-12 w-full"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="input-dark pl-12 pr-12 w-full"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.name || !formData.email || formData.password.length < 6}
                                className="btn-neon w-full flex items-center justify-center gap-2 py-4"
                            >
                                Continue <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Role Selection */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in">
                            <div className="space-y-4">
                                {/* Trainee Option */}
                                <button
                                    onClick={() => handleRoleSelect("trainee")}
                                    className={`w-full p-5 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${formData.role === "trainee"
                                        ? "border-neon-green bg-neon-green/10 shadow-neon-green"
                                        : "border-dark-500 hover:border-dark-400 bg-dark-700"
                                        }`}
                                >
                                    <div className={`p-4 rounded-xl ${formData.role === "trainee"
                                        ? "bg-neon-green/20"
                                        : "bg-dark-600"
                                        }`}>
                                        <Users className={`w-8 h-8 ${formData.role === "trainee" ? "text-neon-green" : "text-gray-400"
                                            }`} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <h3 className="text-lg font-bold text-white">Trainee</h3>
                                        <p className="text-gray-400 text-sm">Get coached by trainers & AI</p>
                                    </div>
                                    {formData.role === "trainee" && (
                                        <CheckCircle className="w-6 h-6 text-neon-green" />
                                    )}
                                </button>

                                {/* Trainer Option */}
                                <button
                                    onClick={() => handleRoleSelect("trainer")}
                                    className={`w-full p-5 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${formData.role === "trainer"
                                        ? "border-electric-blue bg-electric-blue/10 shadow-neon-blue"
                                        : "border-dark-500 hover:border-dark-400 bg-dark-700"
                                        }`}
                                >
                                    <div className={`p-4 rounded-xl ${formData.role === "trainer"
                                        ? "bg-electric-blue/20"
                                        : "bg-dark-600"
                                        }`}>
                                        <Dumbbell className={`w-8 h-8 ${formData.role === "trainer" ? "text-electric-blue" : "text-gray-400"
                                            }`} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <h3 className="text-lg font-bold text-white">Trainer</h3>
                                        <p className="text-gray-400 text-sm">Coach trainees & earn money</p>
                                    </div>
                                    {formData.role === "trainer" && (
                                        <CheckCircle className="w-6 h-6 text-electric-blue" />
                                    )}
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="btn-dark flex-1">
                                    Back
                                </button>
                                <button
                                    onClick={handleSignup}
                                    disabled={!formData.role || loading}
                                    className="btn-neon flex-1 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Create Account <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: OTP Verification */}
                    {step === 3 && (
                        <form onSubmit={handleVerify} className="space-y-6 animate-in">
                            <div className="text-center mb-4">
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${otpFallback ? 'bg-yellow-500/20' : 'bg-neon-green/20'}`}>
                                    {otpFallback ? (
                                        <Info className="w-8 h-8 text-yellow-400" />
                                    ) : (
                                        <Mail className="w-8 h-8 text-neon-green" />
                                    )}
                                </div>
                                {otpFallback ? (
                                    <p className="text-gray-400">
                                        Email service is currently unavailable.<br />
                                        <span className="text-yellow-400 font-semibold">Please enter the fallback OTP below.</span>
                                    </p>
                                ) : (
                                    <p className="text-gray-400">
                                        We sent a verification code to<br />
                                        <span className="text-white font-semibold">{formData.email}</span>
                                    </p>
                                )}
                            </div>

                            {/* Fallback OTP Info Box */}
                            {otpFallback && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                                    <p className="text-yellow-400 font-bold text-lg tracking-widest">000000</p>
                                    <p className="text-yellow-400/80 text-sm mt-1">Use this OTP to verify your account</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 text-center">
                                    Enter 6-digit OTP
                                </label>
                                <input
                                    type="text"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    placeholder="000000"
                                    className="input-dark text-center text-2xl tracking-[0.5em] font-mono"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={formData.otp.length < 6 || loading}
                                className="btn-neon w-full flex items-center justify-center gap-2 py-4"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Verify & Continue <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {step !== 3 && (
                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                Already have an account?{" "}
                                <Link to="/login" className="text-neon-green font-semibold hover:underline">
                                    Login
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
