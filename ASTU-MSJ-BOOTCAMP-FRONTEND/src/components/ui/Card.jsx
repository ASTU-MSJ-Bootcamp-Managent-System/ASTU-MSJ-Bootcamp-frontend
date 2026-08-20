import React from 'react';

export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      {title && <h3 className="font-semibold mb-3">{title}</h3>}
      {children}
    </div>
  );
}
