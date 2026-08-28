import { useState } from "react";
import { Toolbar, Modal } from "../components/Shared";
import { Edit3, Trash2 } from "lucide-react";
import {
  createProgress as apiCreateProgress,
  updateProgress as apiUpdateProgress,
  deleteProgress as apiDeleteProgress,
} from "../../api/client";

const statusLabel = {
  COMPLETED: "Completed",
  IN_PROGRESS: "In progress",
  NEEDS_IMPROVEMENT: "Needs improvement",
  NOT_STARTED: "Not started",
};

const statusPct = {
  COMPLETED: 100,
  IN_PROGRESS: 50,
  NEEDS_IMPROVEMENT: 30,
  NOT_STARTED: 0,
};

const topicLabel = {
  HTML_CSS: "HTML & CSS",
  JAVASCRIPT: "JavaScript",
  REACT: "React",
  NODEJS: "Node.js",
  EXPRESSJS: "Express.js",
  MONGODB: "MongoDB",
  GIT_GITHUB: "Git & GitHub",
};

const topicOptions = [
  "HTML_CSS",
  "JAVASCRIPT",
  "REACT",
  "NODEJS",
  "EXPRESSJS",
  "MONGODB",
  "GIT_GITHUB",
];

const statusOptions = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "NEEDS_IMPROVEMENT"];

function isValidMongoId(id) {
  return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
}

