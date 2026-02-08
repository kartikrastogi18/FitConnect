import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";

// Auth Pages
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";

// Trainee Pages
import { TraineeDashboard } from "./pages/trainee/Dashboard";
import { TraineeOnboarding } from "./pages/trainee/Onboarding";
import { TrainerSearch } from "./pages/trainee/TrainerSearch";
import { TrainerProfile } from "./pages/trainee/TrainerProfile";
import { Chat } from "./pages/trainee/Chat";

// Trainer Pages
import { TrainerDashboard } from "./pages/trainer/Dashboard";
import { TrainerOnboarding } from "./pages/trainer/Onboarding";

// Admin Pages
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminTrainers } from "./pages/admin/Trainers";
import { AdminPayments } from "./pages/admin/Payments";

// Protected Route Component with Onboarding Check
const ProtectedRoute = ({ children, allowedRoles, skipOnboarding = false }) => {
  const { isAuthenticated, user, loading, needsOnboarding } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // Redirect trainee to onboarding if not complete (unless skipOnboarding is true)
  if (user?.role === "trainee" && needsOnboarding && !skipOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect trainer to onboarding if not complete (unless skipOnboarding is true)
  if (user?.role === "trainer" && needsOnboarding && !skipOnboarding) {
    return <Navigate to="/trainer/onboarding" replace />;
  }

  return children;
};

// Trainee Onboarding Route
const TraineeOnboardingRoute = ({ children }) => {
  const { isAuthenticated, user, loading, needsOnboarding } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "trainee") {
    return <Navigate to="/" replace />;
  }

  // If onboarding already complete, redirect to dashboard
  if (!needsOnboarding) {
    return <Navigate to="/trainee/dashboard" replace />;
  }

  return children;
};

// Trainer Onboarding Route
const TrainerOnboardingRoute = ({ children }) => {
  const { isAuthenticated, user, loading, needsOnboarding } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-electric-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "trainer") {
    return <Navigate to="/" replace />;
  }

  // If onboarding already complete, redirect to dashboard
  if (!needsOnboarding) {
    return <Navigate to="/trainer/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  const { isAuthenticated, user, needsOnboarding } = useAuth();

  // Determine default route based on user state
  const getDefaultRoute = () => {
    if (!isAuthenticated) return "/login";

    if (user?.role === "admin") return "/admin/dashboard";

    if (user?.role === "trainer") {
      if (needsOnboarding) return "/trainer/onboarding";
      return "/trainer/dashboard";
    }

    // Trainee
    if (needsOnboarding) return "/onboarding";
    return "/trainee/dashboard";
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Register />}
      />

      {/* Trainee Onboarding Route */}
      <Route
        path="/onboarding"
        element={
          <TraineeOnboardingRoute>
            <TraineeOnboarding />
          </TraineeOnboardingRoute>
        }
      />

      {/* Trainer Onboarding Route */}
      <Route
        path="/trainer/onboarding"
        element={
          <TrainerOnboardingRoute>
            <TrainerOnboarding />
          </TrainerOnboardingRoute>
        }
      />

      {/* Trainee Routes */}
      <Route
        path="/trainee/dashboard"
        element={
          <ProtectedRoute allowedRoles={["trainee"]}>
            <TraineeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainers"
        element={
          <ProtectedRoute allowedRoles={["trainee"]}>
            <TrainerSearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainers/:trainerId"
        element={
          <ProtectedRoute allowedRoles={["trainee"]}>
            <TrainerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:chatId"
        element={
          <ProtectedRoute allowedRoles={["trainee", "trainer"]}>
            <Chat />
          </ProtectedRoute>
        }
      />

      {/* Trainer Routes */}
      <Route
        path="/trainer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <TrainerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/trainers"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminTrainers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPayments />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1A1A1A',
                color: '#fff',
                border: '1px solid #2D2D2D',
                borderRadius: '12px',
                padding: '16px',
              },
              success: {
                iconTheme: {
                  primary: '#39FF14',
                  secondary: '#0A0A0A',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
