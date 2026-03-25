import React from 'react';
import { getStatusColor, getStatusLabel } from '../../lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'watch' | 'at_risk';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
};
