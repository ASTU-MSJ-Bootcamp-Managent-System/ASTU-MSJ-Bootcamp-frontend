import { useState } from "react";
import { UserMinus, UserCheck } from "lucide-react";
import { Profile, Toolbar, Modal } from "../components/Shared";

export default function People({ role, me, people, setPeople, batches, assignMentor }) {
  const [profile, setProfile] = useState(null);
  const [assignModal, setAssignModal] = useState(null); // { student }

  /* Filter based on role — mentors see only their mentees */
  const list =
    role === "mentor"
      ? people.filter((p) => p.mentorId && p.mentorId === me?._id)
      : people;

  /* Build unique mentor list from batches data */
  const mentorMap = new Map();
  for (const b of batches || []) {
    for (const m of b.mentors || []) {
      const id = m._id || m;
      if (!mentorMap.has(id)) {
        mentorMap.set(id, m._id ? m : { _id: m, name: "Mentor" });
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
            : "People directory"
        }
      />
      {list.length === 0 ? (
        <p className="empty-state">
          {role === "mentor"
            ? "No students assigned to you yet."
            : "No people found."}
        </p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Batch</th>
                <th>Mentor</th>
                <th>Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((x) => (
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
                  <td>{x.batch}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">
                        {x.mentor || "Unassigned"}
                      </span>
                      {assignMentor && (role === "mentor" || role === "admin") && x.batchId && (
                        <button
                          onClick={() =>
                            setAssignModal({ student: x })
                          }
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {profile && (
        <Profile x={profile} role={role} close={() => setProfile(null)} />
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
          {batchMentors.length === 0 ? (
            <p className="text-sm text-slate-500">
              No mentors available. Ask an admin to create mentor accounts
              first.
            </p>
          ) : (
            <div className="space-y-2">
              {batchMentors.map((m) => {
                const isCurrent = assignModal.student.mentorId === m._id;
                return (
                  <button
                    key={m._id}
                    onClick={() => {
                      assignMentor(assignModal.student, m._id);
                      setAssignModal(null);
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
          )}
        </Modal>
      )}
    </section>
  );
}
