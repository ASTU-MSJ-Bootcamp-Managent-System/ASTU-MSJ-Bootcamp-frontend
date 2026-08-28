import { useState } from "react";
import { UserMinus, UserCheck } from "lucide-react";
import { Profile, Toolbar, Modal } from "../components/Shared";

export default function People({ role, me, people, setPeople, batches, assignMentor }) {
  const [profile, setProfile] = useState(null);
  const [assigning, setAssigning] = useState(null); // student._id being assigned

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
                    {x.mentor}
                    {assignMentor && (role === "mentor" || role === "admin") && x.batchId && (
                      <>
                        {assigning === x._id ? (
                          <select
                            className="ml-2 rounded border border-emerald-200 bg-white px-1.5 py-0.5 text-xs"
                            autoFocus
                            onChange={(e) => {
                              if (e.target.value) {
                                assignMentor(x, e.target.value);
                              }
                              setAssigning(null);
                            }}
                            onBlur={() => setAssigning(null)}
                          >
                            <option value="">Cancel</option>
                            {batchMentors.map((m) => (
                              <option key={m._id} value={m._id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button
                            onClick={() => setAssigning(x._id)}
                            className="ml-1 text-[10px] font-bold text-emerald-600 hover:underline"
                            title="Assign mentor"
                          >
                            ✎
                          </button>
                        )}
                      </>
                    )}
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
    </section>
  );
}
