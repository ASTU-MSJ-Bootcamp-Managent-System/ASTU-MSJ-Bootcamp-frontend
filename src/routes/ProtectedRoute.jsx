import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rolePaths } from '../config/navigation';

export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return roles.includes(user.role) ? children : <Navigate to={rolePaths[user.role]} replace />;
}
