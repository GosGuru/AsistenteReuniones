
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-slate-900/70 p-4 rounded-lg border border-slate-700/50 ${className}`}>
      {children}
    </div>
  );
};
