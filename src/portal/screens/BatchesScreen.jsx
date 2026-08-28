import { useState } from "react";
import { Trash2, Users, UserPlus, X, ChevronDown, ChevronRight } from "lucide-react";
import { Toolbar, Modal } from "../components/Shared";
import {
  createBatch as apiCreateBatch,
  deleteBatch as apiDeleteBatch,
  attachMentor as apiAttachMentor,
  detachMentor as apiDetachMentor,
  enrollStudent as apiEnrollStudent,
  removeStudentFromBatch as apiRemoveStudentFromBatch,
  assignMentor as apiAssignMentor,
} from "../../api/client";

export default function Batches({
  role,
  token,
  batches,
  setBatches,
  people,
  refresh,
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null); // batch _id of expanded panel
  const [assignModal, setAssignModal] = useState(null); // { batchId, studentId, studentName }

  /* ── All mentors from people list ───────────────────────────────── */
  const allMentors = people.filter(
    (p) => p.role === "MENTOR" || p.role === "mentor",
  );
  const allStudents = people.filter(
    (p) => p.role === "STUDENT" || p.role === "student",
  );

  async function createBatch(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await apiCreateBatch(token, {
        name: f.get("name"),
        description: f.get("description") || f.get("name"),
        startDate: f.get("startDate") || new Date().toISOString(),
        endDate:
          f.get("endDate") ||
          new Date(Date.now() + 90 * 864e5).toISOString(),
      });
      await refresh();
      setOpen(false);
    } catch (err) {
      alert(err.message || "Failed to create batch.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBatch(id) {
    try {
      await apiDeleteBatch(token, id);
      await refresh();
    } catch (err) {
      alert(err.message || "Failed to delete batch.");
    }
  }

  /* ── Assign mentor to student ─────────────────────────────────────── */
  async function handleAssignMentor(batchId, studentId, mentorId) {
    try {
      /* Auto-attach mentor to batch if not already there */
      const batch = batches.find((b) => b._id === batchId);
      const mentorIds = (batch?.mentors || []).map((m) => m._id || m);
      if (!mentorIds.includes(mentorId)) {
        try {
          await apiAttachMentor(token, batchId, mentorId);
        } catch (attachErr) {
          /* Ignore 409 (already attached) — continue with assignment */
          if (!attachErr.message?.includes('already attached')) {
            throw attachErr;
          }
        }
      }
      await apiAssignMentor(token, batchId, studentId, mentorId);
      await refresh();
      setAssignModal(null);
    } catch (err) {
      alert(err.message || "Failed to assign mentor.");
    }
  }

  /* ── Remove student from batch ────────────────────────────────────── */
  async function handleRemoveStudent(batchId, studentId) {
    try {
      await apiRemoveStudentFromBatch(token, batchId, studentId);
      await refresh();
    } catch (err) {
      alert(err.message || "Failed to remove student.");
    }
  }

  /* ── Enroll student in batch ──────────────────────────────────────── */
  async function handleEnrollStudent(batchId, studentId) {
    try {
      await apiEnrollStudent(token, batchId, studentId);
      await refresh();
    } catch (err) {
      alert(err.message || "Failed to enroll student.");
    }
  }

  /* ── Detach mentor from batch ─────────────────────────────────────── */
  async function handleDetachMentor(batchId, mentorId) {
    try {
      await apiDetachMentor(token, batchId, mentorId);
      await refresh();
    } catch (err) {
      alert(err.message || "Failed to remove mentor from batch.");
    }
  }

  /* ── Attach mentor to batch ────────────────────────────────────────── */
  async function handleAttachMentor(batchId, mentorId) {
    try {
      await apiAttachMentor(token, batchId, mentorId);
      await refresh();
    } catch (err) {
      alert(err.message || "Failed to add mentor to batch.");
    }
  }

  return (
    <section className="panel work-panel">
      <Toolbar
        title="Bootcamp batches"
        action="Create batch"
        onAction={() => setOpen(true)}
      />
      {batches.length === 0 ? (
        <p className="empty-state">No batches yet.</p>
      ) : (
        <div className="space-y-4">
          {batches.map((b) => {
            const batchStudents = allStudents.filter(
              (p) => p.batchId === b._id,
            );
            const batchMentors = b.mentors || [];
            const isExpanded = expanded === b._id;

            /* Find unenrolled students and unattached mentors */
            const enrolledIds = new Set(batchStudents.map((s) => s._id));
            const unenrolled = allStudents.filter((s) => !enrolledIds.has(s._id));
            const attachedMentorIds = new Set(
              batchMentors.map((m) => m._id || m),
            );
            const unattachedMentors = allMentors.filter(
              (m) => !attachedMentorIds.has(m._id),
            );

            return (
              <article
                className="rounded-xl border border-slate-200 bg-white"
                key={b._id}
              >
                {/* ── Batch header ──────────────────────────────── */}
                <div
                  className="flex cursor-pointer items-center gap-3 p-4 hover:bg-slate-50"
                  onClick={() =>
                    setExpanded(isExpanded ? null : b._id)
                  }
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Users size={18} />
                  </div>
                  <div className="flex-1">
                    <b className="text-sm text-slate-800">{b.name}</b>
                    <p className="text-xs text-slate-500">
                      {batchStudents.length} students ·{" "}
                      {batchMentors.length} mentor
                      {batchMentors.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBatch(b._id);
                    }}
                    title="Delete batch"
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                  >
                    <Trash2 size={16} />
                  </button>
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={18} className="text-slate-400" />
                  )}
                </div>

                {/* ── Expanded detail panel ──────────────────────── */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4">
                    {/* ── Mentors section ────────────────────────── */}
                    <div className="mb-4">
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Mentors in this batch
                      </h4>
                      {batchMentors.length === 0 ? (
                        <p className="text-xs text-slate-400">
                          No mentors assigned.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {batchMentors.map((m) => {
                            const mId = m._id || m;
                            const mObj =
                              typeof m === "object"
                                ? m
                                : allMentors.find((x) => x._id === mId) || {
                                    _id: mId,
                                    name: "Mentor",
                                  };
                            return (
                              <div
                                key={mId}
                                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="grid size-7 place-items-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                                    {(mObj.name || "M").slice(0, 2)}
                                  </span>
                                  <span className="text-sm text-slate-700">
                                    {mObj.name}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    handleDetachMentor(b._id, mId)
                                  }
                                  className="rounded px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50"
                                >
                                  Remove
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add mentor to batch */}
                      {unattachedMentors.length > 0 && (
                        <AddMentorDropdown
                          mentors={unattachedMentors}
                          onSelect={(mentorId) =>
                            handleAttachMentor(b._id, mentorId)
                          }
                        />
                      )}
                    </div>

                    {/* ── Students section ───────────────────────── */}
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Students in this batch
                      </h4>
                      {batchStudents.length === 0 ? (
                        <p className="text-xs text-slate-400">
                          No students enrolled.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr>
                                <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-500">
                                  Student
                                </th>
                                <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-500">
                                  Assigned Mentor
                                </th>
                                <th className="px-2 py-2 text-right text-[10px] font-semibold uppercase text-slate-500">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {batchStudents.map((s) => (
                                <tr
                                  key={s._id}
                                  className="border-t border-slate-50"
                                >
                                  <td className="px-2 py-2">
                                    <div className="flex items-center gap-2">
                                      <span className="grid size-7 place-items-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                                        {(s.name || "S").slice(0, 2)}
                                      </span>
                                      <div>
                                        <b className="block text-xs text-slate-700">
                                          {s.name}
                                        </b>
                                        <small className="text-[10px] text-slate-400">
                                          {s.email}
                                        </small>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-2 py-2">
                                    <span className="text-xs text-slate-600">
                                      {s.mentor || "Unassigned"}
                                    </span>
                                  </td>
                                  <td className="px-2 py-2 text-right">
                                    <button
                                      onClick={() =>
                                        setAssignModal({
                                          batchId: b._id,
                                          studentId: s._id,
                                          studentName: s.name,
                                        })
                                      }
                                      className="mr-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                                    >
                                      Assign mentor
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRemoveStudent(b._id, s._id)
                                      }
                                      className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-100"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Enroll student into batch */}
                      {unenrolled.length > 0 && (
                        <EnrollStudentDropdown
                          students={unenrolled}
                          onSelect={(studentId) =>
                            handleEnrollStudent(b._id, studentId)
                          }
                        />
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* ── Create batch modal ─────────────────────────────────────── */}
      {open && (
        <Modal title="Create a batch" close={() => setOpen(false)}>
          <form className="stack-form" onSubmit={createBatch}>
            <label>
              Batch name
              <input name="name" required />
            </label>
            <label>
              Description
              <input name="description" />
            </label>
            <label>
              Start date
              <input name="startDate" type="date" />
            </label>
            <label>
              End date
              <input name="endDate" type="date" />
            </label>
            <button className="primary" disabled={saving}>
              {saving ? "Creating…" : "Create batch"}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Assign mentor to student modal ─────────────────────────── */}
      {assignModal && (
        <Modal
          title={`Assign mentor to ${assignModal.studentName}`}
          close={() => setAssignModal(null)}
        >
          <div className="space-y-2">
            {allMentors.length === 0 ? (
              <p className="text-sm text-slate-500">
                No mentors available. Create a mentor account first.
              </p>
            ) : (
              allMentors.map((m) => (
                <button
                  key={m._id}
                  onClick={() =>
                    handleAssignMentor(
                      assignModal.batchId,
                      assignModal.studentId,
                      m._id,
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                    {(m.name || "M").slice(0, 2)}
                  </span>
                  <div>
                    <b className="block text-sm text-slate-800">
                      {m.name}
                    </b>
                    <small className="text-xs text-slate-500">
                      {m.email}
                    </small>
                  </div>
                </button>
              ))
            )}
          </div>
        </Modal>
      )}
    </section>
  );
}

/* ── Small dropdown to add a mentor to the batch ────────────────────── */
function AddMentorDropdown({ mentors, onSelect }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1 rounded border border-dashed border-emerald-300 px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50"
      >
        <UserPlus size={12} /> Add mentor
      </button>
    );
  }
  return (
    <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-bold text-emerald-700">
          Select a mentor
        </span>
        <button
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          <X size={14} />
        </button>
      </div>
      <select
        className="w-full rounded border border-emerald-200 bg-white px-2 py-1.5 text-xs"
        autoFocus
        onChange={(e) => {
          if (e.target.value) {
            onSelect(e.target.value);
            setOpen(false);
          }
        }}
        onBlur={() => setOpen(false)}
      >
        <option value="">Choose mentor…</option>
        {mentors.map((m) => (
          <option key={m._id} value={m._id}>
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Small dropdown to enroll a student into the batch ───────────────── */
function EnrollStudentDropdown({ students, onSelect }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1 rounded border border-dashed border-amber-300 px-2 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-50"
      >
        <UserPlus size={12} /> Enroll student
      </button>
    );
  }
  return (
    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-bold text-amber-700">
          Select a student
        </span>
        <button
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          <X size={14} />
        </button>
      </div>
      <select
        className="w-full rounded border border-amber-200 bg-white px-2 py-1.5 text-xs"
        autoFocus
        onChange={(e) => {
          if (e.target.value) {
            onSelect(e.target.value);
            setOpen(false);
          }
        }}
        onBlur={() => setOpen(false)}
      >
        <option value="">Choose student…</option>
        {students.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
