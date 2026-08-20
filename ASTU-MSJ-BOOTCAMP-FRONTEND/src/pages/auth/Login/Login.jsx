import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/users';

  const handleQuickLogin = (role) => {
    const mockUser = {
      id: 1,
      name: `${role} User`,
      email: `${role.toLowerCase()}@example.com`,
      role,
    };
    login(mockUser, 'mock-jwt-token');
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">Bootcamp Management</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in to access your dashboard</p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
            Quick RBAC Login Simulator
          </p>
          <button
            type="button"
            onClick={() => handleQuickLogin('Admin')}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
          >
            Login as Admin (Full Access)
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('Mentor')}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
          >
            Login as Mentor
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('Student')}
            className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-lg transition"
          >
            Login as Student
          </button>
        </div>
      </div>
    </div>
  );
}
