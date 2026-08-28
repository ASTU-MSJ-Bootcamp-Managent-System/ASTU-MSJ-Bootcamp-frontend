import {
  CalendarCheck,
  ClipboardList,
  Star,
  TrendingUp,
} from "lucide-react";
import { Toolbar } from "../components/Shared";
import Learning from "./LearningScreen";

export default function Overview({
  role,
  me,
  people,
  assignments,
  submissions,
  attendance,
  progress,
  token,
  batches,
  refresh,
}) {
  /* ── Compute stats ────────────────────────────────────────────────── */
  const mySubs =
    role === "student"
      ? submissions.filter(
          (s) =>
            assignments.some((a) => a._id === s.assignmentId),
        )
      : [];
  const graded = mySubs.filter((s) => s.grade != null);
  const avgGrade = graded.length
    ? Math.round(graded.reduce((x, s) => x + s.grade, 0) / graded.length)
    : "—";

  const myAtt = attendance.filter(
    (a) => role === "student" && a.studentId === me?._id,
  );
  const attTotal = myAtt.length;
  const attPresent = myAtt.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE",
  ).length;
  const attPct = attTotal ? Math.round((attPresent / attTotal) * 100) : 0;

  const myProgress = progress.find((p) => p.studentId === me?._id);
  const progPct = myProgress
    ? myProgress.status === "COMPLETED"
      ? 100
      : myProgress.status === "IN_PROGRESS"
        ? 50
        : myProgress.status === "NEEDS_IMPROVEMENT"
          ? 30
          : 0
    : 0;

  const pendingReview =
    role !== "student"
      ? submissions.filter((s) => s.grade == null).length
      : 0;
  const assignedStudents =
    role === "mentor"
      ? people.filter((p) => p.mentorId === me?._id).length
      : 0;
  const needsAttention =
    role === "mentor"
      ? people.filter(
          (p) =>
            p.mentorId === me?._id &&
            (p.attendance < 80 || p.progress < 60),
        ).length
      : 0;

  const stats =
    role === "student"
      ? [
          ["Attendance", attPct + "%", "Your attendance"],
          ["Progress", progPct + "%", "Course progress"],
          ["Average grade", avgGrade, "Reviewed work"],
          [
            "Open assignments",
            assignments.length - mySubs.length,
            "Awaiting submission",
          ],
        ]
      : role === "mentor"
        ? [
            ["Assigned students", assignedStudents, "Your mentees"],
            ["Pending reviews", pendingReview, "Requires grading"],
            ["Needs attention", needsAttention, "Follow up soon"],
            [
              "Announcements",
              assignments.length,
              "Active assignments",
            ],
          ]
        : [
            [
              "Active students",
              people.filter((p) => p.status === "Active").length,
              "Across all batches",
            ],
            ["Pending reviews", pendingReview, "Awaiting grading"],
            [
              "Avg attendance",
              people.length
                ? Math.round(
                    people.reduce((x, p) => x + p.attendance, 0) /
                      people.length,
                  ) + "%"
                : "—",
              "All students",
            ],
            ["Announcements", 0, ""],
          ];

  const iconList = [CalendarCheck, TrendingUp, Star, ClipboardList];
  const iconClass = ["att", "prog", "grade", "open"];

  return (
    <>
      <section className="stats">
        {stats.map(([label, value, sub], i) => (
          <article className="stat" key={label}>
            <div className={"stat-icon " + iconClass[i]}>
              {(() => {
                const Ico = iconList[i];
                return <Ico />;
              })()}
            </div>
            <div>
              <p>{label}</p>
              <h2>{value}</h2>
              <small>{sub}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="panel work-panel mt-6">
        <Toolbar
          title={
            role === "student"
              ? "My learning"
              : role === "mentor"
                ? "Mentee progress"
                : "Student progress"
          }
        />
        <Learning people={people} progress={progress} role={role} me={me} token={token} batches={batches} refresh={refresh} />
      </section>
    </>
  );
}
