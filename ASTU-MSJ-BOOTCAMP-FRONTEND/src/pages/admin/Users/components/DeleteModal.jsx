import React from 'react';

export default function DeleteModal({ isOpen, onClose, onConfirm, user }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6 text-center space-y-4">
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-800">Delete User</h3>
          <p className="text-sm text-slate-600 mt-2">
            Are you sure you want to delete this user?
          </p>
          {user?.name && (
            <p className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-lg mt-2 inline-block">
              {user.name} ({user.email || user.role})
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-sm shadow-sm transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
