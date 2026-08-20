import React from 'react';

export default function UserDetails({ user }) {
  if (!user) {
    return <div className="text-gray-500">Select a user to view details.</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <h2 className="text-xl font-semibold mb-3">{user.name}</h2>
      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
        <div>
          <span className="font-medium text-gray-800">Role:</span> {user.role}
        </div>
        <div>
          <span className="font-medium text-gray-800">Batch:</span> {user.batch}
        </div>
        <div>
          <span className="font-medium text-gray-800">Status:</span> {user.status}
        </div>
        <div>
          <span className="font-medium text-gray-800">ID:</span> {user.id}
        </div>
      </div>
    </div>
  );
}