export default function Learning({ people = [], progress = [], role, me, token, batches, refresh }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const isMentor = role === "mentor" || role === "admin";

  /* Only students with valid DB IDs */
  const studentOptions = people.filter(
    (p) => (p.role === "STUDENT" || p.role === "student") && isValidMongoId(p._id),
  );

  /* Auto-resolve batch from the selected student */
  const selectedStudent = studentOptions.find((s) => s._id === selectedStudentId);
  const resolvedBatchId = selectedStudent?.batchId || null;
  const resolvedBatchName = selectedStudent?.batch || "";

  /* ── Create progress record ─────────────────────────────────────── */
  async function handleCreate(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const studentId = selectedStudentId;
    const batchId = resolvedBatchId;

    if (!isValidMongoId(studentId)) {
      alert("Please select a valid student.");
      return;
    }
    if (!isValidMongoId(batchId)) {
      alert("The selected student has no batch assigned. Please enroll them in a batch first.");
      return;
    }

    setSaving(true);
    try {
      await apiCreateProgress(token, {
        student: studentId,
        batch: batchId,
        topic: f.get("topic"),
        status: f.get("status"),
        notes: f.get("notes") || "",
      });
      await refresh();
      setCreateOpen(false);
      setSelectedStudentId("");
    } catch (err) {
      alert(err.message || "Failed to create progress record.");
    } finally {
      setSaving(false);
    }
  }

  /* ── Update progress record ─────────────────────────────────────── */
  async function handleUpdate(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await apiUpdateProgress(token, editItem._id, {
        status: f.get("status"),
        notes: f.get("notes") || "",
      });
      await refresh();
      setEditItem(null);
    } catch (err) {
      alert(err.message || "Failed to update progress.");
    } finally {
      setSaving(false);
    }
  }

  /* ── Delete progress record ─────────────────────────────────────── */
  async function handleDelete(id) {
    try {
      await apiDeleteProgress(token, id);
      await refresh();
    } catch (err) {
      alert(err.message || "Failed to delete progress.");
    }
  }

  /* Build a list of students with their progress */
  const list =
    role === "student"
      ? (() => {
          const myProg = progress.filter((p) => p.studentId === me?._id);
          return myProg.length > 0
            ? myProg.map((p) => ({
                _id: p._id,
                name: me?.name || "You",
                topic: p.topic,
                topicLabel: topicLabel[p.topic] || p.topic,
                status: p.status,
                notes: p.notes,
              }))
            : [
                {
                  name: me?.name || "You",
                  topic: "—",
                  topicLabel: "—",
                  status: "NOT_STARTED",
                  notes: "",
                },
              ];
        })()
      : progress.map((p) => ({
          _id: p._id,
          name: p.studentName || "Unknown",
          studentId: p.studentId,
          topic: p.topic,
          topicLabel: topicLabel[p.topic] || p.topic,
          status: p.status,
          notes: p.notes,
          batchName: p.batchName,
        }));

  if (list.length === 0) {
    return (
      <section className="panel work-panel">
        <Toolbar
          title={role === "student" ? "My learning" : "Progress tracking"}
          action={isMentor ? "Add progress record" : undefined}
          onAction={() => { setCreateOpen(true); setSelectedStudentId(""); }}
        />
        <p className="empty-state">
          {role === "student"
            ? "No progress records yet. Your mentor will track your learning."
            : "No progress records yet."}
        </p>

        {createOpen && (
          <Modal title="Create progress record" close={() => setCreateOpen(false)}>
            <form className="stack-form" onSubmit={handleCreate}>
              <label>
                Student
                <select
                  name="student"
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  <option value="">Select student…</option>
                  {studentOptions.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email}){s.batch ? ` — ${s.batch}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              {selectedStudentId && resolvedBatchId && (
                <p className="text-xs text-slate-400 -mt-2 mb-2">
                  Batch: <b>{resolvedBatchName}</b> (auto-assigned)
                </p>
              )}
              {selectedStudentId && !resolvedBatchId && (
                <p className="text-xs text-rose-500 -mt-2 mb-2">
                  ⚠ This student has no batch. Enroll them first.
                </p>
              )}
              <label>
                Topic
                <select name="topic" required>
                  {topicOptions.map((t) => (
                    <option key={t} value={t}>
                      {topicLabel[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select name="status" defaultValue="NOT_STARTED">
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Notes
                <textarea name="notes" placeholder="Optional notes…" />
              </label>
              <button className="primary" disabled={saving || !selectedStudentId || !resolvedBatchId}>
                {saving ? "Creating…" : "Create record"}
              </button>
            </form>
          </Modal>
        )}
      </section>
    );
  }

  return (
    <section className={role === "student" ? "" : "panel work-panel"}>
      {role === "student" && (
        <Toolbar title="My learning" />
      )}
      {isMentor && (
        <Toolbar
          title="Progress tracking"
          action="Add progress record"
          onAction={() => { setCreateOpen(true); setSelectedStudentId(""); }}
        />
      )}
      <div className="learning-list">
        {list.map((item, i) => {
          const pct = statusPct[item.status] ?? 0;
          return (
            <div className="module" key={item._id || i}>
              <div className="module-copy">
                <b>{item.name}</b>
                <span>
                  {item.topicLabel} · {statusLabel[item.status] || item.status}
                </span>
                {item.notes && (
                  <p className="mt-1 text-xs text-slate-400">{item.notes}</p>
                )}
                {item.batchName && (
                  <small className="text-[10px] text-slate-300">Batch: {item.batchName}</small>
                )}
              </div>
              <div className="bar">
                <i style={{ width: pct + "%" }} />
              </div>
              <strong>{pct}%</strong>
              {isMentor && item._id && (
                <div className="ml-2 flex items-center gap-1">
                  <button
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                    onClick={() => setEditItem(item)}
                    title="Edit progress"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                    onClick={() => {
                      if (confirm("Delete this progress record?")) handleDelete(item._id);
                    }}
                    title="Delete progress"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {createOpen && (
        <Modal title="Create progress record" close={() => setCreateOpen(false)}>
          <form className="stack-form" onSubmit={handleCreate}>
            <label>
              Student
              <select
                name="student"
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">Select student…</option>
                {studentOptions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.email}){s.batch ? ` — ${s.batch}` : ""}
                  </option>
                ))}
              </select>
            </label>
            {selectedStudentId && resolvedBatchId && (
              <p className="text-xs text-slate-400 -mt-2 mb-2">
                Batch: <b>{resolvedBatchName}</b> (auto-assigned)
              </p>
            )}
            {selectedStudentId && !resolvedBatchId && (
              <p className="text-xs text-rose-500 -mt-2 mb-2">
                ⚠ This student has no batch. Enroll them first.
              </p>
            )}
            <label>
              Topic
              <select name="topic" required>
                {topicOptions.map((t) => (
                  <option key={t} value={t}>
                    {topicLabel[t]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select name="status" defaultValue="NOT_STARTED">
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel[s]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Notes
              <textarea name="notes" placeholder="Optional notes…" />
            </label>
            <button className="primary" disabled={saving || !selectedStudentId || !resolvedBatchId}>
              {saving ? "Creating…" : "Create record"}
            </button>
          </form>
        </Modal>
      )}

      {editItem && (
        <Modal title="Edit progress" close={() => setEditItem(null)}>
          <form className="stack-form" onSubmit={handleUpdate}>
            <p className="text-sm text-slate-500 mb-2">
              {editItem.name} · {editItem.topicLabel}
            </p>
            <label>
              Status
              <select name="status" defaultValue={editItem.status}>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel[s]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Notes
              <textarea name="notes" defaultValue={editItem.notes || ""} placeholder="Optional notes…" />
            </label>
            <button className="primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
