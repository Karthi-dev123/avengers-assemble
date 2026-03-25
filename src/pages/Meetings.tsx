import React, { useState } from 'react';
import { useMeetings } from '../hooks/useMeetings';
import { formatDateTime } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Play } from 'lucide-react';

export const Meetings: React.FC = () => {
  const { meetings, loading } = useMeetings();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const upcoming = meetings.filter(m => m.status === 'scheduled');
  const past = meetings.filter(m => m.status === 'completed' || m.status === 'cancelled');

  if (loading) {
    return <div className="p-8 text-center">Loading meetings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Meetings</h1>
        <p className="text-slate-600 mt-1">Schedule, track, and record mentor-student meetings</p>
      </div>

      {/* Upcoming Meetings */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Upcoming Meetings</h2>
        {upcoming.length > 0 ? (
          upcoming.map((meeting) => (
            <div key={meeting.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{meeting.student_name}</h3>
                  <p className="text-sm text-slate-600 mt-1">Mentor: {meeting.mentor_name}</p>
                  <p className="text-sm text-slate-600">Scheduled: {formatDateTime(meeting.scheduled_at)}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Scheduled
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/meetings/${meeting.id}/room`)}
                  className="px-4 py-2 bg-sidebar-accent text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
                >
                  <Play size={16} />
                  Join Meeting
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="card p-6 text-center text-slate-600">
            No upcoming meetings scheduled
          </div>
        )}
      </div>

      {/* Past Meetings */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Past Meetings</h2>
        {past.length > 0 ? (
          past.map((meeting) => (
            <div key={meeting.id} className="card overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === meeting.id ? null : meeting.id)}
                className="w-full p-6 text-left hover:bg-slate-50 transition-colors flex items-start justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{meeting.student_name}</h3>
                  <p className="text-sm text-slate-600 mt-1">Mentor: {meeting.mentor_name}</p>
                  <p className="text-sm text-slate-600">Date: {formatDateTime(meeting.scheduled_at)}</p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                      meeting.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                  </span>
                </div>
                {expandedId === meeting.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {/* Expanded content */}
              {expandedId === meeting.id && (
                <div className="px-6 pb-6 border-t border-slate-200 space-y-4">
                  {meeting.ai_summary && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Summary</p>
                      <p className="text-sm text-slate-700">{meeting.ai_summary}</p>
                    </div>
                  )}
                  {meeting.action_items && meeting.action_items.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Action Items</p>
                      <ul className="space-y-2">
                        {meeting.action_items.map((item, idx) => (
                          <li key={idx} className="text-sm text-slate-700 flex gap-2">
                            <span>•</span>
                            <span>
                              <strong>{item.task}</strong> (Owner: {item.owner})
                              {item.deadline && <span className="text-slate-600"> by {item.deadline}</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {meeting.transcript && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Full Transcript</p>
                      <p className="text-sm text-slate-700 italic">{meeting.transcript}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="card p-6 text-center text-slate-600">
            No past meetings recorded
          </div>
        )}
      </div>
    </div>
  );
};
