import React from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { AlertCard } from '../components/shared/AlertCard';
import { ALERT_SEVERITY_ORDER } from '../lib/constants';

export const Alerts: React.FC = () => {
  const { alerts, loading } = useAlerts();

  // Sort by severity
  const sortedAlerts = [...alerts].sort((a, b) => {
    return ALERT_SEVERITY_ORDER.indexOf(a.severity) - ALERT_SEVERITY_ORDER.indexOf(b.severity);
  });

  if (loading) {
    return <div className="p-8 text-center">Loading alerts...</div>;
  }

  const criticalAlerts = sortedAlerts.filter(a => a.severity === 'critical');
  const warningAlerts = sortedAlerts.filter(a => a.severity === 'warning');
  const watchAlerts = sortedAlerts.filter(a => a.severity === 'watch');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Alerts</h1>
        <p className="text-slate-600 mt-1">
          Monitor student performance and take action on alerts
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-red-600">
          <p className="text-sm text-slate-600">Critical Alerts</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{criticalAlerts.length}</p>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <p className="text-sm text-slate-600">Warnings</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{warningAlerts.length}</p>
        </div>
        <div className="card p-4 border-l-4 border-slate-400">
          <p className="text-sm text-slate-600">Watch</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{watchAlerts.length}</p>
        </div>
      </div>

      {/* Alerts by category */}
      {sortedAlerts.length > 0 ? (
        <div className="space-y-8">
          {criticalAlerts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-600 rounded-full" />
                Critical Alerts ({criticalAlerts.length})
              </h2>
              <div className="space-y-3">
                {criticalAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {warningAlerts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-amber-600 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-500 rounded-full" />
                Warnings ({warningAlerts.length})
              </h2>
              <div className="space-y-3">
                {warningAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {watchAlerts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-slate-400 rounded-full" />
                Watch ({watchAlerts.length})
              </h2>
              <div className="space-y-3">
                {watchAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-8 text-center text-slate-600">
          <p className="text-lg">No active alerts</p>
          <p className="text-sm mt-1">All students are performing well!</p>
        </div>
      )}
    </div>
  );
};
