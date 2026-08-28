import { Intro, Status, Table } from "../components/ui";

export default function RequestsPage({
  data,
  update,
  approveRequest,
  rejectRequest,
}) {
  function approve(i) {
    let r = data.requests[i];
    if (approveRequest) {
      approveRequest(r);
    } else {
      let requests = data.requests.filter((_, x) => x !== i);
      r.role === "Mentor"
        ? update({
            requests,
            mentors: [...data.mentors, { name: r.name, email: r.email }],
          })
        : update({
            requests,
            students: [
              ...data.students,
              {
                ...r,
                mentor: "Unassigned",
                status: "Active",
                attendance: 0,
              },
            ],
          });
    }
  }

  function reject(i) {
    let r = data.requests[i];
    if (rejectRequest) {
      rejectRequest(r);
    } else {
      update({ requests: data.requests.filter((_, x) => x !== i) });
    }
  }

  return (
    <>
      <Intro
        title="Account approval queue"
        text="Requests are reviewed by administrators before access is granted."
      />
      <Table heads={["Applicant", "Role", "Requested batch", ""]}>
        {data.requests.map((r, i) => (
          <tr key={r._id || r.email}>
            <td className="px-4 py-4">
              <b className="block">{r.name}</b>
              <small className="text-xs text-stone-500">{r.email}</small>
            </td>
            <td>
              <Status>{r.role}</Status>
            </td>
            <td>{r.course}</td>
            <td className="whitespace-nowrap px-4 py-3 text-right">
              <button
                onClick={() => approve(i)}
                className="mr-2 inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                Approve
              </button>
              <button
                onClick={() => reject(i)}
                className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                Reject
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
