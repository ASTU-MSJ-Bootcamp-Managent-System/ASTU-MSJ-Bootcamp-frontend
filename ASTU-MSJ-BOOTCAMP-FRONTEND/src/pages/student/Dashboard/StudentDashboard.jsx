import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { attendanceService } from '../../../services/attendanceService';
import { progressService } from '../../../services/progressService';
import { submissionService } from '../../../services/submissionService';
import { announcementService } from '../../../services/announcementService';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [attendanceRate, setAttendanceRate] = useState(87);
  const [progressRate, setProgressRate] = useState(78);
  const [avgGrade, setAvgGrade] = useState(84);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const studentId = user?.id || 101;
        const studentName = user?.name || 'Ahmed Ali';

        const [attData, progData, subData, annData] = await Promise.all([
          attendanceService.getStudentAttendance(studentName),
          progressService.getStudentProgress(studentId),
          submissionService.getStudentSubmissions(studentId),
          announcementService.getAnnouncements(),
        ]);

        if (isMounted) {
          setAttendanceRate(attData.stats.rate || 87);
          setProgressRate(progData?.overallProgress || 78);
          setAnnouncements(annData);

          // Calculate average grade score percentage
          const gradedSubs = subData.filter((s) => s.percentage !== null);
          if (gradedSubs.length) {
            const avg = Math.round(
              gradedSubs.reduce((acc, curr) => acc + curr.percentage, 0) / gradedSubs.length
            );
            setAvgGrade(avg);
          } else {
            setAvgGrade(84);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const studentName = user?.name || 'Ahmed';

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Good morning, {studentName} 👋
          </h1>
          <p className="text-sm text-indigo-200 mt-1">
            Welcome to your ASTU MSJ Bootcamp student academic journey dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/student/assignments')}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
        >
          Submit Assignment
        </button>
      </div>

      {/* TOP 3 SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Attendance Card */}
        <div
          onClick={() => navigate('/student/attendance')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md cursor-pointer transition flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Attendance
            </span>
            <span className="text-4xl font-black text-slate-900 mt-1 block">{attendanceRate}%</span>
            <span className="text-xs text-emerald-600 font-semibold mt-1 block">🟢 Good Standing</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            📅
          </div>
        </div>

        {/* Progress Card */}
        <div
          onClick={() => navigate('/student/progress')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md cursor-pointer transition flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Learning Progress
            </span>
            <span className="text-4xl font-black text-indigo-600 mt-1 block">{progressRate}%</span>
            <span className="text-xs text-indigo-600 font-semibold mt-1 block">2/5 Modules Done</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            🚀
          </div>
        </div>

        {/* Avg Grade Card */}
        <div
          onClick={() => navigate('/student/assignments')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-200 hover:shadow-md cursor-pointer transition flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Avg Grade
            </span>
            <span className="text-4xl font-black text-purple-600 mt-1 block">{avgGrade}%</span>
            <span className="text-xs text-purple-600 font-semibold mt-1 block">Grade A Average</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
            ⭐
          </div>
        </div>
      </div>

      {/* DASHBOARD WIDGETS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900">Upcoming Assignments</h2>
            <button
              onClick={() => navigate('/student/assignments')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-200 bg-slate-50/60 flex items-center justify-between transition">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">React Todo App</h3>
                <span className="text-xs text-slate-500">Max 20 pts | Component state</span>
              </div>
              <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                Due Tomorrow
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-200 bg-slate-50/60 flex items-center justify-between transition">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Node API Server</h3>
                <span className="text-xs text-slate-500">Max 25 pts | Express REST</span>
              </div>
              <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                Due Aug 28
              </span>
            </div>
          </div>
        </div>

        {/* Recent Grades Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900">Recent Grades</h2>
            <button
              onClick={() => navigate('/student/assignments')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              View Details →
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-emerald-50/50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">React Todo App</h3>
                <span className="text-xs text-emerald-700 italic">"Good component structure."</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-emerald-700 block">17 / 20</span>
                <span className="text-[10px] font-bold text-emerald-600">85% Graded</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-emerald-50/50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">JavaScript Quiz</h3>
                <span className="text-xs text-emerald-700 italic">"Great DOM event handling."</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-emerald-700 block">18 / 20</span>
                <span className="text-[10px] font-bold text-emerald-600">90% Graded</span>
              </div>
            </div>
          </div>
        </div>

        {/* Module Progress Summary Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900">Module Progress Summary</h2>
            <button
              onClick={() => navigate('/student/progress')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Full Tracker →
            </button>
          </div>

          <div className="space-y-2.5 text-xs font-bold">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-800">HTML / CSS</span>
              <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ✓ Completed
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-800">JavaScript</span>
              <span className="text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                ◐ In Progress
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-800">React</span>
              <span className="text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                ◐ In Progress
              </span>
            </div>
          </div>
        </div>

        {/* Recent Announcements Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900">Recent Announcements</h2>
            <span className="text-xs text-slate-400 font-medium">Live Feed</span>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-xs">{ann.title}</span>
                  <span className="text-[10px] text-slate-400">{ann.timeAgo}</span>
                </div>
                <p className="text-xs text-slate-600">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
