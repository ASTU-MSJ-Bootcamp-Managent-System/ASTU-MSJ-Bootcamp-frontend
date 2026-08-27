export const nav = [
  ["overview", "Overview"],
  ["requests", "Approval queue"],
  ["people", "People & access"],
  ["courses", "Courses & enrollment"],
  ["attendance", "Attendance"],
  ["settings", "Profile & security"],
];
export const titles = Object.fromEntries(nav);
export function Sidebar({ page, setPage, pending, signOut }) {
  return (
    <aside className="bg-emerald-950 p-4 text-emerald-50 lg:sticky lg:top-0 lg:h-screen lg:w-64">
      <div className="px-3 pb-5 pt-2 text-lg font-bold">
        MSJ{" "}
        <span className="ml-1 text-[10px] tracking-widest text-amber-300">
          ADMIN
        </span>
      </div>
      <nav className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
        {nav.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPage(key)}
            className={
              "rounded-lg px-3 py-2.5 text-left text-sm " +
              (page === key
                ? "bg-emerald-800 text-white"
                : "text-emerald-100/75 hover:bg-emerald-900")
            }
          >
            {label}
            {key === "requests" && pending > 0 && (
              <span className="float-right rounded-full bg-amber-300 px-1.5 text-[10px] font-bold text-emerald-950">
                {pending}
              </span>
            )}
          </button>
        ))}
      </nav>
      <button
        onClick={signOut}
        className="mt-5 w-full rounded-lg border border-emerald-800 px-3 py-2.5 text-left text-sm lg:mt-14"
      >
        Sign out →
      </button>
    </aside>
  );
}
export function Header({ page, admin }) {
  return (
    <header className="mb-9 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold tracking-[.17em] text-emerald-700">
          PROGRAMME ADMINISTRATION
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          {titles[page]}
        </h1>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <span className="grid size-9 place-items-center rounded-full bg-emerald-100 text-xs font-bold">
          {admin.name
            .split(" ")
            .map((x) => x[0])
            .slice(0, 2)}
        </span>
        <b className="text-xs">{admin.name}</b>
      </div>
    </header>
  );
}
