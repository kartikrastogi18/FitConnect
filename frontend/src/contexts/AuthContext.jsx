import { createContext, useContext, useState, useEffect } from "react";
import { authAPI, traineeAPI, trainerAPI } from "../api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    useEffect(() => {
        // Load user from localStorage on mount
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            // Admin users don't need onboarding
            // For trainee/trainer, check onboardingCompleted field
            if (parsedUser.role === "admin") {
                setNeedsOnboarding(false);
            } else if (!parsedUser.onboardingCompleted) {
                setNeedsOnboarding(true);
            } else {
                setNeedsOnboarding(false);
            }
        }
        setLoading(false);
    }, []);

    const refreshUser = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (!storedUser) return;

            if (storedUser.role === "trainee") {
                await traineeAPI.getMyInfo();
            }
            // Trainer profile check handled server-side

            setNeedsOnboarding(false);
            storedUser.onboardingCompleted = true;
            localStorage.setItem("user", JSON.stringify(storedUser));
            setUser(storedUser);
        } catch (error) {
            console.error("Failed to refresh user");
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            setToken(token);
            setUser(user);

            // Admin users don't need onboarding
            // For trainee/trainer, check onboardingCompleted field
            if (user.role === "admin") {
                setNeedsOnboarding(false);
            } else if (!user.onboardingCompleted) {
                setNeedsOnboarding(true);
            } else {
                setNeedsOnboarding(false);
            }

            toast.success("Login successful!");
            return { success: true, user };
        } catch (error) {
            const message = error.response?.data?.message || "Login failed";
            toast.error(message);
            return { success: false, message };
        }
    };

    const signup = async (name, email, password, role) => {
        try {
            const response = await authAPI.signup({ name, email, password, role });
            toast.success(response.data.message);
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.message || "Signup failed";
            toast.error(message);
            return { success: false, message };
        }
    };

    const verify = async (email, otp) => {
        try {
            const response = await authAPI.verify({ email, otp });
            toast.success("Email verified successfully!");
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || "Verification failed";
            toast.error(message);
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        setNeedsOnboarding(false);
        toast.success("Logged out successfully");
    };

    const value = {
        user,
        token,
        loading,
        needsOnboarding,
        login,
        signup,
        verify,
        logout,
        refreshUser,
        isAuthenticated: !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
