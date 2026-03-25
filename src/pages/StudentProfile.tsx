import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStudent } from '../hooks/useStudent';
import { HealthScore } from '../components/shared/HealthScore';
import { ProgramBadge } from '../components/shared/ProgramBadge';
import { StatusBadge } from '../components/shared/StatusBadge';
import { TimelineEvent } from '../components/shared/TimelineEvent';
import { ForecastChart } from '../components/shared/ForecastChart';
import { getInitials, formatDate } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, Calendar, BookOpen } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { student, timeline, forecast, loading, refreshForecast } = useStudent(id);
  const [isRefreshingForecast, setIsRefreshingForecast] = useState(false);

  const handleRefreshForecast = async () => {
    setIsRefreshingForecast(true);
    await refreshForecast();
    setIsRefreshingForecast(false);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading student profile...</div>;
  }

  if (!student) {
    return <div className="p-8 text-center text-red-600">Student not found</div>;
  }

  // Performance breakdown data
  const performanceData = [
    { name: 'Attendance', value: 95, label: '95%' },
    { name: 'Academics', value: 88, label: '88%' },
    { name: 'Milestones', value: 80, label: '80%' },
    { name: 'Recency', value: 85, label: '85%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sidebar-dark to-slate-800 rounded-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-sidebar-accent flex items-center justify-center text-3xl font-bold">
              {getInitials(student.full_name)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{student.full_name}</h1>
              <p className="text-slate-300 mt-1">
                {student.home_village}, {student.district}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span>ID: {student.aadhaar_last4}</span>
                <span>Class: {student.current_class}</span>
                <span>Since: {formatDate(student.first_contact_date)}</span>
              </div>
              <div className="flex gap-2 mt-3">
                {student.programs.map((prog) => (
                  <ProgramBadge key={prog.id} program={prog.program_name} />
                ))}
                <StatusBadge status={student.status} />
              </div>
            </div>
          </div>
          <HealthScore score={student.performance_score || 0} size="lg" />
        </div>
      </div>

      {/* Forecast panel */}
      {forecast && (
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">AI-Generated Forecast (5-10 Years)</h2>
            <button
              onClick={handleRefreshForecast}
              disabled={isRefreshingForecast}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh forecast with latest data"
            >
              <RefreshCw size={20} className={isRefreshingForecast ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Educational Path</p>
                  <p className="text-slate-900 font-medium">{forecast.educational_path}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Career Outcome</p>
                  <p className="text-slate-900 font-medium">{forecast.career_outcome}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Degree Probability</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-health-good"
                        style={{ width: `${Math.round(forecast.degree_probability * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {Math.round(forecast.degree_probability * 100)}%
                    </span>
                  </div>
                </div>
                {forecast.risk_factors.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Risk Factors</p>
                    <ul className="space-y-1">
                      {forecast.risk_factors.map((factor, idx) => (
                        <li key={idx} className="text-sm text-slate-700 flex gap-2">
                          <span className="text-red-600">⚠</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <ForecastChart />
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Timeline (wider) */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Program Timeline</h2>
            <div className="space-y-2">
              {timeline.length > 0 ? (
                timeline.map((event) => (
                  <TimelineEvent key={event.id} event={event} />
                ))
              ) : (
                <p className="text-sm text-slate-600 text-center py-8">No timeline events yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Performance & Enrollment */}
        <div className="lg:col-span-1 space-y-6">
          {/* Performance Breakdown */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" stroke="#94A3B8" />
                <YAxis dataKey="name" type="category" width={100} stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A2B4A', border: 'none', borderRadius: '8px', color: 'white' }}
                  labelStyle={{ color: 'white' }}
                />
                <Bar dataKey="value" fill="#0D9488" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Program Enrollment */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen size={20} />
              Program Enrollment
            </h3>
            <div className="space-y-3">
              {student.programs.map((prog) => (
                <div key={prog.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{prog.program_name}</p>
                    <p className="text-xs text-slate-600">
                      Since {formatDate(prog.start_date)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      prog.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : prog.status === 'completed'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {prog.status.charAt(0).toUpperCase() + prog.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <button className="w-full py-2 px-4 bg-sidebar-accent text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2">
              <Calendar size={18} />
              Schedule Meeting
            </button>
            <button className="w-full py-2 px-4 border border-slate-300 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              Log Interaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
