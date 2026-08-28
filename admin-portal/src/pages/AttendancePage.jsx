import { Intro, Status, Table } from "../components/ui";

const statusTone = {
  PRESENT: "green",
  LATE: "amber",
  ABSENT: "red",
  EXCUSED: "green",
};

const statusLabel = {
  PRESENT: "Present",
  LATE: "Late",
  ABSENT: "Absent",
  EXCUSED: "Excused",
};

export default function AttendancePage({
  data,
  open,
  ask,
  deleteAttendance,
}) {
  return (
    <>
      <Intro
        title="Attendance records"
        text="Track and manage individual student attendance for every bootcamp session."
        action={() => open("attendance")}
      >
        Record attendance
      </Intro>

      {data.attendance.length === 0 ? (
        <div className="rounded-xl border border-emerald-100 bg-white p-8 text-center">
          <p className="text-sm text-stone-400">
            No attendance records yet. Click "Record attendance" to get started.
          </p>
        </div>
      ) : (
        <Table heads={["Student", "Batch", "Date", "Status", "Note", ""]}>
          {data.attendance.map((a, i) => (
            <tr key={a._id || i}>
              <td className="px-4 py-3">
                <b className="block text-sm">{a.studentName}</b>
              </td>
              <td className="px-4 py-3 text-sm">{a.batchName}</td>
              <td className="px-4 py-3 font-semibold text-sm">{a.date}</td>
              <td className="px-4 py-3">
                <Status tone={statusTone[a.status] || "green"}>
                  {statusLabel[a.status] || a.status}
                </Status>
              </td>
              <td className="px-4 py-3 text-sm text-stone-500 max-w-[200px] truncate">
                {a.note || "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <button
                  onClick={() => open("attendance", i)}
                  className="mr-3 font-bold text-emerald-700"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    ask("Delete this attendance record?", () =>
                      deleteAttendance
                        ? deleteAttendance(a)
                        : undefined,
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
      )}
    </>
  );
}
