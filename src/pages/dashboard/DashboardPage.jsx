import RecentActivity from '../../components/dashboard/RecentActivity';
import StatCard from '../../components/dashboard/StatCard';
import { dashboardData } from './dashboardData';

export default function DashboardPage({ role }) {
  const data = dashboardData[role];

  return (
    <>
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-ink">Good morning</h2>
        <p className="mt-1 text-slate-500">Here is what is happening in your bootcamp.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map(([label, value, note]) => (
          <StatCard key={label} label={label} value={value} note={note} />
        ))}
      </div>

      <RecentActivity items={data.activity} />
    </>
  );
}
