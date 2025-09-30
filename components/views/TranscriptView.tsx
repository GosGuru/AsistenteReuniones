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

  const hasNotes = notes && notes.trim() && notes.trim().toLowerCase() !== 'no mencionado';

  return (
    <div className="space-y-6">
      {hasNotes && (
         <div>
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Notas Generales</h3>
            <div className="bg-gray-800/50 p-4 rounded-md text-sm text-gray-300 whitespace-pre-wrap">
            {notes}
            </div>
         </div>
      )}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-400">Transcripción Completa</h3>
          {isLongTranscript && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors focus:outline-none"
              aria-expanded={isExpanded}
            >
              {isExpanded ? 'Mostrar Menos' : 'Leer Más'}
            </button>
          )}
        </div>
        <div className={`bg-gray-800/50 p-4 rounded-md text-sm text-gray-300 whitespace-pre-wrap ${containerClasses}`}>
          {displayedText}
        </div>
      </div>
    </div>
  );
};