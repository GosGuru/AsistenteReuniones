
import React, { useState, useCallback } from 'react';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { Loader } from './components/common/Loader';
import { ErrorDisplay } from './components/common/ErrorDisplay';
import type { SummaryData, OutputFormat } from './types';
import { generateStructuredSummary, generateMarkdownSummary } from './services/geminiService';

const App: React.FC = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [meetingTitle, setMeetingTitle] = useState<string>('');
  const [attendees, setAttendees] = useState<string>('');
  const [defaultOwner, setDefaultOwner] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [summaryOutput, setSummaryOutput] = useState<SummaryData | null>(null);
  const [markdownOutput, setMarkdownOutput] = useState<string>('');
  const [activeOutputFormat, setActiveOutputFormat] = useState<OutputFormat | null>(null);

  const handleGenerateSummary = useCallback(async (format: OutputFormat) => {
    if (!transcript.trim()) {
      setError('La transcripción está vacía. Por favor, graba audio o pega texto antes de generar un resumen.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummaryOutput(null);
    setMarkdownOutput('');
    setActiveOutputFormat(format);

    try {
      const commonParams = {
        transcript,
        meetingTitle,
        attendees: attendees.split(',').map(a => a.trim()).filter(Boolean),
        defaultOwner,
      };

      if (format === 'json') {
        const result = await generateStructuredSummary(commonParams);
        setSummaryOutput(result);
      } else {
        const result = await generateMarkdownSummary(commonParams);
        setMarkdownOutput(result);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
      setActiveOutputFormat(null);
    } finally {
      setIsLoading(false);
    }
  }, [transcript, meetingTitle, attendees, defaultOwner]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-300 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
            Resumidor de Reuniones con IA
          </h1>
          <p className="mt-2 text-slate-400">
            Transforma las transcripciones de tus reuniones en resúmenes estructurados, tareas y conocimientos.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InputSection
            transcript={transcript}
            setTranscript={setTranscript}
            meetingTitle={meetingTitle}
            setMeetingTitle={setMeetingTitle}
            attendees={attendees}
            setAttendees={setAttendees}
            defaultOwner={defaultOwner}
            setDefaultOwner={setDefaultOwner}
            onGenerate={handleGenerateSummary}
            isLoading={isLoading}
          />
          <div className="flex flex-col">
            {isLoading && (
              <div className="flex-grow flex items-center justify-center bg-slate-800/50 rounded-lg">
                <Loader />
              </div>
            )}
            {error && (
                <ErrorDisplay title="Falló la Generación del Resumen" message={error} />
            )}
            {!isLoading && !error && (summaryOutput || markdownOutput) && (
              <OutputSection
                summaryData={summaryOutput}
                markdownData={markdownOutput}
                format={activeOutputFormat}
              />
            )}
             {!isLoading && !error && !summaryOutput && !markdownOutput && (
                <div className="flex-grow flex items-center justify-center bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg">
                    <div className="text-center text-slate-500">
                        <p className="text-lg font-medium">Tu resumen aparecerá aquí.</p>
                        <p className="text-sm">Ingresa una transcripción y genera un resumen para comenzar.</p>
                    </div>
                </div>
             )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;