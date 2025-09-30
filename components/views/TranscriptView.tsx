

import React, { useState } from 'react';

interface TranscriptViewProps {
  transcript: string;
  notes: string;
}

const TRANSCRIPT_PREVIEW_LENGTH = 750;

export const TranscriptView: React.FC<TranscriptViewProps> = ({ transcript, notes }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isLongTranscript = transcript.length > TRANSCRIPT_PREVIEW_LENGTH;

  const displayedText = isLongTranscript && !isExpanded
    ? `${transcript.substring(0, TRANSCRIPT_PREVIEW_LENGTH)}...`
    : transcript;

  const containerClasses = isLongTranscript && isExpanded
    ? 'max-h-96 overflow-y-auto'
    : '';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-teal-400 mb-2">Notas Generales</h3>
        <div className="bg-slate-900/70 p-4 rounded-md text-sm text-slate-300 whitespace-pre-wrap">
          {notes || <span className="text-slate-500 italic">Sin notas adicionales.</span>}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-teal-400">Transcripción Completa</h3>
          {isLongTranscript && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors focus:outline-none"
              aria-expanded={isExpanded}
            >
              {isExpanded ? 'Mostrar Menos' : 'Leer Más'}
            </button>
          )}
        </div>
        <div className={`bg-slate-900/70 p-4 rounded-md text-sm text-slate-300 whitespace-pre-wrap ${containerClasses}`}>
          {displayedText}
        </div>
      </div>
    </div>
  );
};