import { UserCheck } from "lucide-react";
import { Toolbar } from "../components/Shared";

export default function EnrollmentRequestsScreen({ requests, approveRequest }) {
  return (
    <section className="panel work-panel">
      <Toolbar title="Enrollment requests" />
      {requests.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Approval owner</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <b>{request.name}</b>
                  </td>
                  <td>{request.email}</td>
                  <td>{request.reviewer || "Bootcamp administrator"}</td>
                  <td className="actions">
                    <button
                      title="Approve enrollment"
                      onClick={() => approveRequest(request)}
                    >
                      <UserCheck />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">
          There are no enrollment requests waiting for admin approval.
        </p>
      )}
    </section>
  );
}
