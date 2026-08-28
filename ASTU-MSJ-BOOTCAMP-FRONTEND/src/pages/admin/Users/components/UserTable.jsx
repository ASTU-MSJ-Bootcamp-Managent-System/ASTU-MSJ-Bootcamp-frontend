import React from 'react';

const UserTable = ({ users = [], onEdit, onDelete }) => {
  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'mentor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'student':
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Name
            </th>
            <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Email
            </th>
            <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Role
            </th>
            <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Assigned Batch
            </th>
            <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200 bg-white">
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/80 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {user.email || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(
                      user.role
                    )}`}
                  >
                    {user.role || 'Student'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {user.batch ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                      <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {user.batch}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  <div className="flex justify-end items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit?.(user)}
                      className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md text-xs font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(user)}
                      className="px-3 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md text-xs font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;

