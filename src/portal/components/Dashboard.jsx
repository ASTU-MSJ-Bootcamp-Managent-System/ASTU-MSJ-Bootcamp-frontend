import { useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  UserCheck,
  Users,
  X,
  Settings,
} from "lucide-react";
import { Mark } from "./Auth";
import ScreenRouter from "../screens/ScreenRouter";

const icons = {
  Overview: LayoutDashboard,
  Students: Users,
  People: Users,
  Attendance: CalendarCheck,
  Assignments: ClipboardList,
  "My learning": BookOpen,
  Progress: BookOpen,
  Announcements: Megaphone,
  Batches: ClipboardList,
  "Enrollment requests": UserCheck,
  Profile: Settings,
};

export default function Dashboard(props) {
  const [active, setActive] = useState("Overview");
  const [menu, setMenu] = useState(false);

  const nav =
    props.role === "student"
      ? ["Overview", "My learning", "Attendance", "Assignments", "Announcements"]
      : props.role === "mentor"
        ? [
            "Overview",
            "Students",
            "Attendance",
            "Assignments",
            "Progress",
            "Announcements",
          ]
        : [
            "Overview",
            "People",
            "Enrollment requests",
            "Batches",
            "Attendance",
            "Assignments",
            "Announcements",
          ];

  const initials = (props.me?.name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={`${menu ? "fixed inset-y-0 left-0 z-30 w-72" : "hidden"} bg-emerald-950 p-5 text-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col`}
      >
        <div className="flex items-center gap-3">
          <Mark />
          <div>
            <b>MSJ Bootcamp</b>
            <small className="block text-xs text-emerald-100/70">
              ASTU · Summer 2025
            </small>
          </div>
          <button className="ml-auto md:hidden" onClick={() => setMenu(false)}>
            <X />
          </button>
        </div>

        <nav className="mt-10 space-y-1">
          {nav.map((name) => {
            const Icon = icons[name];
            return (
              <button
                key={name}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                  active === name
                    ? "bg-white/15 font-semibold"
                    : "text-emerald-50/75 hover:bg-white/10"
                }`}
                onClick={() => {
                  setActive(name);
                  setMenu(false);
                }}
              >
                <Icon size={18} />
                {name}
              </button>
            );
          })}
        </nav>

        <button
          className="mt-auto flex items-center gap-2 text-sm text-emerald-50/80 hover:text-white"
          onClick={props.logout}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
          <button className="md:hidden" onClick={() => setMenu(true)}>
            <Menu />
          </button>
          <div className="hidden items-center gap-1 text-sm font-medium md:flex">
            {active}
            <ChevronDown size={15} />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={() => setActive("Profile")}
              className="flex items-center gap-2 rounded-lg p-1 transition hover:bg-slate-100"
              title="Profile & security"
            >
              <span className="grid size-9 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                {initials}
              </span>
              <span className="hidden text-sm font-medium md:block">
                {props.me?.name || "User"}
              </span>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-5 md:p-8">
          {props.loading && (
            <p className="mb-5 text-xs font-semibold text-slate-400">
              Loading workspace data…
            </p>
          )}

          <section className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest text-emerald-700">
                {props.role === "mentor"
                  ? "MENTOR WORKSPACE"
                  : "FRONTEND DEVELOPMENT · BATCH 03"}
              </p>
              <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-900">
                {active === "Overview"
                  ? `Welcome, ${(props.me?.name || "there").split(" ")[0]}`
                  : active}
              </h1>
              <p className="mt-2 text-slate-500">
                Live information from your bootcamp workspace.
              </p>
            </div>
          </section>

          <ScreenRouter active={active} {...props} />
        </div>
      </main>
    </div>
  );
}
