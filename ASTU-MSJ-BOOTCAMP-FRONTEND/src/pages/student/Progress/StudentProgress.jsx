import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { progressService, TOPICS, PROGRESS_STATUSES } from '../../../services/progressService';

export default function StudentProgress() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentProgress, setStudentProgress] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const studentId = user?.id || 101;
        const data = await progressService.getStudentProgress(studentId);
        if (isMounted) setStudentProgress(data);
      } catch (err) {
        console.error('Error fetching student progress:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const getStatusBadge = (status) => {
    const found = PROGRESS_STATUSES.find((s) => s.label === status);
    return found || PROGRESS_STATUSES[0];
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Learning Progress</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your module completion, topic mastery, and mentor feedback.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200 self-start sm:self-auto">
          🎓 Student Curriculum View
        </span>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Loading your learning progress...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Overall Progress Metric Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Curriculum Mastery</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {studentProgress?.overallProgress || 78}% <span className="text-lg font-medium text-slate-300">Complete</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-md">
                You have completed 2 out of 5 core bootcamp modules. Keep up the strong momentum!
              </p>
            </div>

            {/* Overall Progress Gauge Visual */}
            <div className="w-full md:w-64 space-y-2">
              <div className="w-full bg-slate-800 rounded-full h-4 p-0.5 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-indigo-400 h-full rounded-full transition-all duration-700 shadow-md"
                  style={{ width: `${studentProgress?.overallProgress || 78}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Frontend & Tools</span>
                <span>Backend Upcoming</span>
              </div>
            </div>
          </div>

          {/* Topics Mastery List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-900">Module & Topic Status</h2>
              <span className="text-xs font-medium text-slate-400">Bootcamp Track</span>
            </div>

            <div className="space-y-4">
              {TOPICS.map((topic) => {
                const topicData = studentProgress?.topics?.[topic.id] || { status: 'Not Started', note: '' };
                const badge = getStatusBadge(topicData.status);

                return (
                  <div
                    key={topic.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                          {topic.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base">{topic.name}</h3>
                          <span className="text-xs text-slate-400">{topic.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.bg}`}>
                          <span>{badge.symbol}</span>
                          <span>{topicData.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar for Topic */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
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

                    {/* Mentor Guidance Note Callout */}
                    {topicData.note && (
                      <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-start gap-2.5">
                        <span className="text-amber-500 font-bold text-sm">💬</span>
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Mentor Note
                          </span>
                          <p className="text-xs text-slate-700 font-medium italic mt-0.5">
                            "{topicData.note}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
