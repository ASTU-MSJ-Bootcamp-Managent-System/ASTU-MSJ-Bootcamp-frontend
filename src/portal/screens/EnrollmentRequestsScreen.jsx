import { useState } from "react";
import { UserCheck, UserX } from "lucide-react";
import { Toolbar } from "../components/Shared";

export default function EnrollmentRequestsScreen({
  role,
  token,
  people,
  setPeople,
  refresh,
}) {
  const [processing, setProcessing] = useState(null);

  /* Requests = unapproved users (status !== "Active") */
  const requests = people.filter((p) => p.status !== "Active");

  async function approve(person) {
    setProcessing(person._id);
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "https://astu-msj-bootcamp-backend.onrender.com"}/api/users/${person._id}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      await refresh();
    } catch (err) {
      alert(err.message || "Failed to approve.");
    } finally {
      setProcessing(null);
    }
  }

  async function reject(person) {
    setProcessing(person._id);
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "https://astu-msj-bootcamp-backend.onrender.com"}/api/users/${person._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await refresh();
    } catch (err) {
      alert(err.message || "Failed to reject.");
    } finally {
      setProcessing(null);
    }
  }

  return (
    <section className="panel work-panel">
      <Toolbar title="Enrollment requests" />
      {requests.length === 0 ? (
        <p className="empty-state">
          There are no enrollment requests waiting for approval.
        </p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>
                    <b>{r.name}</b>
                  </td>
                  <td>{r.email}</td>
                  <td>{r.role}</td>
                  <td className="actions">
                    <button
                      title="Approve"
                      disabled={processing === r._id}
                      onClick={() => approve(r)}
                    >
                      <UserCheck />
                    </button>
                    <button
                      title="Reject"
                      disabled={processing === r._id}
                      onClick={() => reject(r)}
                    >
                      <UserX />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
