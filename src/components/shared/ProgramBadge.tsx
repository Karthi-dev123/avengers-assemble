import React from 'react';
import { PROGRAM_COLORS } from '../../lib/constants';

interface ProgramBadgeProps {
  program: string;
  variant?: 'pill' | 'chip';
}

export const ProgramBadge: React.FC<ProgramBadgeProps> = ({ program, variant = 'pill' }) => {
  const color = PROGRAM_COLORS[program as keyof typeof PROGRAM_COLORS] || '#94A3B8';

  if (variant === 'chip') {
    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: color }}
      >
        {program}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {program}
    </span>
  );
};
