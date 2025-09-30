import React from 'react';
import type { Project } from '../../types';
import { Card } from '../common/Card';

interface ProjectsViewProps {
  data: Project[];
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ data }) => {
   if (data.length === 0) {
    return <p className="text-slate-500 italic text-center mt-8">No se discutieron proyectos actuales.</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((project, index) => (
        <Card key={index}>
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-md text-slate-200">{project.name}</h4>
            <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full capitalize">{project.status}</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Responsable: {project.owner}</p>
          {project.notes && <p className="text-sm mt-2 pt-2 border-t border-slate-700/50 text-slate-300">{project.notes}</p>}
        </Card>
      ))}
    </div>
  );
};