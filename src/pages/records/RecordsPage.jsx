import { Plus } from 'lucide-react';
import RecordsTable from '../../components/records/RecordsTable';
import { useAuth } from '../../context/AuthContext';
import { recordsData } from './recordsData';

export default function RecordsPage({ type }) {
  const { user } = useAuth();
  const isStudent = user.role === 'student';
  const { title, heads, rows } = recordsData[type];

  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isStudent
              ? 'Your personal bootcamp information.'
              : 'Manage and review your bootcamp records.'}
          </p>
        </div>

        {!isStudent && (
          <button className="btn-primary">
            <Plus size={16} className="mr-1" />
            New {title.slice(0, -1)}
          </button>
        )}
      </div>

      <RecordsTable heads={heads} rows={rows} />

      {type === 'attendance' && !isStudent && (
        <button className="btn-primary mt-5">Save attendance</button>
      )}
    </>
  );
}
