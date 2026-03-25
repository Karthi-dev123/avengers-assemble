import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ForecastChartProps {
  title?: string;
  data?: Array<{ year: number; predicted: number; actual?: number }>;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  title = 'Student Trajectory (5-10 Year Forecast)',
  data,
}) => {
  // Sample forecast data if none provided
  const chartData = data || [
    { year: 2024, actual: 78, predicted: 78 },
    { year: 2025, actual: 82, predicted: 82 },
    { year: 2026, predicted: 85 },
    { year: 2027, predicted: 88 },
    { year: 2028, predicted: 90 },
    { year: 2029, predicted: 92 },
    { year: 2030, predicted: 94 },
    { year: 2031, predicted: 95 },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="year" stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1A2B4A', border: 'none', borderRadius: '8px', color: 'white' }}
            labelStyle={{ color: 'white' }}
          />
          {chartData.some(d => d.actual) && (
            <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Actual" dot={{ r: 4 }} />
          )}
          <Line type="monotone" dataKey="predicted" stroke="#0D9488" strokeWidth={2} strokeDasharray="5 5" name="Predicted" dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-4 text-xs">
        {chartData.some(d => d.actual) && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-600">Actual</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-sidebar-accent" />
          <span className="text-slate-600">Predicted</span>
        </div>
      </div>
    </div>
  );
};
