import { Intro, Table } from "../components/ui";
export default function AttendancePage({ data, update, open, ask }) {
  return (
    <>
      <Intro
        title="Attendance history"
        text="Record and correct attendance for every bootcamp session."
        action={() => open("attendance")}
      >
        Record attendance
      </Intro>
      <Table heads={["Date", "Batch", "Present", "Late", "Absent", ""]}>
        {data.attendance.map((a, i) => (
          <tr key={i}>
            <td className="px-4 py-4 font-semibold">{a.date}</td>
            <td>{a.batch}</td>
            <td>{a.present}</td>
            <td>{a.late}</td>
            <td>{a.absent}</td>
            <td className="text-right">
              <button
                onClick={() => open("attendance", i)}
                className="mr-3 font-bold text-emerald-700"
              >
                Edit
              </button>
              <button
                onClick={() =>
                  ask("Delete this attendance record?", () =>
                    update({
                      attendance: data.attendance.filter((_, n) => n !== i),
                    }),
                  )
                }
                className="font-bold text-rose-700"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
