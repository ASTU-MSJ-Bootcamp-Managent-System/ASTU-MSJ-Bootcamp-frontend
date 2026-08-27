import { Modal } from "./Modal";
import { Button, input } from "./ui";
export default function Editor({ type, index, data, update, close }) {
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
          old?.[name] ??
          (name === "capacity" ? 30 : name === "attendance" ? 0 : "")
        }
        required
        {...props}
      />
    </label>
  );
  function save(e) {
    e.preventDefault();
    let v = Object.fromEntries(new FormData(e.currentTarget));
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
      ["present", "late", "absent"].forEach((k) => (v[k] = +v[k]));
      update({
        attendance: old
          ? data.attendance.map((x, i) => (i === index ? v : x))
          : [v, ...data.attendance],
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
                Course
                <select
                  name="course"
                  defaultValue={old?.course || data.courses[0]?.name}
                  className={input}
                >
                  {data.courses.map((c) => (
                    <option key={c.code}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold">
                Mentor
                <select
                  name="mentor"
                  defaultValue={old?.mentor || data.mentors[0]?.name}
                  className={input}
                >
                  <option>Unassigned</option>
                  {data.mentors.map((m) => (
                    <option key={m.email}>{m.name}</option>
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
            {field("Course name", "name")}
            {field("Course code", "code")}
            {field("Capacity", "capacity", { type: "number", min: 1 })}
          </>
        )}
        {type === "attendance" && (
          <>
            {field("Date", "date")}
            {field("Batch", "batch")}
            <div className="grid gap-4 sm:grid-cols-3">
              {field("Present", "present", { type: "number", min: 0 })}
              {field("Late", "late", { type: "number", min: 0 })}
              {field("Absent", "absent", { type: "number", min: 0 })}
            </div>
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
