import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role ? String(user.role).toLowerCase() : '';
  const isAllowed = allowedRoles.some(
    (role) => String(role).toLowerCase() === userRole
  );

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
}
