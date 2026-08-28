import { useState } from "react";
import { UserMinus, UserCheck } from "lucide-react";
import { Profile, Toolbar, Modal } from "../components/Shared";

export default function People({ role, me, people, setPeople }) {
  const [profile, setProfile] = useState(null);

  /* Filter based on role */
  const list =
    role === "mentor"
      ? people.filter((p) => p.mentorId === me?._id)
      : people;

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
                  <td>{x.mentor}</td>
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
