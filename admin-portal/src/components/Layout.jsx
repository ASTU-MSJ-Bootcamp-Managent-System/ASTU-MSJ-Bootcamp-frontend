import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings } from "lucide-react";

export const nav = [
  ["overview", "Overview"],
  ["requests", "Approval queue"],
  ["people", "People & access"],
  ["courses", "Courses & enrollment"],
  ["attendance", "Attendance"],
];

export const titles = Object.fromEntries([
  ...nav,
  ["settings", "Profile & security"],
]);

export function Sidebar({ page, setPage, pending, signOut }) {
  return (
    <aside className="flex flex-col bg-emerald-950 p-4 text-emerald-50 lg:sticky lg:top-0 lg:h-screen lg:w-64">
      <div className="px-3 pb-5 pt-2 text-lg font-bold">
        MSJ{" "}
        <span className="ml-1 text-[10px] tracking-widest text-amber-300">
          ADMIN
        </span>
      </div>

      <nav className="grid flex-1 gap-1 sm:grid-cols-2 lg:grid-cols-1">
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
        className="mt-auto w-full rounded-lg border border-emerald-800 px-3 py-2.5 text-left text-sm hover:bg-emerald-900"
      >
        Sign out →
      </button>
    </aside>
  );
}

export function Header({ page, admin, onToggleProfile, signOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleProfileClick() {
    setOpen((o) => !o);
    if (onToggleProfile) onToggleProfile();
  }

  const initials = (admin.name || "A")
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");

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

      <div className="relative" ref={ref}>
        <button
          onClick={handleProfileClick}
          className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-emerald-50 sm:flex"
          title="Profile & security"
        >
          <span className="grid size-9 place-items-center rounded-full bg-emerald-100 text-xs font-bold transition hover:bg-emerald-200">
            {initials}
          </span>
          <b className="hidden text-xs sm:block">{admin.name}</b>
        </button>

        {open && (
          <div className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
            <div className="border-b px-4 py-3">
              <p className="text-xs font-bold text-stone-900">{admin.name}</p>
              <p className="mt-0.5 text-[11px] text-stone-500">
                {admin.email}
              </p>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                if (onToggleProfile) onToggleProfile();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-stone-700 transition hover:bg-stone-50"
            >
              <Settings size={15} />
              Profile & security
            </button>
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-2.5 border-t px-4 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
