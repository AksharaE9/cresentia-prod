import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import AssessmentPage from './pages/AssessmentPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import TermsPage from './pages/TermsPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'admin' || user.role === 'instructor') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <LandingPage />;
  if (user.role === 'admin' || user.role === 'instructor') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

function App() {
  const { user } = useAuth();
  const showNavbar =
    (Boolean(user) || location.pathname === '/courses') &&
    location.pathname !== '/admin';

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<TermsPage />} />
        <Route path="/courses" element={<HomePage />} />
        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute roles={['user', 'student', 'admin', 'instructor']}>
              <CoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id/assessment"
          element={
            <ProtectedRoute roles={['user', 'student', 'admin', 'instructor']}>
              <AssessmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['user', 'student', 'admin', 'instructor']}>
              <StudentDashboardPage defaultTab="overview" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-courses"
          element={
            <ProtectedRoute roles={['user', 'student', 'admin', 'instructor']}>
              <StudentDashboardPage defaultTab="courses" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute roles={['user', 'student', 'admin', 'instructor']}>
              <StudentDashboardPage defaultTab="progress" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={['user', 'student', 'admin', 'instructor']}>
              <StudentDashboardPage defaultTab="profile" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates"
          element={
            <ProtectedRoute roles={['user', 'student', 'admin', 'instructor']}>
              <StudentDashboardPage defaultTab="certificates" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute roles={['user', 'student', 'admin', 'instructor']}>
              <StudentDashboardPage defaultTab="notifications" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin', 'instructor']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor"
          element={<Navigate to="/admin" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
