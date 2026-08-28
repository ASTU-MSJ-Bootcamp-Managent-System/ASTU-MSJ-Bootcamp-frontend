import { useState } from "react";
import { FileText, Send, Star, Edit3, Trash2, RefreshCw } from "lucide-react";
import { Toolbar, Modal } from "../components/Shared";
import {
  createAssignment as apiCreateAssignment,
  updateAssignment as apiUpdateAssignment,
  deleteAssignment as apiDeleteAssignment,
  createSubmission as apiCreateSubmission,
  gradeSubmission as apiGradeSubmission,
  resubmitSubmission as apiResubmitSubmission,
  requestResubmission as apiRequestResubmission,
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
  const [editItem, setEditItem] = useState(null);
  const [submit, setSubmit] = useState(null);
  const [resubmitItem, setResubmitItem] = useState(null);
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

  /* ── Update assignment (mentor/admin) ─────────────────────────────── */
  async function updateAssignment(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await apiUpdateAssignment(token, editItem._id, {
        title: f.get("title"),
        description: f.get("description") || "",
        instructions: f.get("instructions") || "",
        deadline: new Date(f.get("deadline")).toISOString(),
        maximumScore: +f.get("max") || 100,
      });
      await refresh();
      setEditItem(null);
    } catch (err) {
      alert(err.message || "Failed to update assignment.");
    } finally {
      setSaving(false);
    }
  }

  /* ── Delete assignment (mentor/admin) ─────────────────────────────── */
  async function deleteAssignment(id) {
    try {
      await apiDeleteAssignment(token, id);
      await refresh();
    } catch (err) {
      alert(err.message || "Failed to delete assignment.");
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

  /* ── Resubmit work (student) ─────────────────────────────────────── */
  async function doResubmit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await apiResubmitSubmission(token, resubmitItem._id, {
        githubUrl: f.get("repo"),
        liveDemoUrl: f.get("demo") || "",
        notes: f.get("note") || "",
      });
      await refresh();
      setResubmitItem(null);
    } catch (err) {
      alert(err.message || "Failed to resubmit.");
    } finally {
      setSaving(false);
    }
  }

  /* ── Request resubmission (mentor) ────────────────────────────────── */
  async function doRequestResubmission(submissionId) {
    try {
      await apiRequestResubmission(token, submissionId);
      await refresh();
    } catch (err) {
      alert(err.message || "Failed to request resubmission.");
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
        score: score,
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

  const isAdmin = role === "admin";

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
          const allSubsForAssignment = submissions.filter(
            (s) => s.assignmentId === a._id,
          );
          const pendingSubs =
            role !== "student"
              ? allSubsForAssignment.filter(
                  (s) => (s.grade ?? s.score) == null && s.status !== "RESUBMISSION_REQUESTED",
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
                {a.instructions && (
                  <p className="mt-1 text-xs text-slate-500 italic">
                    Instructions: {a.instructions}
                  </p>
                )}
                {role === "student" && mySub?.status === "RESUBMISSION_REQUESTED" && (
                  <small className="mt-1 block font-semibold text-amber-600">
                    ⚠ Resubmission requested. Please update your work and resubmit.
                  </small>
                )}
                {role === "student" && (mySub?.grade ?? mySub?.score) != null && (
                  <small className="feedback">
                    Grade {mySub.grade ?? mySub.score}/{a.maximumScore} · {mySub.feedback}
                  </small>
                )}
                {role !== "student" && mySub && (
                  <div className="mt-1 text-xs text-slate-500">
                    <span className="font-medium">Submission status:</span>{" "}
                    <span className={
                      "status " + (
                        mySub.status === "GRADED" ? "green" :
                        mySub.status === "RESUBMISSION_REQUESTED" ? "amber" :
                        "blue"
                      )
                    }>
                      {mySub.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                )}
              </div>

              {role === "student" ? (
                <span
                  className={
                    "status " +
                    ((mySub?.grade ?? mySub?.score) != null
                      ? "green"
                      : mySub
                        ? "amber"
                        : "amber")
                  }
                >
                  {mySub
                    ? (mySub.grade ?? mySub.score) != null
                      ? "Graded"
                      : mySub.status === "RESUBMISSION_REQUESTED"
                        ? "Resubmit needed"
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
                    : allSubsForAssignment.length > 0
                      ? `${allSubsForAssignment.length} submitted`
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

              {role === "student" && mySub?.status === "RESUBMISSION_REQUESTED" && (
                <button
                  className="outline"
                  onClick={() => setResubmitItem(mySub)}
                >
                  <RefreshCw size={14} className="mr-1 inline" />
                  Resubmit
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

              {isAdmin && (
                <div className="ml-2 flex items-center gap-1">
                  <button
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                    onClick={() => setEditItem(a)}
                    title="Edit assignment"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                    onClick={() => {
                      if (confirm("Delete this assignment?")) deleteAssignment(a._id);
                    }}
                    title="Delete assignment"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              {/* Mentor can request resubmission for graded/submitted submissions */}
              {role === "mentor" && allSubsForAssignment.length > 0 && (
                <div className="ml-2 flex flex-col gap-1">
                  {allSubsForAssignment
                    .filter(
                      (s) =>
                        s.status === "GRADED" || s.status === "SUBMITTED" || s.status === "RESUBMITTED",
                    )
                    .slice(0, 2)
                    .map((s) => (
                      <button
                        key={s._id}
                        className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-100"
                        onClick={() => {
                          const stuName = people.find((p) => p._id === s.studentId)?.name || "Student";
                          if (confirm(`Request resubmission from ${stuName}?`)) {
                            doRequestResubmission(s._id);
                          }
                        }}
                        title="Request resubmission"
                      >
                        Request resubmit
                      </button>
                    ))}
                </div>
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

      {/* ── Edit modal ─────────────────────────────────────────────── */}
      {editItem && (
        <Modal title="Edit assignment" close={() => setEditItem(null)}>
          <form className="stack-form" onSubmit={updateAssignment}>
            <label>
              Title
              <input name="title" defaultValue={editItem.title} required />
            </label>
            <label>
              Description
              <textarea name="description" defaultValue={editItem.description} />
            </label>
            <label>
              Instructions
              <textarea name="instructions" defaultValue={editItem.instructions} />
            </label>
            <label>
              Deadline
              <input
                name="deadline"
                type="date"
                defaultValue={
                  editItem.deadline
                    ? new Date(editItem.deadline).toISOString().split("T")[0]
                    : ""
                }
                required
              />
            </label>
            <label>
              Maximum score
              <input
                name="max"
                type="number"
                defaultValue={editItem.maximumScore || 100}
                required
              />
            </label>
            <button className="primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
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

      {/* ── Resubmit modal ─────────────────────────────────────────── */}
      {resubmitItem && (
        <Modal title="Resubmit your work" close={() => setResubmitItem(null)}>
          <form className="stack-form" onSubmit={doResubmit}>
            <p className="mb-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
              Your mentor has requested a resubmission. Please update your work
              and submit a new version.
            </p>
            <label>
              GitHub repository URL
              <input
                name="repo"
                type="url"
                required
                defaultValue={resubmitItem.githubUrl || ""}
                placeholder="https://github.com/..."
              />
            </label>
            <label>
              Live demo URL (optional)
              <input
                name="demo"
                type="url"
                defaultValue={resubmitItem.liveDemoUrl || ""}
                placeholder="https://..."
              />
            </label>
            <label>
              Submission notes
              <textarea name="note" defaultValue={resubmitItem.notes || ""} />
            </label>
            <button className="primary" disabled={saving}>
              <RefreshCw size={16} />
              {saving ? "Resubmitting…" : "Resubmit assignment"}
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
