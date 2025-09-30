import React from 'react';
import type { Summary } from '../../types';
import { Card } from '../common/Card';

interface SummaryViewProps {
  data: Summary;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-400 mb-2">{title}</h3>
    {children}
  </div>
);

export const SummaryView: React.FC<SummaryViewProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <Section title="Resumen Ejecutivo">
        <p className="text-gray-300">{data.executive_summary}</p>
      </Section>

      <Section title="Puntos Clave">
        <ul className="list-disc list-inside space-y-1 text-gray-300">
          {data.key_points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </Section>

      <Section title="Decisiones">
        {data.decisions.length > 0 ? (
          <div className="space-y-3">
            {data.decisions.map((d, index) => (
              <Card key={index}>
                <p className="font-semibold">{d.decision}</p>
                <p className="text-sm text-gray-400">
                  Por: {d.who} | Cuándo: {d.when || 'N/A'}
                </p>
                {d.rationale && <p className="text-sm mt-1 italic text-gray-500">Justificación: {d.rationale}</p>}
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No se registraron decisiones.</p>
        )}
      </Section>

      <Section title="Riesgos">
        {data.risks.length > 0 ? (
          <div className="space-y-3">
            {data.risks.map((r, index) => (
              <Card key={index}>
                <p className="font-semibold">{r.risk}</p>
                 <p className="text-sm text-gray-400">
                  Impacto: {r.impact}
                </p>
                {r.mitigation && <p className="text-sm mt-1 italic text-gray-500">Mitigación: {r.mitigation}</p>}
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No se identificaron riesgos.</p>
        )}
      </section>
    </div>
  );
};