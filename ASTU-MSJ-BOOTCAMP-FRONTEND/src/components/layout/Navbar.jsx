import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'mentor':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'student':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center font-black text-white text-sm shadow-md">
            M
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block leading-none">
              ASTU MSJ Bootcamp
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Management System</span>
          </div>
        </div>

        {/* User Info & Actions */}
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-100">{user?.name || 'User'}</span>
              <span className="text-xs text-slate-400">{user?.email}</span>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${getRoleBadge(user?.role)}`}>
              {user?.role || 'Guest'}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
