import React from 'react';
import { getHealthScoreColor } from '../../lib/utils';

interface HealthScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const HealthScore: React.FC<HealthScoreProps> = ({ score, size = 'md', showLabel = true }) => {
  const color = getHealthScoreColor(score);
  
  const sizeClass = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl',
  }[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white`} style={{ backgroundColor: color }}>
        {score}
      </div>
      {showLabel && (
        <div className="text-xs text-slate-600 font-medium">
          {score >= 75 ? 'Good' : score >= 55 ? 'Medium' : 'Poor'}
        </div>
      )}
    </div>
  );
};
