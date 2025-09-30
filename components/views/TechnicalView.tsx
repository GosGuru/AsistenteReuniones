

import React from 'react';
import type { TechnicalConsideration } from '../../types';
import { Card } from '../common/Card';

interface TechnicalViewProps {
  data: TechnicalConsideration[];
}

export const TechnicalView: React.FC<TechnicalViewProps> = ({ data }) => {
  if (data.length === 0) {
    return <p className="text-gray-500 italic text-center mt-8">No se discutieron consideraciones técnicas.</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <Card key={index}>
          <h4 className="font-bold text-md text-gray-200">{item.topic}</h4>
          <p className="text-sm text-gray-300 mt-2">{item.details}</p>
          {item.open_questions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-800">
              <h5 className="font-semibold text-sm text-gray-400 mb-1">Preguntas Abiertas:</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                {item.open_questions.map((q, qIndex) => (
                  <li key={qIndex}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};