import React from 'react';
import { PROGRAM_COLORS, PROGRAMS } from '../lib/constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const programData = [
  {
    name: PROGRAMS.VIDHAI,
    color: PROGRAM_COLORS['Vidhai'],
    enrolledCount: 156,
    metric: 'Grants Disbursed',
    metricValue: '₹78.5L',
    description: 'Scholarship program for deserving students',
    trend: [
      { month: 'Jan', value: 140 },
      { month: 'Feb', value: 148 },
      { month: 'Mar', value: 156 },
    ],
  },
  {
    name: PROGRAMS.MENTORSHIP,
    color: PROGRAM_COLORS['Mentorship'],
    enrolledCount: 98,
    metric: 'Sessions Logged',
    metricValue: '842',
    description: 'One-on-one mentoring for career guidance',
    trend: [
      { month: 'Jan', value: 85 },
      { month: 'Feb', value: 92 },
      { month: 'Mar', value: 98 },
    ],
  },
  {
    name: PROGRAMS.HOSTELS,
    color: PROGRAM_COLORS['Hostels'],
    enrolledCount: 64,
    metric: 'Check-ins',
    metricValue: '1,024',
    description: 'Hostel support for rural students',
    trend: [
      { month: 'Jan', value: 58 },
      { month: 'Feb', value: 61 },
      { month: 'Mar', value: 64 },
    ],
  },
  {
    name: PROGRAMS.FELLOWSHIP,
    color: PROGRAM_COLORS['NP Fellowship'],
    enrolledCount: 32,
    metric: 'Fellows Active',
    metricValue: '32',
    description: 'Nammadhu Palli Fellowship for high-impact students',
    trend: [
      { month: 'Jan', value: 28 },
      { month: 'Feb', value: 30 },
      { month: 'Mar', value: 32 },
    ],
  },
];

export const Programs: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Agaram Programs</h1>
        <p className="text-slate-600 mt-1">Overview of all active programs and their impact</p>
      </div>

      {/* Program cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {programData.map((program) => (
          <div key={program.name} className="card overflow-hidden hover:shadow-lg transition-shadow">
            {/* Header with color */}
            <div
              className="h-2"
              style={{ backgroundColor: program.color }}
            />

            {/* Content */}
            <div className="p-6">
              <h2 className="text-xl font-bold" style={{ color: program.color }}>
                {program.name}
              </h2>
              <p className="text-sm text-slate-600 mt-1">{program.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 uppercase font-semibold">Enrolled</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{program.enrolledCount}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 uppercase font-semibold">{program.metric}</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{program.metricValue}</p>
                </div>
              </div>

              {/* Trend chart */}
              <div className="mt-4">
                <p className="text-xs text-slate-600 uppercase font-semibold mb-2">3-Month Trend</p>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={program.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#94A3B8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1A2B4A', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }}
                      labelStyle={{ color: 'white' }}
                    />
                    <Line type="monotone" dataKey="value" stroke={program.color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Action */}
              <button
                className="w-full mt-4 py-2 px-3 border-2 font-medium rounded-lg transition-colors"
                style={{
                  borderColor: program.color,
                  color: program.color,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${program.color}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                View All Students
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Program comparison */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Program Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Program</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Enrolled</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Active</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Completed</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Growth</th>
              </tr>
            </thead>
            <tbody>
              {programData.map((program) => (
                <tr key={program.name} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{program.name}</td>
                  <td className="px-4 py-3 text-slate-600">{program.enrolledCount}</td>
                  <td className="px-4 py-3 text-slate-600">{Math.round(program.enrolledCount * 0.9)}</td>
                  <td className="px-4 py-3 text-slate-600">{Math.round(program.enrolledCount * 0.15)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      ↑ 11%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
