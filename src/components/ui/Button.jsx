import React from 'react';

const variants = {
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  solid: 'bg-purple-600 text-white hover:bg-purple-700',
};

const sizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({ variant = 'solid', size = 'md', className = '', children, ...props }) => {
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };