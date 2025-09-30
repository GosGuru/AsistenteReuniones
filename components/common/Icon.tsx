import React from 'react';
import { 
    FiCopy, 
    FiDownload, 
    FiMic, 
    FiSquare, 
    FiPause, 
    FiPlay, 
    FiAlertTriangle,
    FiClipboard
} from 'react-icons/fi';

interface IconProps {
  name: 'copy' | 'download' | 'mic' | 'stop' | 'pause' | 'play' | 'error' | 'paste';
  className?: string;
}

const ICONS: Record<IconProps['name'], React.ElementType> = {
  copy: FiCopy,
  download: FiDownload,
  mic: FiMic,
  stop: FiSquare,
  pause: FiPause,
  play: FiPlay,
  error: FiAlertTriangle,
  paste: FiClipboard,
};

export const Icon: React.FC<IconProps> = ({ name, className = 'h-4 w-4' }) => {
  const IconComponent = ICONS[name];
  if (!IconComponent) return null;
  
  return <IconComponent className={className} />;
};