export default function RecentActivity({ items }) {
  return (
    <div className="card mt-6 p-6">
      <h3 className="font-bold text-ink">Recent activity</h3>
      <div className="mt-4 divide-y">
        {items.map((item) => (
          <div key={item} className="py-4 text-sm text-slate-600">
            {item}
            <span className="float-right text-xs text-slate-400">Recently</span>
          </div>
        ))}
      </div>
    </div>
  );
}
