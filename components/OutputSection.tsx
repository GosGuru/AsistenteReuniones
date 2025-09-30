import React, { useState, useMemo, useEffect } from 'react';
import type { SummaryData, OutputFormat } from '../types';
import { SummaryView } from './views/SummaryView';
import { TasksView } from './views/TasksView';
import { ProjectsView } from './views/ProjectsView';
import { IdeasView } from './views/IdeasView';
import { TechnicalView } from './views/TechnicalView';
import { TranscriptView } from './views/TranscriptView';
import { Icon } from './common/Icon';
import { Button } from './common/Button';

interface OutputSectionProps {
  summaryData: SummaryData | null;
  markdownData: string;
  format: OutputFormat | null;
}

type Tab = 'Resumen' | 'Tareas' | 'Proyectos' | 'Ideas' | 'Técnico' | 'Transcripción';

export const OutputSection: React.FC<OutputSectionProps> = ({ summaryData, markdownData, format }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Resumen');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const content = format === 'json' ? JSON.stringify(summaryData, null, 2) : markdownData;
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const content = format === 'json' ? JSON.stringify(summaryData, null, 2) : markdownData;
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumen-reunion.${format === 'json' ? 'json' : 'md'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (format === 'markdown') {
    return (
       <div className="bg-gray-950 p-6 rounded-lg shadow-lg flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Resumen en Markdown</h2>
            <div className="flex gap-2">
                <Button onClick={handleCopy} variant="secondary" size="sm">{copied ? '¡Copiado!' : <Icon name="copy" />}</Button>
                <Button onClick={handleDownload} variant="secondary" size="sm"><Icon name="download" /></Button>
            </div>
        </div>
        <div className="prose prose-invert bg-black/30 rounded-md p-4 overflow-auto flex-grow max-w-none prose-pre:bg-gray-900/50">
          <pre className="whitespace-pre-wrap">{markdownData}</pre>
        </div>
       </div>
    );
  }
  
  const availableTabs = useMemo(() => {
      if (!summaryData) return [];
      const tabs: Tab[] = ['Resumen'];
      if (summaryData.next_steps?.length > 0) tabs.push('Tareas');
      if (summaryData.projects_current?.length > 0) tabs.push('Proyectos');
      if (summaryData.new_ideas_opportunities?.length > 0) tabs.push('Ideas');
      if (summaryData.technical_considerations?.length > 0) tabs.push('Técnico');
      tabs.push('Transcripción');
      return tabs;
  }, [summaryData]);

  useEffect(() => {
    // Reset tab if it's not available in the new summary
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
        setActiveTab(availableTabs[0]);
    }
  }, [availableTabs, activeTab]);

  if (!summaryData) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'Resumen':
        return <SummaryView data={summaryData.summary} />;
      case 'Tareas':
        return <TasksView data={summaryData.next_steps} />;
      case 'Proyectos':
        return <ProjectsView data={summaryData.projects_current} />;
      case 'Ideas':
        return <IdeasView data={summaryData.new_ideas_opportunities} />;
      case 'Técnico':
        return <TechnicalView data={summaryData.technical_considerations} />;
      case 'Transcripción':
        return <TranscriptView transcript={summaryData.transcript} notes={summaryData.notes} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-950 p-0 sm:p-6 rounded-lg shadow-lg flex-grow flex flex-col">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-6 pt-6 sm:px-0 sm:pt-0">
        <h2 className="text-2xl font-bold text-white mb-2 sm:mb-0">Resumen Estructurado</h2>
        <div className="flex gap-2">
            <Button onClick={handleCopy} variant="secondary" size="sm">{copied ? '¡Copiado!' : 'Copiar JSON'}</Button>
            <Button onClick={handleDownload} variant="secondary" size="sm">Descargar JSON</Button>
        </div>
      </div>
      <div className="border-b border-gray-800 px-2 sm:px-0">
        <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="pt-6 flex-grow overflow-y-auto px-6 pb-6 sm:px-0 sm:pb-0">{renderContent()}</div>
    </div>
  );
};