import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Navbar from './components/common/Navbar';
import LoadingSpinner from './components/common/LoadingSpinner';
import SplashScreen from './components/SplashScreen';
import PremiumCalculator from './components/policies/PremiumCalculator'; // Add this import
import LandingPage from './components/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import PolicyManagement from './components/policies/PolicyManagement';
import ClaimsManagement from './components/claims/ClaimsManagement';
import LocationTracker from './components/tracking/LocationTracker';
import Profile from './components/profile/Profile';
import PaymentHistoryPage from './components/payments/PaymentHistoryPage';
import AdminLogin from './components/admin/AdminLogin';
import AdminRegister from './components/admin/AdminRegister';
import AdminDashboard from './components/admin/AdminDashboard';


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const AdminPublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
};

const Layout = ({ children }) => {
  const { darkMode } = useTheme();
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      {children}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
            <Route path="/admin/register" element={<AdminPublicRoute><AdminRegister /></AdminPublicRoute>} />
            <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/policies" element={<ProtectedRoute><Layout><PolicyManagement /></Layout></ProtectedRoute>} />
            <Route path="/claims" element={<ProtectedRoute><Layout><ClaimsManagement /></Layout></ProtectedRoute>} />
            <Route path="/track" element={<ProtectedRoute><Layout><LocationTracker /></Layout></ProtectedRoute>} />
            {/* Premium Calculator Route */}
            <Route path="/calculator" element={<ProtectedRoute><Layout><div className="max-w-7xl mx-auto py-8 px-4"><PremiumCalculator /></div></Layout></ProtectedRoute>} />
            {/* Payment History Route */}
            <Route path="/payment-history" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                  <Navbar />
                  <PaymentHistoryPage />
                  </div>
                  </ProtectedRoute>
            } />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}



export default App;