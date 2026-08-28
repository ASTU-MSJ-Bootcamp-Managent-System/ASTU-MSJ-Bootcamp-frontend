import { useState } from "react";
import { FileText, Send, Star } from "lucide-react";
import { Toolbar, Modal } from "../components/Shared";
import {
  createAssignment as apiCreateAssignment,
  createSubmission as apiCreateSubmission,
  gradeSubmission as apiGradeSubmission,
} from "../../api/client";

export default function Assignments({
  role,
  me,
  token,
  assignments,
  setAssignments,
  submissions,
  setSubmissions,
  people,
  batches,
  refresh,
}) {
  const [create, setCreate] = useState(false);
  const [submit, setSubmit] = useState(null);
  const [review, setReview] = useState(null);
  const [saving, setSaving] = useState(false);

  /* Student's own batch for filtering assignments */
  const myBatchId =
    role === "student"
      ? people.find((p) => p._id === me?._id)?.batchId || batches[0]?._id
      : null;

  /* ── Create assignment (mentor/admin) ─────────────────────────────── */
  async function publish(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    try {
      const batchId = f.get("batch") || batches[0]?._id;
      await apiCreateAssignment(token, {
        title: f.get("title"),
        description: f.get("description") || "",
        instructions: f.get("instructions") || "",
        batch: batchId,
        deadline: new Date(f.get("deadline")).toISOString(),
        maximumScore: +f.get("max") || 100,
      });
      await refresh();
      setCreate(false);
    } catch (err) {
      alert(err.message || "Failed to create assignment.");
    } finally {
      setSaving(false);
    }
  }

  /* ── Submit work (student) ────────────────────────────────────────── */
  async function send(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await apiCreateSubmission(token, {
        assignment: submit,
        githubUrl: f.get("repo"),
        liveDemoUrl: f.get("demo") || "",
        notes: f.get("note") || "",
      });
      await refresh();
      setSubmit(null);
    } catch (err) {
      alert(err.message || "Failed to submit.");
    } finally {
      setSaving(false);
    }
  }

  /* ── Grade submission (mentor/admin) ──────────────────────────────── */
  async function grade(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const score = Number(f.get("grade"));
    const max = review.maximumScore || 100;
    if (Number.isNaN(score) || score < 0 || score > max) {
      alert(`Score must be between 0 and ${max}.`);
      return;
    }
    const feedbackText = (f.get("feedback") || "").trim();
    if (!feedbackText) {
      alert("Please enter feedback before publishing.");
      return;
    }
    if (!review.subId) {
      alert("Could not identify the submission to grade. Please refresh and try again.");
      return;
    }
    setSaving(true);
    try {
      await apiGradeSubmission(token, review.subId, {
        grade: score,
        feedback: feedbackText,
      });
      await refresh();
      setReview(null);
    } catch (err) {
      alert(err.message || "Failed to grade.");
    } finally {
      setSaving(false);
    }
  }

  /* ── Filter assignments for students to their batch ─────────────── */
  const filtered =
    role === "student" && myBatchId
      ? assignments.filter((a) => a.batch === myBatchId)
      : assignments;

  return (
    <section className="panel work-panel">
      <Toolbar
        title={role === "student" ? "My assignments" : "Assignments"}
        action={role === "student" ? null : "Create assignment"}
        onAction={() => setCreate(true)}
      />
      {filtered.length === 0 ? (
        <p className="empty-state">
          {role === "student"
            ? "No assignments for your batch yet."
            : "No assignments yet."}
        </p>
      ) : (
        filtered.map((a) => {
          const mySub = submissions.find(
            (s) => s.assignmentId === a._id,
          );
          const pendingSubs =
            role !== "student"
              ? submissions.filter(
                  (s) => s.assignmentId === a._id && s.grade == null,
                )
              : [];

          return (
            <article className="assignment" key={a._id}>
              <div className="assign-icon">
                <FileText />
              </div>
              <div className="flex-1">
                <b>{a.title}</b>
                {a.description && (
                  <p className="text-xs text-slate-400">{a.description}</p>
                )}
                <p>
                  Due{" "}
                  {a.deadline
                    ? new Date(a.deadline).toLocaleDateString()
                    : "No deadline"}{" "}
                  · {a.maximumScore} points
                </p>
                {mySub?.grade != null && (
                  <small className="feedback">
                    Grade {mySub.grade}/{a.maximumScore} · {mySub.feedback}
                  </small>
                )}
              </div>
              {role === "student" ? (
                <span
                  className={
                    "status " +
                    (mySub?.grade != null
                      ? "green"
                      : mySub
                        ? "amber"
                        : "amber")
                  }
                >
                  {mySub
                    ? mySub.grade != null
                      ? "Graded"
                      : "Submitted"
                    : "Not submitted"}
                </span>
              ) : (
                <span
                  className={
                    "status " +
                    (pendingSubs.length > 0 ? "amber" : "green")
                  }
                >
                  {pendingSubs.length > 0
                    ? `${pendingSubs.length} pending`
                    : "No submissions"}
                </span>
              )}
              {role === "student" && !mySub && (
                <button
                  className="outline"
                  onClick={() => setSubmit(a._id)}
                >
                  Submit work
                </button>
              )}
              {role !== "student" && pendingSubs.length > 0 && (
                <button
                  className="outline"
                  onClick={() =>
                    setReview({
                      subId: pendingSubs[0]._id,
                      studentName:
                        people.find(
                          (p) => p._id === pendingSubs[0].studentId,
                        )?.name || "Student",
                      maximumScore: a.maximumScore || 100,
                    })
                  }
                >
                  Review & grade
                </button>
              )}
            </article>
          );
        })
      )}

      {/* ── Create modal ─────────────────────────────────────────────── */}
      {create && (
        <Modal title="Create assignment" close={() => setCreate(false)}>
          <form className="stack-form" onSubmit={publish}>
            <label>
              Title
              <input name="title" required />
            </label>
            <label>
              Description
              <textarea name="description" />
            </label>
            <label>
              Instructions
              <textarea name="instructions" />
            </label>
            <label>
              Batch
              <select name="batch" required>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Deadline
              <input name="deadline" type="date" required />
            </label>
            <label>
              Maximum score
              <input name="max" type="number" defaultValue="100" required />
            </label>
            <button className="primary" disabled={saving}>
              {saving ? "Publishing…" : "Publish assignment"}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Submit modal ─────────────────────────────────────────────── */}
      {submit && (
        <Modal title="Submit your work" close={() => setSubmit(null)}>
          <form className="stack-form" onSubmit={send}>
            <label>
              GitHub repository URL
              <input
                name="repo"
                type="url"
                required
                placeholder="https://github.com/..."
              />
            </label>
            <label>
              Live demo URL (optional)
              <input
                name="demo"
                type="url"
                placeholder="https://..."
              />
            </label>
            <label>
              Submission notes
              <textarea name="note" />
            </label>
            <button className="primary" disabled={saving}>
              <Send size={16} />
              {saving ? "Submitting…" : "Submit assignment"}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Grade modal ──────────────────────────────────────────────── */}
      {review && (
        <Modal title="Review submission" close={() => setReview(null)}>
          <form className="stack-form" onSubmit={grade}>
            <p className="muted-copy text-sm text-slate-500">
              Student: {review.studentName}
            </p>
            <label>
              Score
              <input
                name="grade"
                type="number"
                min="0"
                max={review.maximumScore || 100}
                step="1"
                placeholder={`0 – ${review.maximumScore || 100}`}
                required
              />
            </label>
            <label>
              Feedback
              <textarea
                name="feedback"
                placeholder="Enter detailed feedback…"
                required
              />
            </label>
            <button className="primary" disabled={saving}>
              <Star size={16} />
              {saving ? "Saving…" : "Publish grade & feedback"}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
