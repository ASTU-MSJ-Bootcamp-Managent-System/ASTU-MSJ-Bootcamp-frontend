import React from 'react';

export default function Badge({ children, className = '' }) {
  return <span className={`inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 ${className}`}>{children}</span>;
}
