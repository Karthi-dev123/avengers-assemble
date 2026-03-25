import React from 'react';
import { Student } from '../../lib/types';
import { ProgramBadge } from './ProgramBadge';
import { StatusBadge } from './StatusBadge';
import { getInitials, formatDate } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface StudentRowProps {
  student: Student;
}

export const StudentRow: React.FC<StudentRowProps> = ({ student }) => {
  const navigate = useNavigate();

  return (
    <tr
      onClick={() => navigate(`/students/${student.id}`)}
      className="hover:bg-slate-50 cursor-pointer border-b border-slate-200 transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-white font-semibold text-sm">
            {getInitials(student.full_name)}
          </div>
          <div>
            <p className="font-medium text-slate-900">{student.full_name}</p>
            <p className="text-xs text-slate-500">{student.aadhaar_last4}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">{student.district}</td>
      <td className="px-6 py-4">
        <div className="flex gap-2 flex-wrap">
          {student.programs.map((prog) => (
            <ProgramBadge key={prog.id} program={prog.program_name} />
          ))}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sidebar-accent"
              style={{ width: `${Math.min((student.performance_score || 0) / 100 * 100, 100)}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-900">{student.performance_score ?? 0}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {student.last_activity ? formatDate(student.last_activity) : 'Never'}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={student.status} />
      </td>
    </tr>
  );
};
