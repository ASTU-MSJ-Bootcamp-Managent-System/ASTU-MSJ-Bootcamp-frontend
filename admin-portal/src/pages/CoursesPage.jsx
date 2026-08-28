import { Intro } from "../components/ui";

export default function CoursesPage({ data, update, open, ask, deleteCourse }) {
  return (
    <>
      <Intro
        title="Batches & enrollment"
        text="Create learning cohorts and manage batch rosters."
        action={() => open("course")}
      >
        Create batch
      </Intro>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.courses.map((c, i) => {
          let count = data.students.filter((s) => s.course === c.name).length;
          return (
            <article
              key={c._id || c.code}
              className="rounded-xl border border-emerald-100 bg-white p-5"
            >
              <p className="text-[10px] font-bold tracking-widest text-emerald-700">
                {c.code}
              </p>
              <h2 className="mt-2 font-display text-2xl">{c.name}</h2>
              <p className="mt-7 text-xs text-stone-500">
                {count} enrolled · {c.capacity} capacity
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-emerald-50">
                <i
                  className="block h-full bg-emerald-700"
                  style={{
                    width: `${Math.min(100, (count / (c.capacity || 1)) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-5 flex justify-between border-t pt-3">
                <button
                  onClick={() => open("course", i)}
                  className="font-bold text-emerald-700"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    count
                      ? alert("Move students before deleting this batch.")
                      : ask("Delete this batch?", () =>
                          deleteCourse
                            ? deleteCourse(c._id)
                            : update({
                                courses: data.courses.filter(
                                  (_, n) => n !== i,
                                ),
                              }),
                        )
                  }
                  className="font-bold text-rose-700"
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
