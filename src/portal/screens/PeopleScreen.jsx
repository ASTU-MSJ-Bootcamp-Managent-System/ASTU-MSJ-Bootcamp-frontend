import { useState } from "react";
import { UserMinus, UserCheck, UserPlus, Trash2, Edit3, Shield, X } from "lucide-react";
import { Toolbar, Modal } from "../components/Shared";

export default function People({
  role,
  token,
  me,
  people,
  setPeople,
  batches,
  assignMentor,
  approveUser,
  rejectUser,
  removeStudentFromBatch,
  updateUserRole,
  updateUserProfile,
  enrollStudent,
  attachMentor,
  detachMentor,
  refresh,
}) {
  const [profile, setProfile] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [enrollModal, setEnrollModal] = useState(null); // { student } or null (for top-level enroll)
  const [addMentorModal, setAddMentorModal] = useState(false);
  const [batchChangeModal, setBatchChangeModal] = useState(null); // { student }
  const [confirmDelete, setConfirmDelete] = useState(null); // { student }
  const [confirmMakeMentor, setConfirmMakeMentor] = useState(null); // { student }

  const isAdmin = role === "admin";

  /* Filter based on role — mentors see only their mentees */
  const students =
    role === "mentor"
      ? people.filter((p) => (p.role === "STUDENT" || p.role === "student") && p.mentorId && p.mentorId === me?._id)
      : people.filter((p) => p.role === "STUDENT" || p.role === "student");

  const mentors =
    role === "mentor"
      ? []
      : people.filter((p) => p.role === "MENTOR" || p.role === "mentor");

  /* Unassigned students (no batch) */
  const unassigned = students.filter((s) => !s.batchId);

  /* ── Build unique mentor list from batches data ──────────────── */
  const mentorMap = new Map();
  for (const b of batches || []) {
    for (const m of b.mentors || []) {
      const id = m._id || m;
      if (!mentorMap.has(id)) {
        mentorMap.set(id, m._id ? m : { _id: id, name: "Mentor" });
      }
    }
  }
  const batchMentors = [...mentorMap.values()];

  return (
    <section className="panel work-panel">
      <Toolbar
        title={
          role === "mentor"
            ? "My mentees"
            : "People & access"
        }
        action={isAdmin ? "Enroll student" : undefined}
        onAction={() => setEnrollModal({ student: null })}
      />

      {/* ── Students Table ──────────────────────────────────────── */}
      {students.length === 0 ? (
        <p className="empty-state">
          {role === "mentor"
            ? "No students assigned to you yet."
            : "No students found."}
        </p>
      ) : (
        <div className="mb-8">
          {isAdmin && (
            <p className="mb-3 text-xs font-semibold tracking-wider text-slate-500">
              STUDENTS
            </p>
          )}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Batch</th>
                  <th>Mentor</th>
                  <th>Attendance</th>
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {students.map((x) => (
                  <tr key={x._id}>
                    <td>
                      <button
                        className="person person-link"
                        onClick={() => setProfile(x)}
                      >
                        <span>{(x.name || "?").slice(0, 2)}</span>
                        <div>
                          <b>{x.name}</b>
                          <small>{x.email}</small>
                        </div>
                      </button>
                    </td>
                    <td>
                      {isAdmin && x.batchId ? (
                        <button
                          onClick={() => setBatchChangeModal({ student: x })}
                          className="group inline-flex items-center gap-1 text-sm text-slate-700 hover:text-emerald-700"
                          title="Change batch"
                        >
                          {x.batch}
                          <span className="text-[10px] text-slate-400 group-hover:text-emerald-600">✎</span>
                        </button>
                      ) : (
                        <span className="text-sm text-slate-700">{x.batch}</span>
                      )}
                      {!x.batchId && isAdmin && (
                        <button
                          onClick={() => setEnrollModal({ student: x })}
                          className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 transition hover:bg-amber-100"
                          title="Enroll in a batch"
                        >
                          + Enroll
                        </button>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">
                          {x.mentor || "Unassigned"}
                        </span>
                        {assignMentor && (role === "mentor" || isAdmin) && x.batchId && (
                          <button
                            onClick={() => setAssignModal({ student: x })}
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 transition hover:bg-emerald-100"
                            title="Change mentor"
                          >
                            ✎ Change
                          </button>
                        )}
                      </div>
                    </td>
                    <td>{x.attendance}%</td>
                    <td>
                      <span
                        className={
                          "status " +
                          (x.status === "Active" ? "green" : "amber")
                        }
                      >
                        {x.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="flex items-center gap-1">
                          {/* Edit */}
                          <button
                            onClick={() => setEditModal({ student: x })}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                            title="Edit student"
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* Make mentor */}
                          {x.status === "Active" && (
                            <button
                              onClick={() => setConfirmMakeMentor({ student: x })}
                              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-violet-600"
                              title="Make mentor"
                            >
                              <Shield size={14} />
                            </button>
                          )}

                          {/* Approve (for suspended) */}
                          {x.status === "Suspended" && approveUser && (
                            <button
                              onClick={async () => {
                                if (!confirm(`Approve ${x.name}?`)) return;
                                await approveUser(x._id);
                              }}
                              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-green-600"
                              title="Approve account"
                            >
                              <UserCheck size={14} />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => setConfirmDelete({ student: x })}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                            title="Delete student"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Mentors Section ─────────────────────────────────────── */}
      {!isAdmin || role === "mentor" ? null : (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wider text-slate-500">
              MENTORS
            </p>
            <button
              onClick={() => setAddMentorModal(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
            >
              <UserPlus size={14} /> Add mentor
            </button>
          </div>
          {mentors.length === 0 ? (
            <p className="text-sm text-slate-400">No mentors yet.</p>
          ) : (
            <div className="space-y-2">
              {mentors.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-800">
                      {(m.name || "M").slice(0, 2)}
                    </span>
                    <div>
                      <b className="block text-sm text-slate-800">{m.name}</b>
                      <small className="text-xs text-slate-500">{m.email}</small>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm(`Remove mentor ${m.name}? This won't delete their account.`)) return;
                      // Find which batches this mentor is attached to and remove
                      for (const b of batches || []) {
                        const mIds = (b.mentors || []).map((mt) => mt._id || mt);
                        if (mIds.includes(m._id)) {
                          try {
                            await detachMentor(b._id, m._id);
                          } catch (e) {
                            console.error("Failed to detach mentor:", e);
                          }
                        }
                      }
                      await refresh?.();
                    }}
                    className="rounded px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Profile modal ───────────────────────────────────────── */}
      {profile && (
        <Modal title="Student profile" close={() => setProfile(null)}>
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
              {(profile.name || "?").slice(0, 2)}
            </span>
            <div>
              <h3 className="font-semibold text-slate-900">{profile.name}</h3>
              <p className="text-sm text-slate-500">{profile.email}</p>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <p>
              <b className="block text-slate-900">Batch</b>
              {profile.batch || "Unassigned"}
            </p>
            <p>
              <b className="block text-slate-900">Mentor</b>
              {profile.mentor || "Unassigned"}
            </p>
            <p>
              <b className="block text-slate-900">Attendance</b>
              {profile.attendance}%
            </p>
            <p>
              <b className="block text-slate-900">Status</b>
              {profile.status}
            </p>
          </div>
        </Modal>
      )}

      {/* ── Assign mentor modal ──────────────────────────────────── */}
      {assignModal && (
        <Modal
          title={`Assign mentor to ${assignModal.student.name}`}
          close={() => setAssignModal(null)}
        >
          <p className="mb-4 text-sm text-slate-500">
            Select a mentor for this student in batch{" "}
            <b>{assignModal.student.batch}</b>:
          </p>
          {(() => {
            /* Show all mentors from people list (role MENTOR), not just batch-attached */
            const allMentorsList = people.filter(
              (p) => (p.role === "MENTOR" || p.role === "mentor") && p._id !== assignModal.student._id,
            );
            if (allMentorsList.length === 0) {
              return (
                <p className="text-sm text-slate-500">
                  No mentors available. Ask an admin to create mentor accounts first.
                </p>
              );
            }
            /* Check which mentors are already in this batch */
            const batchMentorIds = new Set(
              (batches.find((b) => b._id === assignModal.student.batchId)?.mentors || []).map((m) => m._id || m)
            );
            return (
              <div className="space-y-2">
                {allMentorsList.map((m) => {
                  const isCurrent = assignModal.student.mentorId === m._id;
                  const isInBatch = batchMentorIds.has(m._id);
                  return (
                    <button
                      key={m._id}
                      onClick={async () => {
                        try {
                          /* Always ensure mentor is attached to the batch */
                          if (assignModal.student.batchId) {
                            try {
                              await attachMentor(assignModal.student.batchId, m._id);
                            } catch (attachErr) {
                              if (!attachErr.message?.includes('already attached')) {
                                throw attachErr;
                              }
                            }
                          }
                          await assignMentor(assignModal.student, m._id);
                          setAssignModal(null);
                        } catch (e) {
                          alert(e.message);
                        }
                      }}
                      className={
                        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition " +
                        (isCurrent
                          ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200"
                          : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50")
                      }
                    >
                      <span className="grid size-8 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                        {(m.name || "M").slice(0, 2)}
                      </span>
                      <div className="flex-1">
                        <b className="block text-sm text-slate-800">
                          {m.name}
                          {isCurrent && (
                            <small className="ml-2 text-[10px] font-bold text-emerald-600">
                              (current)
                            </small>
                          )}
                          {!isInBatch && !isCurrent && (
                            <small className="ml-2 text-[10px] font-bold text-amber-600">
                              (will be added to batch)
                            </small>
                          )}
                        </b>
                      </div>
                      {!isCurrent && (
                        <span className="text-xs font-bold text-emerald-700">
                          Select →
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </Modal>
      )}

      {/* ── Edit student modal ──────────────────────────────────── */}
      {editModal && (
        <Modal
          title={`Edit ${editModal.student.name}`}
          close={() => setEditModal(null)}
        >
          <EditStudentForm
            student={editModal.student}
            batches={batches}
            onSave={async (changes) => {
              try {
                await updateUserProfile(editModal.student._id, changes);
                setEditModal(null);
              } catch (e) {
                alert(e.message);
              }
            }}
            onCancel={() => setEditModal(null)}
          />
        </Modal>
      )}

      {/* ── Enroll student in batch modal ───────────────────────── */}
      {enrollModal && (
        <Modal
          title={enrollModal.student ? `Enroll ${enrollModal.student.name}` : "Enroll student in a batch"}
          close={() => setEnrollModal(null)}
        >
          <EnrollForm
            student={enrollModal.student}
            students={enrollModal.student ? [] : unassigned}
            batches={batches}
            onEnroll={async (batchId, studentId) => {
              try {
                await enrollStudent(batchId, studentId);
                setEnrollModal(null);
              } catch (e) {
                alert(e.message);
              }
            }}
            onCancel={() => setEnrollModal(null)}
          />
        </Modal>
      )}

      {/* ── Batch change modal ──────────────────────────────────── */}
      {batchChangeModal && (
        <Modal
          title={`Change batch for ${batchChangeModal.student.name}`}
          close={() => setBatchChangeModal(null)}
        >
          <p className="mb-4 text-sm text-slate-500">
            Current batch: <b>{batchChangeModal.student.batch}</b>
          </p>
          <div className="space-y-2">
            {batches.map((b) => {
              const isCurrent = batchChangeModal.student.batchId === b._id;
              return (
                <button
                  key={b._id}
                  onClick={async () => {
                    if (isCurrent) return;
                    try {
                      // Remove from old batch
                      if (batchChangeModal.student.batchId) {
                        await removeStudentFromBatch(
                          batchChangeModal.student.batchId,
                          batchChangeModal.student._id,
                        );
                      }
                      // Enroll in new batch
                      await enrollStudent(b._id, batchChangeModal.student._id);
                      setBatchChangeModal(null);
                    } catch (e) {
                      alert(e.message);
                    }
                  }}
                  disabled={isCurrent}
                  className={
                    "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition " +
                    (isCurrent
                      ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200"
                      : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50")
                  }
                >
                  <div className="flex-1">
                    <b className="block text-sm text-slate-800">
                      {b.name}
                      {isCurrent && (
                        <small className="ml-2 text-[10px] font-bold text-emerald-600">
                          (current)
                        </small>
                      )}
                    </b>
                  </div>
                  {!isCurrent && (
                    <span className="text-xs font-bold text-emerald-700">
                      Select →
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Modal>
      )}

      {/* ── Confirm delete modal ────────────────────────────────── */}
      {confirmDelete && (
        <Modal
          title="Delete student"
          close={() => setConfirmDelete(null)}
        >
          <p className="mb-4 text-sm text-slate-600">
            Are you sure you want to delete <b>{confirmDelete.student.name}</b>?
            This will permanently remove their account and all associated data.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmDelete(null)}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  await rejectUser(confirmDelete.student._id);
                  setConfirmDelete(null);
                } catch (e) {
                  alert(e.message);
                }
              }}
              className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {/* ── Confirm make mentor modal ───────────────────────────── */}
      {confirmMakeMentor && (
        <Modal
          title="Make mentor"
          close={() => setConfirmMakeMentor(null)}
        >
          <p className="mb-4 text-sm text-slate-600">
            Change <b>{confirmMakeMentor.student.name}</b>'s role to <b>Mentor</b>?
            They will gain mentor access and permissions.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmMakeMentor(null)}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  await updateUserRole(confirmMakeMentor.student._id, "MENTOR");
                  setConfirmMakeMentor(null);
                } catch (e) {
                  alert(e.message);
                }
              }}
              className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Make mentor
            </button>
          </div>
        </Modal>
      )}

      {/* ── Add mentor modal ────────────────────────────────────── */}
      {addMentorModal && (
        <Modal
          title="Add mentor to a batch"
          close={() => setAddMentorModal(false)}
        >
          <AddMentorForm
            people={people}
            batches={batches}
            onAdd={async (batchId, mentorId) => {
              try {
                await attachMentor(batchId, mentorId);
                setAddMentorModal(false);
              } catch (e) {
                alert(e.message);
              }
            }}
            onCancel={() => setAddMentorModal(false)}
          />
        </Modal>
      )}
    </section>
  );
}

/* ── Edit student form ────────────────────────────────────────────────── */
function EditStudentForm({ student, batches, onSave, onCancel }) {
  const [name, setName] = useState(student.name || "");
  const [email, setEmail] = useState(student.email || "");
  const [saving, setSaving] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ name, email });
        setSaving(false);
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          required
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

/* ── Enroll student form ─────────────────────────────────────────────── */
function EnrollForm({ student, students, batches, onEnroll, onCancel }) {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(student?._id || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const batchId = selectedBatch;
    const studentId = student?._id || selectedStudent;
    if (!batchId || !studentId) return;
    onEnroll(batchId, studentId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!student && students.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Student
          </label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            required
          >
            <option value="">Select a student…</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </div>
      )}
      {!student && students.length === 0 && (
        <p className="text-sm text-slate-500">
          No unassigned students available to enroll.
        </p>
      )}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Batch
        </label>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          required
        >
          <option value="">Select a batch…</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selectedBatch || (!student && !selectedStudent)}
          className="flex-1 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          Enroll
        </button>
      </div>
    </form>
  );
}

/* ── Add mentor form ─────────────────────────────────────────────────── */
function AddMentorForm({ people, batches, onAdd, onCancel }) {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("");

  const allMentors = people.filter(
    (p) => p.role === "MENTOR" || p.role === "mentor",
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBatch || !selectedMentor) return;
    onAdd(selectedBatch, selectedMentor);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Mentor
        </label>
        <select
          value={selectedMentor}
          onChange={(e) => setSelectedMentor(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          required
        >
          <option value="">Select a mentor…</option>
          {allMentors.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name} ({m.email})
            </option>
          ))}
        </select>
        {allMentors.length === 0 && (
          <p className="mt-1 text-xs text-slate-400">
            No mentor accounts found. Create a mentor account first.
          </p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Batch
        </label>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          required
        >
          <option value="">Select a batch…</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selectedBatch || !selectedMentor}
          className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          Add mentor
        </button>
      </div>
    </form>
  );
}
