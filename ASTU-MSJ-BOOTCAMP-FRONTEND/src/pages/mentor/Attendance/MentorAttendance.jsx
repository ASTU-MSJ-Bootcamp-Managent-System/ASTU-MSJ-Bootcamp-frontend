import React, { useState, useEffect, useMemo } from 'react';
import {
  attendanceService,
  calculateAttendanceStats,
  BATCHES,
} from '../../../services/attendanceService';

export default function MentorAttendance() {
  const [selectedBatch, setSelectedBatch] = useState('Batch A');
  const [selectedDate, setSelectedDate] = useState('2026-08-23');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load attendance data when batch or date changes
  useEffect(() => {
    let isMounted = true;
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const data = await attendanceService.getAttendanceForDate(
          selectedBatch,
          selectedDate
        );
        if (isMounted) {
          setRecords(data);
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAttendance();

    return () => {
      isMounted = false;
    };
  }, [selectedBatch, selectedDate]);

  // Compute overall stats automatically
  const stats = useMemo(() => calculateAttendanceStats(records), [records]);

  // Filter student list by search query & status filter
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch =
        !searchQuery.trim() ||
        rec.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' ||
        rec.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [records, searchQuery, statusFilter]);

  // Handle single student status change
  const handleStatusChange = (studentId, newStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status: newStatus } : r))
    );
  };

  // Handle note change for single student
  const handleNoteChange = (studentId, newNote) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, note: newNote } : r))
    );
  };

  // Bulk actions
  const handleMarkAll = (targetStatus) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: targetStatus })));
  };

  const handleClearNotes = () => {
    setRecords((prev) => prev.map((r) => ({ ...r, note: '' })));
  };

  // Save attendance handler
  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const res = await attendanceService.saveAttendance(
        selectedBatch,
        selectedDate,
        records
      );
      setToastMessage(res.message || `Attendance saved successfully — ${records.length} students updated.`);
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Save attendance error:', err);
      setToastMessage('Failed to save attendance records.');
    } finally {
      setSaving(false);
    }
  };

  // Status badge style helper
  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          activeBtn: 'bg-emerald-600 text-white shadow-sm',
        };
      case 'Absent':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          activeBtn: 'bg-rose-600 text-white shadow-sm',
        };
      case 'Late':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          activeBtn: 'bg-amber-500 text-white shadow-sm',
        };
      case 'Excused':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          activeBtn: 'bg-blue-600 text-white shadow-sm',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          activeBtn: 'bg-slate-700 text-white shadow-sm',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-bounce-short">
          <div className="bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <p className="text-sm font-medium">{toastMessage}</p>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-3 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Attendance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage daily student attendance, record notes, and track real-time attendance statistics.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition transform active:scale-95"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Save Attendance
              </>
            )}
          </button>
        </div>
      </div>

      {/* Batch & Date Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Batch Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="batch-select" className="text-sm font-semibold text-slate-700">
              Batch:
            </label>
            <select
              id="batch-select"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-medium rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              {BATCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <label htmlFor="date-select" className="text-sm font-semibold text-slate-700">
              Date:
            </label>
            <input
              id="date-select"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-medium rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Search Students Input */}
        <div className="w-full md:w-72 relative">
          <svg
            className="w-4 h-4 absolute left-3 top-3 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Attendance Overview Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-800">{stats.total}</span>
            <span className="text-xs font-medium text-slate-400">Enrolled</span>
          </div>
        </div>

        {/* Present Card */}
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Present</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-emerald-600">{stats.present}</span>
            <span className="text-xs font-medium text-emerald-600/70">Students</span>
          </div>
        </div>

        {/* Absent Card */}
        <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Absent</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-rose-600">{stats.absent}</span>
            <span className="text-xs font-medium text-rose-600/70">Students</span>
          </div>
        </div>

        {/* Late Card */}
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Late</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-amber-600">{stats.late}</span>
            <span className="text-xs font-medium text-amber-600/70">Students</span>
          </div>
        </div>

        {/* Excused Card */}
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Excused</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-blue-600">{stats.excused}</span>
            <span className="text-xs font-medium text-blue-600/70">Students</span>
          </div>
        </div>

        {/* Attendance Rate Visual Progress Card */}
        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1 lg:col-span-1">
          <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Attendance Rate</span>
          <div className="mt-2 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-indigo-900">{stats.rate}%</span>
            </div>
            {/* Visual Bar Progress */}
            <div className="w-full bg-indigo-50 rounded-full h-2 overflow-hidden border border-indigo-100">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, stats.rate))}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Controls */}
      <div className="bg-slate-100 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600 uppercase tracking-wider">Quick Actions:</span>
          <button
            type="button"
            onClick={() => handleMarkAll('Present')}
            className="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium shadow-xs transition"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('Absent')}
            className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg font-medium shadow-xs transition"
          >
            Mark All Absent
          </button>
          <button
            type="button"
            onClick={handleClearNotes}
            className="bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg font-medium shadow-xs transition"
          >
            Clear All Notes
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
          {['All', 'Present', 'Absent', 'Late', 'Excused'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <svg className="animate-spin h-8 w-8 text-emerald-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Loading student attendance records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <p className="text-base font-semibold text-slate-700">No students match your filter.</p>
            <p className="text-xs text-slate-400">Try clearing the search or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Status (Segmented Control)</th>
                  <th className="py-3.5 px-6">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRecords.map((rec) => {
                  const colors = getStatusColor(rec.status);
                  return (
                    <tr key={rec.studentId} className="hover:bg-slate-50/80 transition">
                      {/* Student Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shadow-xs">
                            {rec.studentName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{rec.studentName}</div>
                            <div className="text-xs text-slate-400">{rec.studentEmail}</div>
                          </div>
                        </div>
                      </td>

                      {/* Status Segmented Control */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-xs">
                          {/* Present Option */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(rec.studentId, 'Present')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              rec.status === 'Present'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${rec.status === 'Present' ? 'bg-white' : 'bg-emerald-500'}`}></span>
                            Present
                          </button>

                          {/* Late Option */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(rec.studentId, 'Late')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              rec.status === 'Late'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'text-slate-600 hover:text-amber-700'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${rec.status === 'Late' ? 'bg-white' : 'bg-amber-500'}`}></span>
                            Late
                          </button>

                          {/* Absent Option */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(rec.studentId, 'Absent')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              rec.status === 'Absent'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-rose-700'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${rec.status === 'Absent' ? 'bg-white' : 'bg-rose-500'}`}></span>
                            Absent
                          </button>

                          {/* Excused Option */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(rec.studentId, 'Excused')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              rec.status === 'Excused'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-blue-700'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${rec.status === 'Excused' ? 'bg-white' : 'bg-blue-500'}`}></span>
                            Excused
                          </button>
                        </div>
                      </td>

                      {/* Note Input */}
                      <td className="py-4 px-6">
                        <input
                          type="text"
                          placeholder="Add note (e.g. Sick, 15m late)"
                          value={rec.note || ''}
                          onChange={(e) => handleNoteChange(rec.studentId, e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Summary note */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <span>Showing {filteredRecords.length} of {records.length} students</span>
        <span>Batch: <strong className="text-slate-700">{selectedBatch}</strong> | Date: <strong className="text-slate-700">{selectedDate}</strong></span>
      </div>
    </div>
  );
}
