import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LandingPage from '@/pages/LandingPage';
import CustomerRequestPage from '@/pages/CustomerRequestPage';
import CustomerTrackPage from '@/pages/CustomerTrackPage';
import TechnicianPage from '@/pages/TechnicianPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import NetworkStatusBanner from '@/components/common/NetworkStatusBanner';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

function AlreadyAuthed({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-ink text-mist font-body">
          <NetworkStatusBanner />
          <div className="flex-1 flex flex-col">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/request" element={<CustomerRequestPage />} />
              <Route path="/track/:id" element={<CustomerTrackPage />} />
              <Route path="/tech/:id" element={<TechnicianPage />} />

              {/* Admin routes */}
              <Route
                path="/admin/login"
                element={
                  <AlreadyAuthed>
                    <AdminLoginPage />
                  </AlreadyAuthed>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
