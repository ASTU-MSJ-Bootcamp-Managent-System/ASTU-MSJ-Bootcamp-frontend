import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpen,
  ClipboardList,
  Megaphone,
  Bell,
  ChevronDown,
  ArrowRight,
  Plus,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  FileText,
  UserMinus,
  UserCheck,
  CheckCircle2,
  Send,
  Trash2,
  Star,
} from "lucide-react";
import { Profile, Toolbar, Modal } from "../components/Shared";
export default function News({ role, news, setNews }) {
  let [open, setOpen] = useState(false);
  function publish(e) {
    e.preventDefault();
    let f = new FormData(e.currentTarget);
    setNews([
      {
        id: Date.now(),
        title: f.get("title"),
        body: f.get("body"),
        audience: f.get("audience"),
        date: "Just now",
      },
      ...news,
    ]);
    setOpen(false);
  }
  return (
    <section className="panel work-panel">
      <Toolbar
        title="Announcements"
        action={role === "student" ? null : "New announcement"}
        onAction={() => setOpen(true)}
      />
      {news.map((n) => (
        <article className="notice" key={n.id}>
          <div className="announce-mark">
            <Megaphone size={20} />
          </div>
          <div>
            <h3>{n.title}</h3>
            <p>{n.body}</p>
            <small>
              {n.audience} · {n.date}
            </small>
          </div>
          {role !== "student" && (
            <button
              className="delete-text"
              onClick={() => setNews(news.filter((x) => x.id !== n.id))}
            >
              <Trash2 size={16} />
            </button>
          )}
        </article>
      ))}
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
                <option>Frontend · Batch 03</option>
                <option>All bootcamp participants</option>
              </select>
            </label>
            <button className="primary">Publish announcement</button>
          </form>
        </Modal>
      )}
    </section>
  );
}
