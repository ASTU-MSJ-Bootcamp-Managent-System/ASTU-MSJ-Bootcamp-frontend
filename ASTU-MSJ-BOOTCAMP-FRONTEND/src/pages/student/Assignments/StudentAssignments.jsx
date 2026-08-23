import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { assignmentService } from '../../../services/assignmentService';
import { submissionService, SUBMISSION_STATUS_CONFIG } from '../../../services/submissionService';

export default function StudentAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected assignment for view / submission modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [studentSubmission, setStudentSubmission] = useState(null);

  // Submission Form State
  const [githubUrl, setGithubUrl] = useState('https://github.com/ahmedali/react-todo-app');
  const [liveDemoUrl, setLiveDemoUrl] = useState('https://ahmed-todo.vercel.app');
  const [notes, setNotes] = useState('Implemented all required features: component hierarchy, state hooks, and delete functionality.');
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentId = user?.id || 101;
        const [assignList, subList] = await Promise.all([
          assignmentService.getAssignments('Batch A'),
          submissionService.getStudentSubmissions(studentId),
        ]);

        if (isMounted) {
          setAssignments(assignList);
          setSubmissions(subList);
        }
      } catch (err) {
        console.error('Error fetching student assignments:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleOpenAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    const sub = submissions.find((s) => String(s.assignmentId) === String(assignment.id));
    setStudentSubmission(sub || null);

    if (sub) {
      setGithubUrl(sub.githubUrl || '');
      setLiveDemoUrl(sub.liveDemoUrl || '');
      setNotes(sub.notes || '');
    } else {
      setGithubUrl('');
      setLiveDemoUrl('');
      setNotes('');
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!githubUrl.trim() || !selectedAssignment) return;
    setSubmitting(true);

    try {
      const res = await submissionService.submitAssignment({
        assignmentId: selectedAssignment.id,
        assignmentTitle: selectedAssignment.title,
        maxScore: selectedAssignment.maxScore,
        studentId: user?.id || 101,
        studentName: user?.name || 'Ahmed Ali',
        studentEmail: user?.email || 'ahmed.ali@example.com',
        githubUrl,
        liveDemoUrl,
        notes,
      });

      // Update submissions state
      setSubmissions((prev) => {
        const filtered = prev.filter((s) => String(s.assignmentId) !== String(selectedAssignment.id));
        return [res.data, ...filtered];
      });

      setStudentSubmission(res.data);
      setToastMsg('Assignment submitted successfully!');
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err) {
      console.error('Error submitting assignment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (assignmentId) => {
    const sub = submissions.find((s) => String(s.assignmentId) === String(assignmentId));
    if (!sub) return SUBMISSION_STATUS_CONFIG['Not Submitted'];
    return SUBMISSION_STATUS_CONFIG[sub.status] || SUBMISSION_STATUS_CONFIG['Submitted'];
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 animate-bounce-short">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assignments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Submit GitHub repositories, live demo links, and review mentor feedback & grades.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200 self-start sm:self-auto">
          💻 Course Submissions
        </span>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Loading course assignments...
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const sub = submissions.find((s) => String(s.assignmentId) === String(assignment.id));
            const statusCfg = getStatusBadge(assignment.id);

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-indigo-200 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xl">{assignment.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-slate-400 font-medium">Batch A</span>
                      <span className="text-rose-600 font-bold">Due {assignment.deadlineFormatted}</span>
                      <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {assignment.maxScore} Points
                      </span>
                    </div>
                  </div>

                  {/* Submission Status Badge */}
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${statusCfg.bg}`}>
                      <span>{statusCfg.symbol}</span>
                      <span>{sub ? sub.status : 'Not Submitted'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenAssignment(assignment)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition"
                    >
                      {sub ? 'View / Resubmit' : 'Submit Assignment'}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{assignment.description}</p>

                {/* Display Grade Summary if Graded */}
                {sub && sub.status === 'Graded' && (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                        ✓ Graded Score
                      </span>
                      <span className="text-2xl font-black text-emerald-700">
                        {sub.score} / {assignment.maxScore} ({sub.percentage}%)
                      </span>
                    </div>
                    {sub.feedback && (
                      <div className="max-w-md text-right">
                        <span className="text-[11px] font-bold text-emerald-700 block">Mentor Feedback:</span>
                        <p className="text-xs text-emerald-900 italic">"{sub.feedback}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SUBMISSION & DETAILS MODAL */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8 animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-xl">{selectedAssignment.title}</h3>
                <p className="text-xs text-indigo-600 font-bold mt-0.5">
                  {selectedAssignment.maxScore} Points | Due {selectedAssignment.deadlineFormatted}
                </p>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Description & Instructions */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Description
                </span>
                <p className="text-xs text-slate-700">{selectedAssignment.description}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Instructions
                </span>
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans font-medium">
                  {selectedAssignment.instructions}
                </pre>
              </div>
            </div>

            {/* If Graded: Show Grade Card */}
            {studentSubmission && studentSubmission.status === 'Graded' && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Graded Result
                  </span>
                  <span className="text-xs font-bold text-emerald-600">✓ Complete</span>
                </div>
                <div className="text-3xl font-black text-emerald-700">
                  {studentSubmission.score} / {selectedAssignment.maxScore} ({studentSubmission.percentage}%)
                </div>
                {studentSubmission.feedback && (
                  <div>
                    <span className="text-xs font-bold text-emerald-800 block">Mentor Feedback:</span>
                    <p className="text-xs text-emerald-950 italic bg-white p-2.5 rounded-lg border border-emerald-200 mt-1">
                      "{studentSubmission.feedback}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Submission Form */}
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-t border-slate-100 pt-3">
                {studentSubmission ? 'Update Your Submission' : 'Submit Project Links'}
              </span>

              {/* GitHub Repo */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  GitHub Repository URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/username/repository"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Live Demo */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Live Demo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://my-app.vercel.app"
                  value={liveDemoUrl}
                  onChange={(e) => setLiveDemoUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Notes / Explanation
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your implementation details or notes for the mentor..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
