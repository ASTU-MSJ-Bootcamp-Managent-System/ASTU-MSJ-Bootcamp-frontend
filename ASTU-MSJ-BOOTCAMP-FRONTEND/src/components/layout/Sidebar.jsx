import React from 'react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 p-4 min-h-screen">
      <h2 className="font-bold mb-4">Menu</h2>
      <ul className="space-y-2 text-sm">
        <li>Dashboard</li>
        <li>Attendance</li>
        <li>Assignments</li>
        <li>Profile</li>
      </ul>
    </aside>
  );
}
