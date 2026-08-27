import { Intro, Status } from "../components/ui";
export default function OverviewPage({ data, open, setPage }) {
  let avg = Math.round(
      data.students.reduce((n, x) => n + x.attendance, 0) /
        (data.students.length || 1),
    ),
    cards = [
      [
        "ACTIVE STUDENTS",
        data.students.filter((x) => x.status === "Active").length,
      ],
      ["MENTORS", data.mentors.length],
      ["PENDING APPROVALS", data.requests.length],
      ["AVERAGE ATTENDANCE", avg + "%"],
    ];
  return (
    <>
      <Intro
        title={"Good morning, " + data.admin.name.split(" ")[0] + "."}
        text="Programme activity and priority tasks at a glance."
        action={() => setPage("requests")}
      >
        Review approvals
      </Intro>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <article
            key={c[0]}
            className="rounded-xl border border-emerald-100 bg-white p-5"
          >
            <p className="text-[10px] font-bold tracking-wider text-stone-500">
              {c[0]}
            </p>
            <strong className="mt-2 block text-3xl">{c[1]}</strong>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="rounded-xl border border-emerald-100 bg-white p-5">
          <h3 className="font-bold">Pending approvals</h3>
          {data.requests.map((r) => (
            <div
              key={r.email}
              className="mt-3 flex items-center gap-3 border-t pt-3"
            >
              <div className="flex-1">
                <b className="block text-sm">{r.name}</b>
                <small className="text-xs text-stone-500">
                  {r.role} · {r.course}
                </small>
              </div>
              <Status tone="amber">Pending</Status>
            </div>
          ))}
        </section>
        <section className="rounded-xl border border-emerald-100 bg-white p-5">
          <h3 className="font-bold">Quick actions</h3>
          {[
            ["Enroll a student", "student"],
            ["Create a course", "course"],
            ["Record attendance", "attendance"],
          ].map(([label, type]) => (
            <button
              key={type}
              onClick={() => open(type)}
              className="mt-3 block w-full border-t pt-3 text-left text-sm font-semibold text-emerald-800"
            >
              ＋ {label}
            </button>
          ))}
        </section>
      </div>
    </>
  );
}
