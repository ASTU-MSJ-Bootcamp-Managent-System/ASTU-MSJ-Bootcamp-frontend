import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { attendanceService } from '../../../services/attendanceService';

export default function StudentAttendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 24, late: 2, absent: 3, excused: 1, total: 30, rate: 87 });
  const [logs, setLogs] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDateDetail, setSelectedDateDetail] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const studentName = user?.name || 'Ahmed Ali';
        const res = await attendanceService.getStudentAttendance(studentName);
        if (isMounted) {
          setStats(res.stats);
          setLogs(res.logs);
        }
      } catch (err) {
        console.error('Error fetching student attendance:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStudentData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Helper for status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return {
          badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
          dot: 'bg-emerald-500',
          calBg: 'bg-emerald-500 text-white',
        };
      case 'Absent':
        return {
          badge: 'bg-rose-100 text-rose-800 border border-rose-200',
          dot: 'bg-rose-500',
          calBg: 'bg-rose-500 text-white',
        };
      case 'Late':
        return {
          badge: 'bg-amber-100 text-amber-800 border border-amber-200',
          dot: 'bg-amber-500',
          calBg: 'bg-amber-500 text-white',
        };
      case 'Excused':
        return {
          badge: 'bg-blue-100 text-blue-800 border border-blue-200',
          dot: 'bg-blue-500',
          calBg: 'bg-blue-500 text-white',
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-800 border border-slate-200',
          dot: 'bg-slate-400',
          calBg: 'bg-slate-400 text-white',
        };
    }
  };

  // Build calendar matrix for August 2026 (Aug 1, 2026 was a Saturday)
  const augustDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDayPadding = 6; // Saturday offset (Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6)

  const findLogForDay = (dayNum) => {
    const padded = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const dateStr = `2026-08-${padded}`;
    return logs.find((l) => l.fullDate === dateStr);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Attendance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your personal attendance performance, session statistics, and history.
          </p>
        </div>

        {/* Read-only Badge & View Switcher */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Read-Only View
          </span>

          {/* View Mode Toggle */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              List View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Calendar View 📅
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <svg className="animate-spin h-8 w-8 text-emerald-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Loading your attendance summary...
        </div>
      ) : (
        <>
          {/* Top Overview Cards & Attendance Rate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Main Attendance Rate Gauge Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl"></div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance Rate</span>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-5xl font-black tracking-tight text-white">{stats.rate}%</span>
                  <span
                    className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      stats.rate >= 85
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {stats.rate >= 85 ? 'Good Standing' : 'Needs Improvement'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className="w-full bg-slate-700/60 rounded-full h-3 p-0.5 overflow-hidden border border-slate-600/50">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${Math.min(100, Math.max(0, stats.rate))}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>{stats.present} / {stats.total} sessions present</span>
                  <span>Target: 80%+</span>
                </div>
              </div>
            </div>

            {/* Breakdown Cards Grid */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Present */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Present</span>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-emerald-600">{stats.present}</span>
                  <span className="text-xs text-slate-400 block mt-0.5">sessions</span>
                </div>
              </div>

              {/* Late */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Late</span>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-amber-600">{stats.late}</span>
                  <span className="text-xs text-slate-400 block mt-0.5">sessions</span>
                </div>
              </div>

              {/* Absent */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Absent</span>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-rose-600">{stats.absent}</span>
                  <span className="text-xs text-slate-400 block mt-0.5">sessions</span>
                </div>
              </div>

              {/* Excused */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Excused</span>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-blue-600">{stats.excused}</span>
                  <span className="text-xs text-slate-400 block mt-0.5">sessions</span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA: LIST VIEW VS CALENDAR VIEW */}
          {viewMode === 'list' ? (
            /* Recent Attendance List */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Recent Attendance</h2>
                <span className="text-xs font-medium text-slate-400">Chronological Logs</span>
              </div>

              <div className="divide-y divide-slate-100">
                {logs.map((item, idx) => {
                  const colors = getStatusBadge(item.status);
                  return (
                    <div key={idx} className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition">
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <span className="font-extrabold text-slate-800 block text-sm">{item.date}</span>
                          <span className="text-xs text-slate-400 font-medium">{item.day}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {item.note && (
                          <span className="text-xs italic text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            "{item.note}"
                          </span>
                        )}

                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                          <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Interactive Calendar View (UI Enhancement) */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Attendance Calendar</h2>
                  <p className="text-xs text-slate-400">August 2026 — Click on any day to view session details</p>
                </div>

                {/* Status Legend */}
                <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Present</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Late</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Absent</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Excused</span>
                </div>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {/* Empty padding cells */}
                {Array.from({ length: startDayPadding }).map((_, i) => (
                  <div key={`pad-${i}`} className="h-14 sm:h-16 bg-slate-50/50 rounded-xl border border-dashed border-slate-100 opacity-40"></div>
                ))}

                {/* August Calendar Tiles */}
                {augustDays.map((dayNum) => {
                  const log = findLogForDay(dayNum);
                  const colors = log ? getStatusBadge(log.status) : null;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => log && setSelectedDateDetail(log)}
                      className={`h-14 sm:h-16 rounded-xl border p-2 flex flex-col justify-between text-left transition transform hover:scale-105 active:scale-95 ${
                        log
                          ? 'border-slate-200 bg-white hover:border-slate-400 shadow-xs cursor-pointer'
                          : 'border-slate-100 bg-slate-50 text-slate-400 cursor-default'
                      }`}
                    >
                      <span className="font-extrabold text-xs text-slate-700">{dayNum}</span>

                      {log && (
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate ${colors.calBg}`}>
                          {log.status}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Calendar Date Detail Modal */}
          {selectedDateDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">{selectedDateDetail.date}, 2026</h3>
                    <p className="text-xs text-slate-400">{selectedDateDetail.day} Session Log</p>
                  </div>
                  <button
                    onClick={() => setSelectedDateDetail(null)}
                    className="text-slate-400 hover:text-slate-700 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-semibold">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(selectedDateDetail.status).badge}`}>
                      {selectedDateDetail.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-semibold">Batch:</span>
                    <span className="font-bold text-slate-800">Batch A</span>
                  </div>

                  <div className="text-sm">
                    <span className="text-slate-500 font-semibold block mb-1">Mentor Note:</span>
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 italic">
                      {selectedDateDetail.note || 'No notes provided for this session.'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDateDetail(null)}
                  className="w-full py-2 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
