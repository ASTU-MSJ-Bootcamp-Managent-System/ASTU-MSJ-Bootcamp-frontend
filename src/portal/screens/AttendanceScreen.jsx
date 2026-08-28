import { useState, useEffect } from "react";
import { Edit3, Check, X } from "lucide-react";
import { Toolbar } from "../components/Shared";
import {
  createAttendance as apiCreateAttendance,
  updateAttendance as apiUpdateAttendance,
  getAttendancePercentage as apiGetAttendancePercentage,
} from "../../api/client";
import { handleApiError, showSuccess, showWarning } from "../../api/toast";

const statusLabel = {
  PRESENT: "Present",
  LATE: "Late",
  ABSENT: "Absent",
  EXCUSED: "Excused",
};

export default function Attendance({
  role,
  me,
  people,
  attendance,
  setAttendance,
  batches,
  token,
  refresh,
}) {
  const [records, setRecords] = useState({});
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNote, setEditNote] = useState("");
  const [attPercentage, setAttPercentage] = useState(null);

  /* ── Students: show own attendance ──────────────────────────────── */
  if (role === "student") {
    const myRecords = attendance.filter((a) => a.studentId === me?._id);
    const total = myRecords.length;
    const present = myRecords.filter(
      (a) => a.status === "PRESENT" || a.status === "LATE",
    ).length;
    const pct = total ? Math.round((present / total) * 100) : 0;

    // Fetch attendance percentage from API if we have batch info
    const myBatchId = people.find((p) => p._id === me?._id)?.batchId;
    if (myBatchId && attPercentage === null) {
      apiGetAttendancePercentage(token, myBatchId, me?._id)
        .then((res) => setAttPercentage(res.data))
        .catch(() => {});
    }

    return (
      <section className="panel work-panel">
        <Toolbar title="My attendance" />
        <div className="attendance-score">
          <b>{attPercentage?.percentage ?? pct}%</b>
          <span>
            {attPercentage
              ? `${attPercentage.present} present, ${attPercentage.late} late, ${attPercentage.absent} absent, ${attPercentage.excused} excused out of ${attPercentage.totalDays} sessions`
              : `${present} of ${total} sessions attended`}
          </span>
        </div>
        {myRecords.length > 0 ? (
          <div className="table-wrap mt-6">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Batch</th>
                  <th>Status</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {myRecords.slice(0, 20).map((a) => (
                  <tr key={a._id}>
                    <td className="font-semibold">{a.date}</td>
                    <td>{a.batchName}</td>
                    <td>
                      <span
                        className={
                          "status " +
                          (a.status === "PRESENT"
                            ? "green"
                            : a.status === "LATE"
                              ? "amber"
                              : a.status === "ABSENT"
                                ? "amber"
                                : "green")
                        }
                      >
                        {statusLabel[a.status] || a.status}
                      </span>
                    </td>
                    <td>{a.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state mt-6">
            No attendance records yet.
          </p>
        )}
      </section>
    );
  }

  /* ── Mentor / Admin: mark attendance ────────────────────────────── */

  /* Students assigned to this mentor */
  const mentorStudents =
    role === "mentor"
      ? people.filter((p) => (p.role === "STUDENT" || p.role === "student") && p.mentorId && p.mentorId === me?._id)
      : people.filter((p) => p.role === "STUDENT" || p.role === "student");

  /* Group students by batch */
  const batchMap = {};
  for (const s of mentorStudents) {
    const bid = s.batchId || "__unassigned";
    if (!batchMap[bid]) {
      batchMap[bid] = {
        batchId: bid,
        batchName: s.batch || "Unassigned",
        students: [],
      };
    }
    batchMap[bid].students.push(s);
  }
  const batchGroups = Object.values(batchMap);

  /* Derive selectedBatch from state — always pick first valid batch */
  const [selectedBatchKey, setSelectedBatchKey] = useState(null);
  const validBatchId = batchGroups.find((g) => g.batchId !== "__unassigned")?.batchId || null;
  const effectiveSelectedBatch = selectedBatchKey || validBatchId || null;

  const activeStudents =
    batchGroups.find((g) => g.batchId === effectiveSelectedBatch)?.students || [];

  function handleChange(studentId, status) {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  }

  async function saveAll() {
    const today = new Date().toISOString().split("T")[0];
    const toSave = Object.entries(records).filter(
      ([, s]) => s && s !== "—",
    );
    if (toSave.length === 0) {
      showWarning("No attendance changes to save.");
      return;
    }
    setSaving(true);
    let saved = 0;
    let failed = 0;
    try {
      for (const [studentId, status] of toSave) {
        /* Skip invalid IDs */
        if (!studentId || studentId === "undefined" || studentId === "null" || studentId === "__unassigned") {
          failed++;
          continue;
        }
        const student = mentorStudents.find((s) => s._id === studentId);
        /* Use the student's actual batchId from the people list */
        const batchId = student?.batchId;
        if (!batchId) {
          showWarning(`Cannot save attendance for ${student?.name || "unknown"} — student has no batch.`);
          failed++;
          continue;
        }
        try {
          await apiCreateAttendance(token, {
            student: studentId,
            batch: batchId,
            date: today,
            status,
            note: "",
          });
          saved++;
        } catch (err) {
          /* individual record error — counted in failed */
          failed++;
        }
      }
      setRecords({});
      await refresh();
      if (failed > 0) {
        if (failed > 0) showWarning(`${saved} saved, ${failed} failed.`);
      } else {
        showSuccess("Attendance saved.");
      }
    } catch (err) {
      handleApiError(err, "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  }

  /* ── Edit an existing attendance record ──────────────────────────── */
  function startEdit(record) {
    setEditingId(record._id);
    setEditStatus(record.status);
    setEditNote(record.note || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditStatus("");
    setEditNote("");
  }

  async function saveEdit(record) {
    try {
      await apiUpdateAttendance(token, record._id, {
        status: editStatus,
        note: editNote,
      });
      showSuccess("Attendance updated.");
      cancelEdit();
      await refresh();
    } catch (err) {
      handleApiError(err, "Failed to update attendance.");
    }
  }

  /* Get existing attendance for today's date */
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = attendance.filter(
    (a) => a.date === today && activeStudents.some((s) => s._id === a.studentId),
  );

  return (
    <section className="panel work-panel">
      <Toolbar
        title="Mark attendance"
        action={saving ? null : "Save attendance"}
        onAction={saveAll}
      />
      {mentorStudents.length === 0 ? (
        <p className="empty-state">
          No students assigned to you yet. Ask an admin to assign students
          to your mentorship in the Batches page.
        </p>
      ) : (
        <>
          {/* Batch selector when multiple batches */}
          {batchGroups.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {batchGroups.map((g) => (
                <button
                  key={g.batchId}
                  onClick={() => setSelectedBatchKey(g.batchId)}
                  className={
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition " +
                    (effectiveSelectedBatch === g.batchId
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200")
                  }
                >
                  {g.batchName} ({g.students.length})
                </button>
              ))}
            </div>
          )}

          {/* Today's date */}
          <p className="mb-3 text-xs text-slate-400">
            Date: {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          {activeStudents.length === 0 ? (
            <p className="empty-state">
              No students found for the selected batch.
            </p>
          ) : (
            activeStudents.map((p) => {
              const existingRecord = todayRecords.find((r) => r.studentId === p._id);
              const isEditing = editingId === existingRecord?._id;

              return (
                <div className="att-row" key={p._id}>
                  <div>
                    <b>{p.name}</b>
                    <small className="ml-2 text-xs text-slate-400">
                      {p.email}
                    </small>
                    {p.batch && (
                      <small className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                        {p.batch}
                      </small>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                        >
                          <option value="PRESENT">Present</option>
                          <option value="LATE">Late</option>
                          <option value="ABSENT">Absent</option>
                          <option value="EXCUSED">Excused</option>
                        </select>
                        <input
                          type="text"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          placeholder="Note (optional)"
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                        />
                        <button
                          onClick={() => saveEdit(existingRecord)}
                          className="rounded p-1 text-green-600 hover:bg-green-50"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        {existingRecord ? (
                          <>
                            <span className={`status ${existingRecord.status === "PRESENT" ? "green" : existingRecord.status === "LATE" ? "amber" : "amber"}`}>
                              {statusLabel[existingRecord.status] || existingRecord.status}
                            </span>
                            <button
                              onClick={() => startEdit(existingRecord)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                              title="Edit attendance"
                            >
                              <Edit3 size={14} />
                            </button>
                          </>
                        ) : (
                          <select
                            value={records[p._id] || "—"}
                            onChange={(e) => handleChange(p._id, e.target.value)}
                          >
                            <option value="—">—</option>
                            <option value="PRESENT">Present</option>
                            <option value="LATE">Late</option>
                            <option value="ABSENT">Absent</option>
                            <option value="EXCUSED">Excused</option>
                          </select>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </section>
  );
}
