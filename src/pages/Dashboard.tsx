import React from 'react';
import { MetricCard } from '../components/shared/MetricCard';
import { AlertCard } from '../components/shared/AlertCard';
import { StudentRow } from '../components/shared/StudentRow';
import { useDashboard } from '../hooks/useDashboard';
import { useStudents } from '../hooks/useStudents';
import { useAlerts } from '../hooks/useAlerts';
import { Users, Activity, AlertTriangle, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const { metrics, loading: metricsLoading } = useDashboard();
  const { students, loading: studentsLoading } = useStudents();
  const { alerts, loading: alertsLoading } = useAlerts();

  const recentStudents = students.slice(0, 6);
  const recentAlerts = alerts.slice(0, 3);

  // Enrollment trend data
  const enrollmentData = [
    { month: 'Jan', Vidhai: 12, Mentorship: 8, Hostels: 5, Fellowship: 3 },
    { month: 'Feb', Vidhai: 14, Mentorship: 10, Hostels: 6, Fellowship: 4 },
    { month: 'Mar', Vidhai: 16, Mentorship: 12, Hostels: 7, Fellowship: 5 },
  ];

  if (metricsLoading || studentsLoading || alertsLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Enrolled"
          value={metrics?.total_enrolled || 0}
          delta={metrics?.enrolled_delta}
          deltaLabel="this month"
          icon={<Users size={24} />}
        />
        <MetricCard
          label="Active Students"
          value={metrics?.total_active || 0}
          icon={<Activity size={24} />}
        />
        <MetricCard
          label="At Risk"
          value={metrics?.at_risk_count || 0}
          icon={<AlertTriangle size={24} />}
        />
        <MetricCard
          label="Outcomes Recorded"
          value={metrics?.outcomes_count || 0}
          delta={metrics?.outcomes_delta}
          deltaLabel="this quarter"
          icon={<Trophy size={24} />}
        />
      </div>

      {/* Main content - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Students table + chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent students */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Students</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Student</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">District</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Programs</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Score</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Last Activity</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((student) => (
                    <StudentRow key={student.id} student={student} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Program enrollment trend */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Program Enrollment Trend (6 months)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A2B4A', border: 'none', borderRadius: '8px', color: 'white' }}
                  labelStyle={{ color: 'white' }}
                />
                <Bar dataKey="Vidhai" fill="#0D9488" />
                <Bar dataKey="Mentorship" fill="#7C3AED" />
                <Bar dataKey="Hostels" fill="#F59E0B" />
                <Bar dataKey="Fellowship" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Alerts sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">At-Risk Alerts</h2>
            <div className="space-y-3">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))
              ) : (
                <p className="text-sm text-slate-600 text-center py-4">No active alerts</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
