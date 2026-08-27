import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpen,
  ClipboardList,
  Megaphone,
  Bell,
  ChevronDown,
  ArrowRight,
  Plus,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  FileText,
  UserMinus,
  UserCheck,
  CheckCircle2,
  Send,
  Trash2,
  Star,
} from "lucide-react";
import { Profile, Toolbar, Modal } from "../components/Shared";
export default function People({ role, people, setPeople }) {
  let [profile, setProfile] = useState(null),
    [open, setOpen] = useState(false),
    [draft, setDraft] = useState({
      name: "",
      email: "",
      mentor: "Dawit Birhanu",
    }),
    list =
      role === "mentor"
        ? people.filter((p) => p.mentor === "Dawit Birhanu")
        : people;
  function enroll(e) {
    e.preventDefault();
    setPeople([
      ...people,
      {
        ...draft,
        id: Date.now(),
        batch: "Frontend · Batch 03",
        status: "Active",
        attendance: 100,
        progress: 0,
      },
    ]);
    setOpen(false);
  }
  function save(v) {
    setPeople(people.map((q) => (q.id === profile.id ? { ...q, ...v } : q)));
  }
  return (
    <section className="panel work-panel">
      <Toolbar
        title={role === "admin" ? "People directory" : "Assigned students"}
        action={role === "admin" ? "Enroll student" : null}
        onAction={() => setOpen(true)}
      />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Mentor</th>
              <th>Attendance</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((x) => (
              <tr key={x.id}>
                <td>
                  <button
                    className="person person-link"
                    onClick={() => setProfile(x)}
                  >
                    <span>{x.name.slice(0, 2)}</span>
                    <div>
                      <b>{x.name}</b>
                      <small>{x.email}</small>
                    </div>
                  </button>
                </td>
                <td>{x.mentor}</td>
                <td>{x.attendance}%</td>
                <td>
                  <span
                    className={
                      "status " + (x.status === "Active" ? "green" : "amber")
                    }
                  >
                    {x.status}
                  </span>
                </td>
                <td className="actions">
                  {role === "admin" && (
                    <>
                      <button
                        onClick={() =>
                          setPeople(
                            people.map((q) =>
                              q.id === x.id
                                ? {
                                    ...q,
                                    status:
                                      q.status === "Active"
                                        ? "Suspended"
                                        : "Active",
                                  }
                                : q,
                            ),
                          )
                        }
                      >
                        {x.status === "Active" ? <UserMinus /> : <UserCheck />}
                      </button>
                      <button
                        onClick={() =>
                          setPeople(people.filter((q) => q.id !== x.id))
                        }
                      >
                        <Trash2 />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {profile && (
        <Profile
          x={profile}
          role={role}
          close={() => setProfile(null)}
          update={save}
        />
      )}{" "}
      {open && (
        <Modal title="Enroll a student" close={() => setOpen(false)}>
          <form onSubmit={enroll} className="stack-form">
            <label>
              Full name
              <input
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label>
              ASTU email
              <input
                required
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </label>
            <label>
              Assign mentor
              <select
                value={draft.mentor}
                onChange={(e) => setDraft({ ...draft, mentor: e.target.value })}
              >
                <option>Dawit Birhanu</option>
                <option>Meseret Desta</option>
              </select>
            </label>
            <button className="primary">Enroll student</button>
          </form>
        </Modal>
      )}
    </section>
  );
}
