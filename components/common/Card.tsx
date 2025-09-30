
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-800/50 p-4 rounded-lg border border-gray-800 ${className}`}>
      {children}
    </div>
  );
};