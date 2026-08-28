import React from 'react';

export default function BatchTable({ batches, onEdit, onDelete }) {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (!batches || batches.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <svg
          className="w-12 h-12 mx-auto text-slate-300 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p className="text-slate-600 font-semibold">No batches found</p>
        <p className="text-slate-400 text-xs mt-1">
          Try adjusting your search filter or create a new batch.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Batch Info</th>
              <th className="py-3.5 px-5">Batch Code</th>
              <th className="py-3.5 px-5">Duration</th>
              <th className="py-3.5 px-5">Students</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {batches.map((batch) => (
              <tr key={batch.id} className="hover:bg-slate-50/80 transition">
                <td className="py-4 px-5">
                  <div className="font-semibold text-slate-800">{batch.name}</div>
                  {batch.description && (
                    <div className="text-xs text-slate-400 truncate max-w-xs">
                      {batch.description}
                    </div>
                  )}
                </td>
                <td className="py-4 px-5 font-mono text-xs text-slate-600 font-medium">
                  {batch.code || `BATCH-${batch.id}`}
                </td>
                <td className="py-4 px-5 text-xs text-slate-600">
                  <div>{batch.startDate || 'N/A'} to</div>
                  <div className="text-slate-400">{batch.endDate || 'N/A'}</div>
                </td>
                <td className="py-4 px-5 text-slate-700 font-medium">
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {batch.studentCount ?? 0} Students
                  </span>
                </td>
                <td className="py-4 px-5">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                      batch.status
                    )}`}
                  >
                    {batch.status || 'Active'}
                  </span>
                </td>
                <td className="py-4 px-5 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => onEdit(batch)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Edit Batch"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(batch)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Batch"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
