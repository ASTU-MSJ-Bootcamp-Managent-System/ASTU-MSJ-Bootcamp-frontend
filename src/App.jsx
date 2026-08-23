import { Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardArea from './routes/DashboardArea';
import AuthPage from './pages/auth/AuthPage';
import NotFoundPage from './pages/errors/NotFoundPage';
import LandingPage from './pages/public/LandingPage';

const roles = ['admin', 'mentor', 'student'];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage register />} />
      <Route path="/forgot-password" element={<AuthPage forgot />} />
      <Route path="/reset-password" element={<AuthPage forgot />} />

      {roles.map((role) => (
        <Route
          key={role}
          path={`/${role}/*`}
          element={
            <ProtectedRoute roles={[role]}>
              <DashboardLayout>
                <DashboardArea />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      ))}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
