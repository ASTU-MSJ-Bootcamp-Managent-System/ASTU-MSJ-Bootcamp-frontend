import { Intro, Status, Table } from "../components/ui";
export default function PeoplePage({
  data,
  update,
  open,
  ask,
  promoteStudent: promoteStudentApi,
  setStudentActive,
  removeStudent,
}) {
  function promoteStudent(student, index) {
    ask(
      `Promote ${student.name} to mentor? They will no longer appear in the student roster.`,
      async () => {
        if (promoteStudentApi) return promoteStudentApi(student);
        update({
          students: data.students.filter((_, itemIndex) => itemIndex !== index),
          mentors: [
            ...data.mentors,
            { name: student.name, email: student.email },
          ],
        });
      },
    );
  }

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
        heads={["Student", "Course", "Mentor", "Attendance", "Status", ""]}
      >
        {data.students.map((s, i) => (
          <tr key={s.email}>
            <td className="px-4 py-4">
              <b className="block">{s.name}</b>
              <small className="text-xs text-stone-500">{s.email}</small>
            </td>
            <td>{s.course}</td>
            <td>{s.mentor}</td>
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
                onClick={() => promoteStudent(s, i)}
                className="mr-2 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-sky-800 transition hover:bg-sky-100"
              >
                Make mentor
              </button>
              <button
                onClick={() =>
                  setStudentActive
                    ? setStudentActive(s, s.status !== "Active")
                    : update({
                        students: data.students.map((x, n) =>
                          n === i
                            ? {
                                ...x,
                                status:
                                  x.status === "Active"
                                    ? "Suspended"
                                    : "Active",
                              }
                            : x,
                        ),
                      })
                }
                className={`mr-2 rounded-md px-2.5 py-1.5 text-xs font-bold transition ${
                  s.status === "Active"
                    ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                {s.status === "Active" ? "Suspend" : "Restore"}
              </button>
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
            key={m.email}
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
                    update({
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
