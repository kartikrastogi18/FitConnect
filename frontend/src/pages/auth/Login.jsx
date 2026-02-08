import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Zap, Mail, Lock, ChevronRight, Eye, EyeOff } from "lucide-react";

export const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            const user = result.user;
            if (user.role === "admin") {
                navigate("/admin/dashboard");
            } else if (user.role === "trainer") {
                navigate("/trainer/dashboard");
            } else {
                navigate("/trainee/dashboard");
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-dark-900 bg-mesh-pattern flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-purple/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green/10 border border-neon-green/30 rounded-full mb-6">
                        <Zap className="w-5 h-5 text-neon-green" />
                        <span className="text-neon-green font-bold text-sm uppercase tracking-wider">
                            Login Portal
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-2">
                        FIT<span className="text-gradient">CONNECT</span>
                    </h1>
                    <p className="text-gray-400">Enter your credentials to access mission control</p>
                </div>

                {/* Login Form */}
                <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-dark pl-12 pr-12 w-full"
                                    required
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
                            type="submit"
                            disabled={loading}
                            className="btn-neon w-full flex items-center justify-center gap-2 py-4"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Login <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-neon-green font-semibold hover:underline">
                                Register Now
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 text-sm mt-8">
                    By logging in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};
