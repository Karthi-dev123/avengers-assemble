import React, { useState } from 'react';
import { TimelineEntry } from '../../lib/types';
import { PROGRAM_COLORS } from '../../lib/constants';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface TimelineEventProps {
  event: TimelineEntry;
}

export const TimelineEvent: React.FC<TimelineEventProps> = ({ event }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const programColor = event.program ? PROGRAM_COLORS[event.program as keyof typeof PROGRAM_COLORS] : '#94A3B8';

  const typeIcons = {
    enrollment: '🎯',
    interaction: '💬',
    meeting: '🎥',
    outcome: '🏆',
    score_change: '📈',
    alert: '⚠️',
  };

  const typeIcon = typeIcons[event.type];

  return (
    <div className="flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${programColor}20` }}>
          {typeIcon}
        </div>
        <div className="w-1 h-12 bg-slate-200 mt-2" />
      </div>

      {/* Event content */}
      <div className="flex-1 pb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{formatDate(event.date)}</p>
              <h4 className="font-semibold text-slate-900">{event.title}</h4>
              <p className="text-sm text-slate-600 mt-1">{event.description}</p>
            </div>
            {event.expandable && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-4 p-1 hover:bg-slate-100 rounded transition-colors"
              >
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            )}
          </div>

          {/* Expanded content */}
          {isExpanded && event.metadata && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              {event.metadata.summary && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Summary</p>
                  <p className="text-sm text-slate-700">{event.metadata.summary}</p>
                </div>
              )}
              {event.metadata.actions && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Action Items</p>
                  <ul className="space-y-1">
                    {event.metadata.actions.map((action: string, idx: number) => (
                      <li key={idx} className="text-sm text-slate-700 flex gap-2">
                        <span>•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
