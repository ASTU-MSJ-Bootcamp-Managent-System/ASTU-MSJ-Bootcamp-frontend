import React from 'react';

export default function UserFilters({
  search = '',
  onSearchChange,
  roleFilter = 'All',
  onRoleFilterChange,
  batchFilter = 'All',
  onBatchFilterChange,
  availableBatches = [],
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
      <div className="relative flex-1 min-w-[240px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          placeholder="Search users..."
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Role:</label>
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer font-medium text-slate-700"
            value={roleFilter}
            onChange={(e) => onRoleFilterChange?.(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Student">Student</option>
            <option value="Mentor">Mentor</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Batch:</label>
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer font-medium text-slate-700"
            value={batchFilter}
            onChange={(e) => onBatchFilterChange?.(e.target.value)}
          >
            <option value="All">All Batches</option>
            {availableBatches.map((b) => (
              <option key={b.id || b.code} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

