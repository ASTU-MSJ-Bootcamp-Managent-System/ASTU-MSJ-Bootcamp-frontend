import { useState } from "react";
import { Megaphone, Trash2 } from "lucide-react";
import { Toolbar, Modal } from "../components/Shared";

export default function News({
  role,
  token,
  announcements,
  setAnnouncements,
  batches,
  refresh,
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function publish(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "https://astu-msj-bootcamp-backend.onrender.com"}/api/announcements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: f.get("title"),
            body: f.get("body"),
            audience: f.get("audience"),
          }),
        },
      );
      await refresh();
      setOpen(false);
    } catch (err) {
      alert(err.message || "Failed to publish.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "https://astu-msj-bootcamp-backend.onrender.com"}/api/announcements/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await refresh();
    } catch (err) {
      alert(err.message || "Failed to delete.");
    }
  }

  return (
    <section className="panel work-panel">
      <Toolbar
        title="Announcements"
        action={role === "student" ? null : "New announcement"}
        onAction={() => setOpen(true)}
      />
      {announcements.length === 0 ? (
        <p className="empty-state">No announcements yet.</p>
      ) : (
        announcements.map((n) => (
          <article className="notice" key={n._id}>
            <div className="announce-mark">
              <Megaphone size={20} />
            </div>
            <div className="flex-1">
              <h3>{n.title}</h3>
              <p>{n.body}</p>
              <small>
                {n.audience} · {n.date}
              </small>
            </div>
            {role !== "student" && (
              <button
                className="delete-text"
                onClick={() => remove(n._id)}
                title="Delete announcement"
              >
                <Trash2 size={16} />
              </button>
            )}
          </article>
        ))
      )}

      {open && (
        <Modal title="New announcement" close={() => setOpen(false)}>
          <form className="stack-form" onSubmit={publish}>
            <label>
              Title
              <input name="title" required />
            </label>
            <label>
              Message
              <textarea name="body" required />
            </label>
            <label>
              Audience
              <select name="audience">
                {batches.map((b) => (
                  <option key={b._id} value={b.name}>
                    {b.name}
                  </option>
                ))}
                <option value="All">All bootcamp participants</option>
              </select>
            </label>
            <button className="primary" disabled={saving}>
              {saving ? "Publishing…" : "Publish announcement"}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
