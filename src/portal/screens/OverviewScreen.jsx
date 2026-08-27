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
import Learning from "./LearningScreen";
export default function Overview({ role, people = [], assignments = [] }) {
  let me = people[0] || {},
    mine = assignments
      .map((a) => (a.submissions || []).find((s) => s.studentId === 1))
      .filter(Boolean),
    grades = mine.filter((s) => s.grade != null),
    avg = grades.length
      ? Math.round(grades.reduce((x, s) => x + s.grade, 0) / grades.length)
      : "—",
    course = people.length
      ? Math.round(people.reduce((x, p) => x + (p?.progress || 0), 0) / people.length)
      : 0,
    pending = assignments.reduce(
      (x, a) => x + (a.submissions || []).filter((s) => s.grade == null).length,
      0,
    );
  let s =
    role === "student"
      ? [
          [
            "Attendance",
            me.attendance != null ? me.attendance + "%" : "—",
            "Current attendance",
          ],
          [
            "Learning progress",
            me.progress != null ? me.progress + "%" : "—",
            "Actual course progress",
          ],
          ["Average grade", avg, "Reviewed work"],
          [
            "Open assignments",
            assignments.length - mine.length,
            "Awaiting submission",
          ],
        ]
      : role === "mentor"
        ? [
            ["Assigned students", people.length, "Frontend Batch 03"],
            ["Course progress", course + "%", "Cohort average"],
            ["Pending reviews", pending, "Requires grading"],
            [
              "Needs attention",
              people.filter((p) => (p?.progress ?? 0) < 60 || (p?.attendance ?? 0) < 80).length,
              "Follow up soon",
            ],
          ]
        : [
            [
              "Active students",
              people.filter((p) => p?.status === "Active").length,
              "Across all batches",
            ],
            ["Mentors", "12", "Across 4 tracks"],
            [
              "Average attendance",
              people.length
                ? Math.round(
                    people.reduce((x, p) => x + (p?.attendance || 0), 0) / people.length,
                  ) + "%"
                : "—",
              "Current cohort",
            ],
            ["Open submissions", pending, "Awaiting review"],
          ];
  return (
    <>
      <section className="stats">
        {s.map(([a, b, c], i) => (
          <article className="stat" key={a}>
            <div className={"stat-icon " + ["att", "prog", "grade", "open"][i]}>
              {
                [
                  <CalendarCheck />,
                  <TrendingUp />,
                  <Star />,
                  <ClipboardList />,
                ][i]
              }
            </div>
            <div>
              <p>{a}</p>
              <h2>{b}</h2>
              <small>{c}</small>
            </div>
          </article>
        ))}
      </section>
      <section className="panel work-panel">
        <Toolbar
          title={role === "mentor" ? "Course progress" : "Learning progress"}
        />
        <Learning people={people} />
      </section>
    </>
  );
}
