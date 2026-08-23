import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function MentorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Mentor Workspace 👨‍🏫
          </h1>
          <p className="text-sm text-emerald-200 mt-1">
            Welcome back, {user?.name || 'Mentor'}! Here is your daily bootcamp status overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/mentor/attendance')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
          >
            Take Attendance
          </button>
          <button
            type="button"
            onClick={() => navigate('/mentor/assignments')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
          >
            + Create Assignment
          </button>
        </div>
      </div>

      {/* OVERVIEW STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/mentor/attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 cursor-pointer transition"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Total Students</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">35</span>
          <span className="text-xs text-slate-400 mt-1 block">Batch A Enrolled</span>
        </div>

        <div
          onClick={() => navigate('/mentor/attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 cursor-pointer transition"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Today Attendance</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">83%</span>
          <span className="text-xs text-emerald-600 mt-1 block">29 Present, 3 Absent</span>
        </div>

        <div
          onClick={() => navigate('/mentor/assignments')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 cursor-pointer transition"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Pending Grading</span>
          <span className="text-3xl font-black text-amber-600 mt-1 block">5</span>
          <span className="text-xs text-amber-600 mt-1 block">Assignments to Review</span>
        </div>

        <div
          onClick={() => navigate('/mentor/progress')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 cursor-pointer transition"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Class Avg Progress</span>
          <span className="text-3xl font-black text-indigo-600 mt-1 block">78%</span>
          <span className="text-xs text-indigo-600 mt-1 block">React Module Active</span>
        </div>
      </div>

      {/* PENDING GRADING QUEUE & SHORTCUTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Pending Assignments Queue</h2>
              <p className="text-xs text-slate-400">Submissions awaiting mentor score & feedback</p>
            </div>
            <button
              onClick={() => navigate('/mentor/assignments')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Manage Assignments →
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">React Todo Application</h3>
                <span className="text-xs text-slate-500">Mohammed Ibrahim • Submitted Aug 23, 9:14 AM</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/mentor/assignments')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition"
              >
                Grade Now
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">JavaScript Quiz</h3>
                <span className="text-xs text-slate-500">Sara Kasa • Resubmitted Aug 22, 4:20 PM</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/mentor/assignments')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition"
              >
                Grade Now
              </button>
            </div>
          </div>
        </div>

        {/* Quick Navigation Shortcuts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Quick Actions
          </h2>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => navigate('/mentor/attendance')}
              className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 transition flex items-center justify-between group"
            >
              <div>
                <span className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 block">
                  Attendance Tracker
                </span>
                <span className="text-xs text-slate-500">Mark daily attendance & notes</span>
              </div>
              <span className="text-emerald-600 font-bold">→</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/mentor/progress')}
              className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 transition flex items-center justify-between group"
            >
              <div>
                <span className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-700 block">
                  Progress Tracker
                </span>
                <span className="text-xs text-slate-500">Update module status & feedback</span>
              </div>
              <span className="text-indigo-600 font-bold">→</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/mentor/assignments')}
              className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:bg-purple-50 hover:border-purple-300 transition flex items-center justify-between group"
            >
              <div>
                <span className="font-extrabold text-sm text-slate-900 group-hover:text-purple-700 block">
                  Assignments & Grading
                </span>
                <span className="text-xs text-slate-500">Create assignments & grade submissions</span>
              </div>
              <span className="text-purple-600 font-bold">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
