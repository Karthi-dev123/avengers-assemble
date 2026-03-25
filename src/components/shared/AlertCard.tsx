import React from 'react';
import { Alert } from '../../lib/types';
import { getAlertSeverityColor } from '../../lib/utils';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AlertCardProps {
  alert: Alert;
  onScheduleMeeting?: (alert: Alert) => void;
  onResolve?: (alert: Alert) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onScheduleMeeting, onResolve }) => {
  const navigate = useNavigate();
  const color = getAlertSeverityColor(alert.severity);

  const severityLabel = {
    critical: 'Critical',
    warning: 'Warning',
    watch: 'Watch',
  }[alert.severity];

  return (
    <div className="card p-4 border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: color }}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <AlertCircle size={20} color={color} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900">{alert.student_name}</h3>
            <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: color }}>
              {severityLabel}
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
          <p className="text-xs text-slate-500 mt-2 italic">Suggested: {alert.suggested_action}</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigate(`/students/${alert.student_id}`)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
            >
              View Profile →
            </button>
            {onScheduleMeeting && (
              <button
                onClick={() => onScheduleMeeting(alert)}
                className="text-xs font-medium px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
              >
                Schedule Meeting
              </button>
            )}
            {onResolve && (
              <button
                onClick={() => onResolve(alert)}
                className="text-xs font-medium px-2 py-1 bg-green-100 hover:bg-green-200 rounded text-green-700"
              >
                Resolve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
