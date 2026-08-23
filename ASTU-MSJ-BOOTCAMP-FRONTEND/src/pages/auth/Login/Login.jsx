import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuickLogin = (role) => {
    const mockUser = {
      id: role === 'Student' ? 101 : 1,
      name: role === 'Student' ? 'Ahmed Ali' : `${role} User`,
      email: role === 'Student' ? 'ahmed.ali@example.com' : `${role.toLowerCase()}@example.com`,
      role,
    };
    login(mockUser, 'mock-jwt-token');

    // Role specific default target route
    let target = '/admin/users';
    if (role === 'Mentor') {
      target = '/mentor/dashboard';
    } else if (role === 'Student') {
      target = '/student/dashboard';
    }

    const from = location.state?.from?.pathname || target;
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            M
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">ASTU MSJ Bootcamp</h2>
          <p className="text-sm text-slate-500 mt-1">Management System Login Portal</p>
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
            Role-Based Access Simulator
          </p>

          <button
            type="button"
            onClick={() => handleQuickLogin('Student')}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-between"
          >
            <span>Login as Student (Ahmed Ali)</span>
            <span className="text-xs font-semibold bg-indigo-700/60 px-2 py-0.5 rounded-md">Academic Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('Mentor')}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-between"
          >
            <span>Login as Mentor</span>
            <span className="text-xs font-semibold bg-emerald-700/60 px-2 py-0.5 rounded-md">Mentor Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('Admin')}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-between"
          >
            <span>Login as Admin</span>
            <span className="text-xs font-semibold bg-slate-800 px-2 py-0.5 rounded-md">Full Access</span>
          </button>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100">
          Connected Journey: Attendance • Progress • Assignments • Grades
        </div>
      </div>
    </div>
  );
}
