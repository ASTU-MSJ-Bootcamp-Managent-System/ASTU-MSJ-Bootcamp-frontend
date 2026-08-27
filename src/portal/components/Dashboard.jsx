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
} from "lucide-react";
import { Mark } from "./Auth";
import ScreenRouter from "../screens/ScreenRouter";
const icons = {
  Overview: LayoutDashboard,
  Students: Users,
  People: Users,
  "Enrollment requests": UserCheck,
  Attendance: CalendarCheck,
  Assignments: ClipboardList,
  "My learning": BookOpen,
  Progress: BookOpen,
  Announcements: Megaphone,
  Batches: ClipboardList,
};
export default function Dashboard(props) {
  const [active, setActive] = useState("Overview");
  const [menu, setMenu] = useState(false);
  const nav =
    props.role === "student"
      ? [
          "Overview",
          "My learning",
          "Attendance",
          "Assignments",
          "Announcements",
        ]
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
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
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
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${active === name ? "bg-white/15 font-semibold" : "text-emerald-50/75 hover:bg-white/10"}`}
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
          className="mt-auto flex items-center gap-2 text-sm text-emerald-50/80"
          onClick={props.logout}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>
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
            <Bell size={19} />
            <span className="grid size-9 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
              {props.role === "student"
                ? "MT"
                : props.role === "mentor"
                  ? "DB"
                  : "SA"}
            </span>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-5 md:p-8">
          {props.dataError && (
            <p className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              Unable to load the latest workspace data: {props.dataError}
            </p>
          )}
          <section className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest text-emerald-700">
                {props.role === "admin"
                  ? "PROGRAMME ADMINISTRATION"
                  : props.role === "mentor"
                    ? "MENTOR WORKSPACE"
                    : "FRONTEND DEVELOPMENT · BATCH 03"}
              </p>
              <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-900">
                {active === "Overview"
                  ? props.role === "student"
                    ? "Good morning, Mekdes"
                    : props.role === "mentor"
                      ? "Welcome back, Dawit"
                      : "Bootcamp pulse"
                  : active}
              </h1>
              <p className="mt-2 text-slate-500">
                Live information from your bootcamp workspace.
              </p>
            </div>
            <span className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 sm:flex">
              <CalendarCheck size={16} />
              August 26, 2025
            </span>
          </section>
          <ScreenRouter active={active} {...props} />
        </div>
      </main>
    </div>
  );
}
