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
export default function Attendance({ role, people }) {
  let [records, setRecords] = useState({});
  if (role === "student")
    return (
      <section className="panel work-panel">
        <Toolbar title="My attendance" />
        <div className="attendance-score">
          <b>{people[0].attendance}%</b>
          <span>23 of 25 sessions attended</span>
        </div>
      </section>
    );
  return (
    <section className="panel work-panel">
      <Toolbar
        title="Mark attendance"
        action="Save attendance"
        onAction={() => alert("Attendance saved.")}
      />
      {people
        .filter((p) => p.mentor === "Dawit Birhanu")
        .map((p) => (
          <div className="att-row" key={p.id}>
            <b>{p.name}</b>
            <select
              value={records[p.id] || "Present"}
              onChange={(e) =>
                setRecords({ ...records, [p.id]: e.target.value })
              }
            >
              <option>Present</option>
              <option>Late</option>
              <option>Absent</option>
              <option>Excused</option>
            </select>
          </div>
        ))}
    </section>
  );
}
