import React, { useState, useEffect } from 'react';
import { progressService, TOPICS, PROGRESS_STATUSES } from '../../../services/progressService';
import { BATCHES } from '../../../services/attendanceService';

export default function MentorProgress() {
  const [selectedBatch, setSelectedBatch] = useState('Batch A');
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected student & topic state for editing drawer/modal
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState('react');
  const [selectedStatus, setSelectedStatus] = useState('In Progress');
  const [progressNote, setProgressNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const data = await progressService.getAllProgress(selectedBatch);
        if (isMounted) setStudentsProgress(data);
      } catch (err) {
        console.error('Error fetching progress:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, [selectedBatch]);

  const handleOpenEditModal = (student, topicId = 'react') => {
    setEditingStudent(student);
    setSelectedTopicId(topicId);
    const topicData = student.topics?.[topicId] || { status: 'Not Started', note: '' };
    setSelectedStatus(topicData.status || 'Not Started');
    setProgressNote(topicData.note || '');
  };

  const handleTopicChangeInModal = (topicId) => {
    setSelectedTopicId(topicId);
    if (editingStudent) {
      const topicData = editingStudent.topics?.[topicId] || { status: 'Not Started', note: '' };
      setSelectedStatus(topicData.status || 'Not Started');
      setProgressNote(topicData.note || '');
    }
  };

  const handleSaveProgress = async () => {
    if (!editingStudent) return;
    setSaving(true);
    try {
      const res = await progressService.updateTopicProgress(
        editingStudent.studentId,
        selectedTopicId,
        selectedStatus,
        progressNote
      );

      // Update local state
      setStudentsProgress((prev) =>
        prev.map((s) => (s.studentId === editingStudent.studentId ? res.data : s))
      );

      setToastMsg(`Progress updated for ${editingStudent.studentName}!`);
      setTimeout(() => setToastMsg(null), 4000);
      setEditingStudent(null);
    } catch (err) {
      console.error('Error saving progress:', err);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = PROGRESS_STATUSES.find((s) => s.label === status);
    return config || PROGRESS_STATUSES[0];
  };

  const filteredStudents = studentsProgress.filter((s) =>
    s.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Notification Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 animate-bounce-short">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Progress Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track student topic mastery, update weekly progress, and leave targeted notes.
          </p>
        </div>

        {/* Batch Selector & Search */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="progress-batch" className="text-sm font-semibold text-slate-700">
              Batch:
            </label>
            <select
              id="progress-batch"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
            >
              {BATCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-48 sm:w-64">
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <svg
              className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Student Progress List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading student progress records...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          No students found matching your search.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((st) => (
            <div
              key={st.studentId}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition space-y-4"
            >
              {/* Student Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {st.studentName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{st.studentName}</h3>
                    <span className="text-xs text-slate-400">{st.batch}</span>
                  </div>
                </div>

                {/* Overall Progress Progress Bar */}
                <div className="flex items-center gap-4 sm:w-80">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Overall Progress</span>
                      <span className="text-emerald-600">{st.overallProgress || 78}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${st.overallProgress || 78}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(st)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition"
                  >
                    Update Progress
                  </button>
                </div>
              </div>

              {/* Topics Breakdown List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {TOPICS.map((topic) => {
                  const topicData = st.topics?.[topic.id] || { status: 'Not Started', percentage: 0 };
                  const badge = getStatusBadge(topicData.status);

                  return (
                    <div
                      key={topic.id}
                      onClick={() => handleOpenEditModal(st, topic.id)}
                      className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 p-3 rounded-xl cursor-pointer transition flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">{topic.name}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.symbol} {topicData.status}
                        </span>
                      </div>

                      {/* Topic Visual Bar */}
                      <div className="space-y-1">
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              topicData.status === 'Completed'
                                ? 'bg-emerald-500'
                                : topicData.status === 'In Progress'
                                ? 'bg-amber-500'
                                : topicData.status === 'Needs Improvement'
                                ? 'bg-rose-500'
                                : 'bg-slate-300'
                            }`}
                            style={{
                              width: `${
                                topicData.status === 'Completed'
                                  ? 100
                                  : topicData.status === 'In Progress'
                                  ? 70
                                  : topicData.status === 'Needs Improvement'
                                  ? 40
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Mentor Note Snippet if exists */}
                      {topicData.note && (
                        <p className="text-[11px] text-slate-500 italic truncate border-t border-slate-200/60 pt-1">
                          "{topicData.note}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDITING PROGRESS DRAWER / MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">{editingStudent.studentName}</h3>
                <span className="text-xs text-slate-400">Update Topic Progress & Mentor Notes</span>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Topic Select Tabs */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Select Topic:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTopicChangeInModal(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedTopicId === t.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Selection Buttons */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Status:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PROGRESS_STATUSES.map((st) => (
                  <button
                    key={st.label}
                    type="button"
                    onClick={() => setSelectedStatus(st.label)}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition flex items-center justify-center gap-1.5 ${
                      selectedStatus === st.label
                        ? `${st.bg} ring-2 ring-slate-900 shadow-xs`
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{st.symbol}</span>
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Note Textarea */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Progress Note:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Understands components but needs improvement with state management."
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-slate-900 focus:bg-white focus:outline-none"
              ></textarea>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProgress}
                disabled={saving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                {saving ? 'Saving...' : 'Save Progress'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
