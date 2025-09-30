import React from 'react';
import type { Idea } from '../../types';
import { Card } from '../common/Card';

interface IdeasViewProps {
  data: Idea[];
}

export const IdeasView: React.FC<IdeasViewProps> = ({ data }) => {
  if (data.length === 0) {
    return <p className="text-gray-500 italic text-center mt-8">No se mencionaron nuevas ideas u oportunidades.</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((idea, index) => (
        <Card key={index}>
          <h4 className="font-bold text-md text-white">{idea.idea}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 mt-2 text-sm">
            <div className="text-gray-300"><span className="font-semibold text-gray-500">Valor:</span> {idea.value || 'N/A'}</div>
            <div className="text-gray-300"><span className="font-semibold text-gray-500">Esfuerzo:</span> {idea.effort || 'N/A'}</div>
            <div className="text-gray-300"><span className="font-semibold text-gray-500">Próximo Paso:</span> {idea.next_step || 'N/A'}</div>
          </div>
        </Card>
      ))}
    </div>
  );
};