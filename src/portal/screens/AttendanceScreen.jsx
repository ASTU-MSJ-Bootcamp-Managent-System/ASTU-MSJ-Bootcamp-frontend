import { useState } from "react";
import { Toolbar } from "../components/Shared";
import { createAttendance as apiCreateAttendance } from "../../api/client";

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

  /* ── Students: show own attendance ──────────────────────────────── */
  if (role === "student") {
    const myRecords = attendance.filter((a) => a.studentId === me?._id);
    const total = myRecords.length;
    const present = myRecords.filter(
      (a) => a.status === "PRESENT" || a.status === "LATE",
    ).length;
    const pct = total ? Math.round((present / total) * 100) : 0;

    return (
      <section className="panel work-panel">
        <Toolbar title="My attendance" />
        <div className="attendance-score">
          <b>{pct}%</b>
          <span>
            {present} of {total} sessions attended
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

  /*
   * Find students assigned to the current mentor.
   * Match by explicit mentorId, or by batch-level assignment.
   */
  const myStudents = people.filter(
    (p) =>
      (p.mentorId && p.mentorId === me?._id) ||
      (p.role === "STUDENT" || p.role === "student"),
  );

  /* For mentors, further narrow to only their mentees */
  const mentorStudents =
    role === "mentor"
      ? people.filter((p) => p.mentorId === me?._id)
      : myStudents;

  /*
   * Group students by batch so the mentor can pick which batch
   * session to mark attendance for.
   */
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

  const [selectedBatch, setSelectedBatch] = useState(
    () => batchGroups[0]?.batchId || null,
  );

  const activeStudents =
    batchGroups.find((g) => g.batchId === selectedBatch)?.students || [];

  function handleChange(studentId, status) {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  }

  async function saveAll() {
    const today = new Date().toISOString().split("T")[0];
    const toSave = Object.entries(records).filter(
      ([, s]) => s && s !== "—",
    );
    if (toSave.length === 0) {
      alert("No attendance changes to save.");
      return;
    }
    setSaving(true);
    try {
      for (const [studentId, status] of toSave) {
        const student = mentorStudents.find((s) => s._id === studentId);
        const batchId = student?.batchId || selectedBatch;
        await apiCreateAttendance(token, {
          student: studentId,
          batch: batchId,
          date: today,
          status,
          note: "",
        });
      }
      setRecords({});
      await refresh();
      alert("Attendance saved.");
    } catch (err) {
      alert(err.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  }

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
                  onClick={() => setSelectedBatch(g.batchId)}
                  className={
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition " +
                    (selectedBatch === g.batchId
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

          {activeStudents.map((p) => (
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
            </div>
          ))}
        </>
      )}
    </section>
  );
}
