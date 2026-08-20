import React from 'react';

export default function EmptyState({ message = 'No data available.' }) {
  return <div className="text-gray-500 text-center py-6">{message}</div>;
}
