import React from 'react';

export default function Pagination({ currentPage = 1, totalPages = 1 }) {
  return (
    <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
      <button className="px-3 py-1 border rounded">Prev</button>
      <span>
        {currentPage} / {totalPages}
      </span>
      <button className="px-3 py-1 border rounded">Next</button>
    </div>
  );
}
