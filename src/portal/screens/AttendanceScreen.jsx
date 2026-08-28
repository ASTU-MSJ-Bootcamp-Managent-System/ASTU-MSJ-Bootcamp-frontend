import { useState } from "react";
import { Toolbar } from "../components/Shared";

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

  /* Students: show own attendance */
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

  /* Mentor: mark attendance for assigned students */
  const myStudents = people.filter((p) => p.mentorId === me?._id);
  const firstBatch = myStudents[0]?.batchId || batches[0]?._id;

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
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "https://astu-msj-bootcamp-backend.onrender.com"}/api/attendance`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              student: studentId,
              batch: firstBatch,
              date: today,
              status,
              note: "",
            }),
          },
        );
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
      {myStudents.length === 0 ? (
        <p className="empty-state">
          No students assigned to you.
        </p>
      ) : (
        myStudents.map((p) => (
          <div className="att-row" key={p._id}>
            <div>
              <b>{p.name}</b>
              <small className="ml-2 text-xs text-slate-400">{p.email}</small>
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
        ))
      )}
    </section>
  );
}
