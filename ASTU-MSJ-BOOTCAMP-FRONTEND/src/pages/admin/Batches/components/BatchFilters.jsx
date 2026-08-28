import React from 'react';

export default function BatchFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <svg
          className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by batch name or code..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      {/* Filter Options */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
          Status:
        </label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>
  );
}
