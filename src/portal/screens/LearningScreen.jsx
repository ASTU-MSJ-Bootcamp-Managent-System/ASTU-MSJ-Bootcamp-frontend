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
export default function Learning({ people = [] }) {
  return (
    <div className="learning-list">
      {people.map((p) => {
        const n = p?.progress ?? 0;
        return (
          <div className="module" key={p.id}>
            <div className="module-copy">
              <b>{p.name}</b>
              <span>
                {n === 100 ? "Completed" : n < 10 ? "Upcoming" : "In progress"}
              </span>
            </div>
            <div className="bar">
              <i style={{ width: n + "%" }} />
            </div>
            <strong>{n}%</strong>
          </div>
        );
      })}
    </div>
  );
}
