import { Toolbar } from "../components/Shared";

const statusLabel = {
  COMPLETED: "Completed",
  IN_PROGRESS: "In progress",
  NEEDS_IMPROVEMENT: "Needs improvement",
  NOT_STARTED: "Not started",
};

const statusPct = {
  COMPLETED: 100,
  IN_PROGRESS: 50,
  NEEDS_IMPROVEMENT: 30,
  NOT_STARTED: 0,
};

export default function Learning({ people = [], progress = [], role, me }) {
  /* Build a list of students with their progress */
  const list =
    role === "student"
      ? (() => {
          const myProg = progress.find((p) => p.studentId === me?._id);
          return [
            {
              name: me?.name || "You",
              topic: myProg?.topic || "—",
              status: myProg?.status || "NOT_STARTED",
              notes: myProg?.notes || "",
            },
          ];
        })()
      : progress.map((p) => ({
          name: p.studentName || "Unknown",
          topic: p.topic,
          status: p.status,
          notes: p.notes,
        }));

  if (list.length === 0) {
    return (
      <p className="empty-state">
        {role === "student"
          ? "No progress records yet. Your mentor will track your learning."
          : "No progress records yet."}
      </p>
    );
  }

  return (
    <div className="learning-list">
      {list.map((item, i) => {
        const pct = statusPct[item.status] ?? 0;
        return (
          <div className="module" key={i}>
            <div className="module-copy">
              <b>{item.name}</b>
              <span>
                {item.topic} · {statusLabel[item.status] || item.status}
              </span>
            </div>
            <div className="bar">
              <i style={{ width: pct + "%" }} />
            </div>
            <strong>{pct}%</strong>
          </div>
        );
      })}
    </div>
  );
}
