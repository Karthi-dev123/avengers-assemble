import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, delta, deltaLabel, icon }) => {
  const isDeltaPositive = delta ? delta >= 0 : false;

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {delta !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${isDeltaPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isDeltaPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{isDeltaPositive ? '+' : ''}{delta}</span>
              {deltaLabel && <span className="text-slate-600">({deltaLabel})</span>}
            </div>
          )}
        </div>
        {icon && <div className="ml-4 text-slate-400">{icon}</div>}
      </div>
    </div>
  );
};
