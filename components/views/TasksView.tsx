import React from 'react';
import type { Task } from '../../types';

interface TasksViewProps {
  data: Task[];
}

const priorityClasses: { [key in Task['priority']]: string } = {
  alta: 'bg-red-900 text-red-400',
  media: 'bg-yellow-900 text-yellow-400',
  baja: 'bg-sky-900 text-sky-400',
};

export const TasksView: React.FC<TasksViewProps> = ({ data }) => {
  if (data.length === 0) {
    return <p className="text-gray-500 italic text-center mt-8">No se identificaron tareas o próximos pasos.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-800">
        <thead className="bg-gray-800/50">
          <tr>
            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-300">Tarea</th>
            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-300">Responsable</th>
            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-300">Fecha Límite</th>
            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-300">Prioridad</th>
            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-300">Dependencias</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data.map((task, index) => (
            <tr key={index}>
              <td className="py-4 px-4 text-sm text-gray-300">{task.task}</td>
              <td className="py-4 px-4 text-sm text-gray-400">{task.owner}</td>
              <td className="py-4 px-4 text-sm text-gray-400">{task.due || 'N/A'}</td>
              <td className="py-4 px-4 text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${priorityClasses[task.priority]}`}>
                  {task.priority}
                </span>
              </td>
              <td className="py-4 px-4 text-sm text-gray-400">
                {task.dependencies.length > 0 ? task.dependencies.join(', ') : 'Ninguna'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};