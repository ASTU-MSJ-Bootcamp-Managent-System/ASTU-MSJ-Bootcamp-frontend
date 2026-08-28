import { useState } from "react";
import { Megaphone, Trash2, Edit3 } from "lucide-react";
import { Toolbar, Modal } from "../components/Shared";
import {
  createAnnouncement as apiCreateAnnouncement,
  updateAnnouncement as apiUpdateAnnouncement,
  deleteAnnouncement as apiDeleteAnnouncement,
} from "../../api/client";

const audienceLabel = {
  ALL: "All",
  MENTORS: "Mentors",
  STUDENTS: "Students",
};

export default function News({
  role,
  token,
  announcements,
  setAnnouncements,
  batches,
  refresh,
}) {
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);

  async function publish(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await apiCreateAnnouncement(token, {
        title: f.get("title"),
        content: f.get("content"),
        targetAudience: f.get("targetAudience"),
      });
      await refresh();
      setOpen(false);
    } catch (err) {
      alert(err.message || "Failed to publish.");
    } finally {
      setSaving(false);
    }
  }

  async function updateItem(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await apiUpdateAnnouncement(token, editItem._id, {
        title: f.get("title"),
        content: f.get("content"),
        targetAudience: f.get("targetAudience"),
      });
      await refresh();
      setEditItem(null);
    } catch (err) {
      alert(err.message || "Failed to update.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    try {
      await apiDeleteAnnouncement(token, id);
      await refresh();
    } catch (err) {
      alert(err.message || "Failed to delete.");
    }
  }

  const isAdmin = role === "admin";

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
              <p>{n.content}</p>
              <small>
                {audienceLabel[n.targetAudience] || n.targetAudience || "All"}
                {n.batchName ? ` · ${n.batchName}` : ""}
                {" · "}
                {n.date}
                {n.author ? ` · by ${n.author}` : ""}
              </small>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-1">
                <button
                  className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                  onClick={() => setEditItem(n)}
                  title="Edit announcement"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  className="delete-text"
                  onClick={() => {
                    if (confirm("Delete this announcement?")) remove(n._id);
                  }}
                  title="Delete announcement"
                >
                  <Trash2 size={16} />
                </button>
              </div>
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
              Content
              <textarea name="content" required />
            </label>
            <label>
              Target Audience
              <select name="targetAudience">
                <option value="ALL">All bootcamp participants</option>
                <option value="MENTORS">Mentors only</option>
                <option value="STUDENTS">Students only</option>
              </select>
            </label>
            <button className="primary" disabled={saving}>
              {saving ? "Publishing…" : "Publish announcement"}
            </button>
          </form>
        </Modal>
      )}

      {editItem && (
        <Modal title="Edit announcement" close={() => setEditItem(null)}>
          <form className="stack-form" onSubmit={updateItem}>
            <label>
              Title
              <input name="title" defaultValue={editItem.title} required />
            </label>
            <label>
              Content
              <textarea name="content" defaultValue={editItem.content} required />
            </label>
            <label>
              Target Audience
              <select
                name="targetAudience"
                defaultValue={editItem.targetAudience || "ALL"}
              >
                <option value="ALL">All bootcamp participants</option>
                <option value="MENTORS">Mentors only</option>
                <option value="STUDENTS">Students only</option>
              </select>
            </label>
            <button className="primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
