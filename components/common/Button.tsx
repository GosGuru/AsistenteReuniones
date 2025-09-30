import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md'
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = 'font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98]';
  
  const sizeClasses = {
      sm: 'py-2 px-3 text-xs',
      md: 'py-2.5 px-5 text-sm',
  };

  const variantClasses = {
    primary: 'bg-gray-100 text-black hover:bg-gray-200 focus:ring-gray-300 shadow-sm',
    secondary: 'bg-gray-800 text-gray-200 hover:bg-gray-700 focus:ring-gray-600',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};