import { Modal } from "./Modal";
import { Button, input } from "./ui";

export default function Editor({ type, index, data, update, close, onSave }) {
  let old =
    index === undefined
      ? null
      : type === "student"
        ? data.students[index]
        : type === "course"
          ? data.courses[index]
          : type === "attendance"
            ? data.attendance[index]
            : null;

  let field = (label, name, props = {}) => (
    <label className="block text-xs font-bold">
      {label}
      <input
        className={input}
        name={name}
        defaultValue={
          old?.[name] ?? (name === "capacity" ? 30 : "")
        }
        required
        {...props}
      />
    </label>
  );

  function save(e) {
    e.preventDefault();
    let v = Object.fromEntries(new FormData(e.currentTarget));

    if (onSave) {
      if (type === "student") {
        v.attendance = +v.attendance;
        const matchedCourse = data.courses.find((c) => c.name === v.course);
        v._batchId = matchedCourse?._id || null;
      }
      if (type === "course") {
        v.capacity = +v.capacity;
      }
      if (type === "attendance") {
        /* Resolve IDs from selected names */
        const matchedStudent = data.students.find((s) => s.name === v.student);
        const matchedCourse = data.courses.find((c) => c.name === v.batch);
        v.studentId = matchedStudent?._id || old?.studentId || null;
        v.batchId = matchedCourse?._id || old?.batchId || null;
        v.status = v.status || "PRESENT";
      }
      onSave(type, index, v);
      return;
    }

    /* Fallback: local-only update (no API) */
    if (type === "student") {
      v.attendance = +v.attendance;
      update({
        students: old
          ? data.students.map((x, i) => (i === index ? v : x))
          : [...data.students, v],
      });
    }
    if (type === "mentor") update({ mentors: [...data.mentors, v] });
    if (type === "course") {
      v.capacity = +v.capacity;
      update({
        courses: old
          ? data.courses.map((x, i) => (i === index ? v : x))
          : [...data.courses, v],
        students: old
          ? data.students.map((s) =>
              s.course === old.name ? { ...s, course: v.name } : s,
            )
          : data.students,
      });
    }
    if (type === "attendance") {
      const matchedStudent = data.students.find((s) => s.name === v.student);
      const matchedCourse = data.courses.find((c) => c.name === v.batch);
      update({
        attendance: old
          ? data.attendance.map((x, i) => (i === index ? v : x))
          : [
              {
                _id: Date.now().toString(),
                studentId: matchedStudent?._id,
                studentName: v.student,
                batchId: matchedCourse?._id,
                batchName: v.batch,
                date: v.date,
                status: v.status,
                note: v.note || "",
              },
              ...data.attendance,
            ],
      });
    }
    close();
  }

  return (
    <Modal title={(old ? "Edit " : "Add ") + type} onClose={close}>
      <form onSubmit={save} className="space-y-4">
        {type === "student" && (
          <>
            {field("Full name", "name")}
            {field("Email address", "email", { type: "email" })}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold">
                Batch
                <select
                  name="course"
                  defaultValue={old?.course || data.courses[0]?.name || ""}
                  className={input}
                >
                  <option value="">Unassigned</option>
                  {data.courses.map((c) => (
                    <option key={c._id || c.code}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold">
                Mentor
                <select
                  name="mentor"
                  defaultValue={old?.mentor || data.mentors[0]?.name || ""}
                  className={input}
                >
                  <option>Unassigned</option>
                  {data.mentors.map((m) => (
                    <option key={m._id || m.email}>{m.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-xs font-bold">
              Status
              <select
                name="status"
                defaultValue={old?.status || "Active"}
                className={input}
              >
                <option>Active</option>
                <option>Suspended</option>
              </select>
            </label>
            {field("Attendance %", "attendance", {
              type: "number",
              min: 0,
              max: 100,
            })}
          </>
        )}

        {type === "mentor" && (
          <>
            {field("Full name", "name")}
            {field("Work email", "email", { type: "email" })}
          </>
        )}

        {type === "course" && (
          <>
            {field("Batch name", "name")}
            {field("Description", "description")}
            <div className="grid gap-4 sm:grid-cols-2">
              {field("Start date", "startDate", { type: "date" })}
              {field("End date", "endDate", { type: "date" })}
            </div>
          </>
        )}

        {type === "attendance" && (
          <>
            {/* Student selector */}
            <label className="block text-xs font-bold">
              Student
              <select
                name="student"
                defaultValue={old?.studentName || ""}
                className={input}
                required
              >
                <option value="">Select student…</option>
                {data.students.map((s) => (
                  <option key={s._id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Batch selector */}
            <label className="block text-xs font-bold">
              Batch
              <select
                name="batch"
                defaultValue={old?.batchName || data.courses[0]?.name || ""}
                className={input}
                required
              >
                {data.courses.map((c) => (
                  <option key={c._id || c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Date */}
            {field("Date", "date", {
              type: "date",
              defaultValue: old?.date || new Date().toISOString().split("T")[0],
            })}

            {/* Status enum */}
            <label className="block text-xs font-bold">
              Status
              <select
                name="status"
                defaultValue={old?.status || "PRESENT"}
                className={input}
                required
              >
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="ABSENT">Absent</option>
                <option value="EXCUSED">Excused</option>
              </select>
            </label>

            {/* Note */}
            <label className="block text-xs font-bold">
              Note (optional)
              <input
                className={input}
                name="note"
                defaultValue={old?.note || ""}
                placeholder="e.g. Participated actively"
              />
            </label>
          </>
        )}

        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={close}
            className="rounded-lg border px-4 py-2"
          >
            Cancel
          </button>
          <Button>Save changes</Button>
        </div>
      </form>
    </Modal>
  );
}
