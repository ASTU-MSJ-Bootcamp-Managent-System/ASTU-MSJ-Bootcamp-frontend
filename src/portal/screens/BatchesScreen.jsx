import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Toolbar, Modal } from "../components/Shared";

export default function Batches({
  role,
  token,
  batches,
  setBatches,
  people,
  refresh,
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function createBatch(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "https://astu-msj-bootcamp-backend.onrender.com"}/api/batches`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: f.get("name"),
            description: f.get("description") || f.get("name"),
            startDate: f.get("startDate") || new Date().toISOString(),
            endDate:
              f.get("endDate") ||
              new Date(Date.now() + 90 * 864e5).toISOString(),
          }),
        },
      );
      await refresh();
      setOpen(false);
    } catch (err) {
      alert(err.message || "Failed to create batch.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBatch(id) {
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "https://astu-msj-bootcamp-backend.onrender.com"}/api/batches/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await refresh();
    } catch (err) {
      alert(err.message || "Failed to delete batch.");
    }
  }

  return (
    <section className="panel work-panel">
      <Toolbar
        title="Bootcamp batches"
        action="Create batch"
        onAction={() => setOpen(true)}
      />
      {batches.length === 0 ? (
        <p className="empty-state">No batches yet.</p>
      ) : (
        <div className="batch-grid">
          {batches.map((b) => {
            const count = people.filter(
              (p) => p.batchId === b._id,
            ).length;
            const mentors = b.mentors || [];
            return (
              <article className="batch-card" key={b._id}>
                <button
                  onClick={() => deleteBatch(b._id)}
                  title="Delete batch"
                >
                  <Trash2 size={16} />
                </button>
                <h3>{b.name}</h3>
                <p>{count} enrolled students</p>
                <small>
                  {mentors.length > 0
                    ? `Mentor · ${mentors[0].name || "Assigned"}`
                    : "No mentor assigned"}
                </small>
              </article>
            );
          })}
        </div>
      )}

      {open && (
        <Modal title="Create a batch" close={() => setOpen(false)}>
          <form className="stack-form" onSubmit={createBatch}>
            <label>
              Batch name
              <input name="name" required />
            </label>
            <label>
              Description
              <input name="description" />
            </label>
            <label>
              Start date
              <input name="startDate" type="date" />
            </label>
            <label>
              End date
              <input name="endDate" type="date" />
            </label>
            <button className="primary" disabled={saving}>
              {saving ? "Creating…" : "Create batch"}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
