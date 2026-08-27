export const input =
  "mt-1.5 block w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100";
export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={
        "rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
export function Status({ children, tone = "green" }) {
  return (
    <span
      className={
        "rounded-full px-2.5 py-1 text-[10px] font-bold " +
        {
          green: "bg-emerald-100 text-emerald-800",
          red: "bg-rose-100 text-rose-700",
          amber: "bg-amber-100 text-amber-800",
        }[tone]
      }
    >
      {children}
    </span>
  );
}
export function Table({ heads, children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-emerald-100 bg-white">
      <table className="min-w-[690px] w-full text-left text-sm">
        <thead className="border-b bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500">
          <tr>
            {heads.map((x) => (
              <th key={x} className="px-4 py-3">
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">{children}</tbody>
      </table>
    </div>
  );
}
export function Intro({ title, text, action, children }) {
  return (
    <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row">
      <div>
        <h2 className="font-display text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-stone-500">{text}</p>
      </div>
      {action && <Button onClick={action}>{children} ＋</Button>}
    </section>
  );
}
