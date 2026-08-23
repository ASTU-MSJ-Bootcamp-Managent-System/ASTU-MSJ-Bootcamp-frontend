export default function StatCard({ label, value, note }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-xs text-emerald-600">{note}</p>
    </div>
  );
}
