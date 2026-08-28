import { useState } from "react";
import { Intro, Status, Table } from "../components/ui";

export default function PeoplePage({
  data,
  update,
  open,
  ask,
  promoteStudent,
  approveStudent,
  removeStudent,
  assignMentor,
  enrollStudent,
  removeMentor,
}) {
  const [assigning, setAssigning] = useState(null);
  const [enrolling, setEnrolling] = useState(null);

  return (
    <>
      <Intro
        title="People & access"
        text="Manage enrolled students, mentor assignments and account access."
        action={() => open("student")}
      >
        Enroll student
      </Intro>
      <Table
        heads={["Student", "Batch", "Mentor", "Attendance", "Status", ""]}
      >
        {data.students.map((s, i) => (
          <tr key={s._id || s.email}>
            <td className="px-4 py-4">
              <b className="block">{s.name}</b>
              <small className="text-xs text-stone-500">{s.email}</small>
            </td>
            <td>
              {s.course}
              {!s._batchId && enrollStudent && (
                <>
                  {enrolling === i ? (
                    <select
                      className="ml-2 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-xs"
                      autoFocus
                      onChange={(e) => {
                        if (e.target.value) {
                          enrollStudent(s, e.target.value);
                        }
                        setEnrolling(null);
                      }}
                      onBlur={() => setEnrolling(null)}
                    >
                      <option value="">Cancel</option>
                      {data.courses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => setEnrolling(i)}
                      className="ml-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 hover:bg-amber-100"
                    >
                      + Enroll
                    </button>
                  )}
                </>
              )}
            </td>
            <td>
              {s.mentor}
              {assignMentor && s._batchId && (
                <>
                  {assigning === i ? (
                    <select
                      className="ml-2 rounded border border-emerald-200 bg-white px-1.5 py-0.5 text-xs"
                      autoFocus
                      onChange={(e) => {
                        if (e.target.value) {
                          assignMentor(s, e.target.value);
                        }
                        setAssigning(null);
                      }}
                      onBlur={() => setAssigning(null)}
                    >
                      <option value="">Cancel</option>
                      {data.mentors.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => setAssigning(i)}
                      className="ml-1 text-[10px] font-bold text-emerald-600 hover:underline"
                      title="Assign mentor"
                    >
                      ✎
                    </button>
                  )}
                </>
              )}
            </td>
            <td>{s.attendance}%</td>
            <td>
              <Status tone={s.status === "Active" ? "green" : "red"}>
                {s.status}
              </Status>
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right">
              <button
                onClick={() => open("student", i)}
                className="mr-2 rounded-md px-2.5 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                Edit
              </button>
              <button
                onClick={() =>
                  promoteStudent
                    ? ask(
                        `Promote ${s.name} to mentor? They will no longer appear in the student roster.`,
                        () => promoteStudent(s),
                      )
                    : update({
                        students: data.students.filter(
                          (_, itemIndex) => itemIndex !== i,
                        ),
                        mentors: [
                          ...data.mentors,
                          { name: s.name, email: s.email },
                        ],
                      })
                }
                className="mr-2 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-sky-800 transition hover:bg-sky-100"
              >
                Make mentor
              </button>
              {s.status !== "Active" && approveStudent && (
                <button
                  onClick={() =>
                    ask(
                      `Approve ${s.name}'s account?`,
                      () => approveStudent(s),
                    )
                  }
                  className="mr-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                >
                  Approve
                </button>
              )}
              <button
                onClick={() =>
                  ask("Remove this student and their system access?", () =>
                    removeStudent
                      ? removeStudent(s)
                      : update({
                          students: data.students.filter((_, n) => n !== i),
                        }),
                  )
                }
                className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </Table>
      <div className="mt-8 flex justify-between">
        <h2 className="font-display text-2xl">Mentors</h2>
        <button
          onClick={() => open("mentor")}
          className="rounded-lg border px-3 py-2 text-sm font-bold"
        >
          Add mentor
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {data.mentors.map((m, i) => (
          <article
            key={m._id || m.email}
            className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white p-4"
          >
            <div>
              <b className="block text-sm">{m.name}</b>
              <small className="text-xs text-stone-500">{m.email}</small>
            </div>
            <button
              onClick={() =>
                ask(
                  "Remove this mentor? Assigned students will become unassigned.",
                  () =>
                    removeMentor
                      ? removeMentor(m)
                      : update({
                          mentors: data.mentors.filter((_, n) => n !== i),
                          students: data.students.map((s) =>
                            s.mentor === m.name
                              ? { ...s, mentor: "Unassigned" }
                              : s,
                          ),
                        }),
                )
              }
              className="font-bold text-rose-700"
            >
              Remove
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
