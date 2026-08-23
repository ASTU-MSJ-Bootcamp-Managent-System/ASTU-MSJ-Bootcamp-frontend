import React, { useState, useEffect } from 'react';
import { assignmentService } from '../../../services/assignmentService';
import { submissionService, SUBMISSION_STATUS_CONFIG } from '../../../services/submissionService';
import { BATCHES } from '../../../services/attendanceService';

export default function MentorAssignments() {
  const [selectedBatch, setSelectedBatch] = useState('Batch A');
  const [assignments, setAssignments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Create Assignment Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBatch, setNewBatch] = useState('Batch A');
  const [newDescription, setNewDescription] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newDeadline, setNewDeadline] = useState('2026-08-25T23:59');
  const [newMaxScore, setNewMaxScore] = useState(20);
  const [creating, setCreating] = useState(false);

  // Grading Screen Modal state
  const [gradingAssignment, setGradingAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [scoreInput, setScoreInput] = useState(17);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [gradingLoading, setGradingLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const data = await assignmentService.getAssignments(selectedBatch);
        if (isMounted) setAssignments(data);
      } catch (err) {
        console.error('Error fetching assignments:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAssignments();

    return () => {
      isMounted = false;
    };
  }, [selectedBatch]);

  // Open Create Assignment Modal
  const handleOpenCreateModal = () => {
    setNewTitle('');
    setNewBatch(selectedBatch);
    setNewDescription('');
    setNewInstructions('');
    setNewDeadline('2026-08-25T23:59');
    setNewMaxScore(20);
    setIsCreateModalOpen(true);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);

    try {
      const res = await assignmentService.createAssignment({
        title: newTitle,
        batch: newBatch,
        description: newDescription,
        instructions: newInstructions,
        deadline: newDeadline,
        maxScore: Number(newMaxScore),
      });

      setAssignments((prev) => [res.data, ...prev]);
      setIsCreateModalOpen(false);
      setToastMsg('Assignment created successfully!');
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err) {
      console.error('Error creating assignment:', err);
    } finally {
      setCreating(false);
    }
  };

  // Open Grading Drawer / Screen for an Assignment
  const handleOpenGrading = async (assignment) => {
    setGradingAssignment(assignment);
    setGradingLoading(true);
    try {
      const subs = await submissionService.getSubmissionsByAssignment(assignment.id);
      setSubmissions(subs);
      if (subs.length > 0) {
        const first = subs[0];
        setSelectedSubmission(first);
        setScoreInput(first.score !== null ? first.score : 17);
        setFeedbackInput(first.feedback || 'Good component structure. Improve state management and validation for empty todos.');
      } else {
        setSelectedSubmission(null);
      }
    } catch (err) {
      console.error('Error loading submissions:', err);
    } finally {
      setGradingLoading(false);
    }
  };

  const handleSelectSubmissionToGrade = (sub) => {
    setSelectedSubmission(sub);
    setScoreInput(sub.score !== null ? sub.score : 17);
    setFeedbackInput(sub.feedback || (sub.status === 'Graded' ? '' : 'Good component structure. Improve state management and validation for empty todos.'));
  };

  const handleSaveGrade = async (isResubmissionRequest = false) => {
    if (!selectedSubmission) return;

    try {
      const res = await submissionService.gradeSubmission(
        selectedSubmission.id,
        scoreInput,
        feedbackInput,
        isResubmissionRequest
      );

      // Update submissions list locally
      setSubmissions((prev) =>
        prev.map((s) => (s.id === selectedSubmission.id ? res.data : s))
      );
      setSelectedSubmission(res.data);

      setToastMsg(res.message);
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err) {
      console.error('Error grading submission:', err);
    }
  };

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Toast Notification Banner */}
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assignments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create assignments, track student submission status, review submissions, and provide scores & feedback.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md transition transform active:scale-95 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          + Create Assignment
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="assign-batch" className="text-sm font-semibold text-slate-700">
            Batch:
          </label>
          <select
            id="assign-batch"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {BATCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <svg
            className="w-4 h-4 absolute left-3 top-3 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Assignments List Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading assignments...
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          No assignments found matching your filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAssignments.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-indigo-200 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">{a.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {a.batch}
                      </span>
                      <span className="text-xs text-rose-600 font-semibold">
                        Due: {a.deadlineFormatted || 'Aug 25'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                    Max: {a.maxScore} pts
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mt-3">{a.description}</p>
              </div>

              {/* Status Indicators Bar */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                    28 Submitted
                  </span>
                  <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                    5 Pending
                  </span>
                  <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
                    2 Resubmission
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenGrading(a)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition"
                >
                  View & Grade
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateAssignment}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg">Create Assignment</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Title
              </label>
              <input
                type="text"
                required
                placeholder="React Todo Application"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Batch & Max Score */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Batch
                </label>
                <select
                  value={newBatch}
                  onChange={(e) => setNewBatch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {BATCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Maximum Score
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newMaxScore}
                  onChange={(e) => setNewMaxScore(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Build a Todo application using React..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              ></textarea>
            </div>

            {/* Instructions */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Instructions
              </label>
              <textarea
                rows={3}
                placeholder="1. Use React components&#10;2. Add / delete todos"
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              ></textarea>
            </div>

            {/* Deadline */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Deadline
              </label>
              <input
                type="datetime-local"
                required
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                {creating ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MENTOR GRADING SCREEN MODAL */}
      {gradingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-xl">{gradingAssignment.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Batch: {gradingAssignment.batch} | Max Score: {gradingAssignment.maxScore} pts
                </p>
              </div>
              <button
                onClick={() => setGradingAssignment(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Content Body: Submissions Sidebar + Grading Form */}
            {gradingLoading ? (
              <div className="p-12 text-center text-slate-500">Loading student submissions...</div>
            ) : submissions.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No student submissions recorded yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Submissions List */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2 max-h-[420px] overflow-y-auto">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Student Submissions ({submissions.length})
                  </span>
                  {submissions.map((sub) => {
                    const statusCfg = SUBMISSION_STATUS_CONFIG[sub.status] || SUBMISSION_STATUS_CONFIG['Submitted'];
                    const isSelected = selectedSubmission?.id === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSelectSubmissionToGrade(sub)}
                        className={`w-full text-left p-3 rounded-xl border transition ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-extrabold text-sm">{sub.studentName}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isSelected ? 'bg-slate-800 text-slate-200' : statusCfg.bg}`}>
                            {statusCfg.symbol} {sub.status}
                          </span>
                          {sub.score !== null && (
                            <span className="text-xs font-bold text-emerald-400">
                              {sub.score}/{sub.maxScore} ({sub.percentage}%)
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Grading Panel */}
                {selectedSubmission ? (
                  <div className="md:col-span-2 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-base">
                          Student: {selectedSubmission.studentName}
                        </span>
                        <span className="text-xs text-slate-400">
                          Submitted: {selectedSubmission.submittedAtFormatted}
                        </span>
                      </div>

                      {/* Links */}
                      <div className="flex flex-wrap items-center gap-3">
                        {selectedSubmission.githubUrl && (
                          <a
                            href={selectedSubmission.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                          >
                            GitHub Repository ↗
                          </a>
                        )}
                        {selectedSubmission.liveDemoUrl && (
                          <a
                            href={selectedSubmission.liveDemoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                          >
                            Live Demo ↗
                          </a>
                        )}
                      </div>

                      {/* Notes */}
                      {selectedSubmission.notes && (
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Student Notes:
                          </span>
                          <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 italic">
                            "{selectedSubmission.notes}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Grade Form */}
                    <div className="space-y-4 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-4">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Score:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={gradingAssignment.maxScore}
                            value={scoreInput}
                            onChange={(e) => setScoreInput(e.target.value)}
                            className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-black text-center focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-sm font-bold text-slate-500">
                            / {gradingAssignment.maxScore} (
                            {scoreInput ? Math.round((scoreInput / gradingAssignment.maxScore) * 100) : 0}%)
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Feedback:
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Good component structure. Improve state management and validation for empty todos."
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                        ></textarea>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleSaveGrade(true)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition"
                        >
                          Request Resubmission
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveGrade(false)}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                        >
                          Save Grade
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-2 text-center py-12 text-slate-400">
                    Select a student submission to view details & grade.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
