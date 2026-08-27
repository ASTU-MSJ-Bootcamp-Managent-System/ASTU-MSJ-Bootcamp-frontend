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
export default function Batches({ batches, setBatches }) {
  let [open, setOpen] = useState(false);
  return (
    <section className="panel work-panel">
      <Toolbar
        title="Bootcamp batches"
        action="Create batch"
        onAction={() => setOpen(true)}
      />
      <div className="batch-grid">
        {batches.map((b) => (
          <article className="batch-card" key={b.id}>
            <button
              onClick={() => setBatches(batches.filter((x) => x.id !== b.id))}
            >
              <Trash2 size={16} />
            </button>
            <h3>{b.name}</h3>
            <p>{b.students} enrolled students</p>
            <small>Mentor · {b.mentor}</small>
          </article>
        ))}
      </div>
      {open && (
        <Modal title="Create a batch" close={() => setOpen(false)}>
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              let f = new FormData(e.currentTarget);
              setBatches([
                ...batches,
                {
                  id: Date.now(),
                  name: f.get("name"),
                  students: 0,
                  mentor: "Unassigned",
                },
              ]);
              setOpen(false);
            }}
          >
            <label>
              Batch name
              <input name="name" required />
            </label>
            <button className="primary">Create batch</button>
          </form>
        </Modal>
      )}
    </section>
  );
}
