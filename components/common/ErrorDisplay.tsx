import React from 'react';
import { Icon } from './Icon';

interface ErrorDisplayProps {
  title: string;
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ title, message }) => {
  return (
    <div className="flex-grow flex items-center justify-center bg-red-950/50 border border-red-800 text-red-400 p-4 rounded-lg">
      <div className="text-center max-w-md">
        <Icon name="error" className="h-10 w-10 mx-auto mb-3 text-red-500" />
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};