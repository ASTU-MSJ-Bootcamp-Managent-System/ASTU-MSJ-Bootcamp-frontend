import React from 'react';

export default function Button({ children, type = 'button', className = '', ...props }) {
  return (
    <button type={type} className={`px-4 py-2 rounded-md bg-blue-600 text-white ${className}`} {...props}>
      {children}
    </button>
  );
}
