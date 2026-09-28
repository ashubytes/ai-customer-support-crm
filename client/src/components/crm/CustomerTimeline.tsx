import React from 'react';
import { PlusCircle, MessageSquare, History, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TimelineEvent {
  event_type: string;
  ticket_id: number;
  ticket_number: string;
  description: string;
  timestamp: string;
  actor_name: string;
  actor_type: string;
}

interface CustomerTimelineProps {
  events: TimelineEvent[];
}

export const CustomerTimeline: React.FC<CustomerTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-xs font-medium">
        No interaction events recorded yet.
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'TICKET_CREATED':
        return <PlusCircle className="w-4 h-4 text-blue-600" />;
      case 'MESSAGE_SENT':
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case 'STATUS_CHANGE':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <History className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'TICKET_CREATED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'MESSAGE_SENT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'STATUS_CHANGE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((event, idx) => (
        <div key={idx} className="relative group">
          {/* Timeline bullet */}
          <div className="absolute -left-6 mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-white border border-slate-300 shadow-xs ring-4 ring-slate-50 group-hover:border-indigo-500 transition-colors">
            {getEventIcon(event.event_type)}
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getBadgeStyle(
                    event.event_type
                  )}`}
                >
                  {event.event_type.replace('_', ' ')}
                </span>
                <Link
                  to={`/agent/tickets/${event.ticket_id}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {event.ticket_number}
                </Link>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                {new Date(event.timestamp).toLocaleString()}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-sans line-clamp-3">
              {event.description}
            </p>

            <div className="mt-2 text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <span>By:</span>
              <span className="text-slate-600 font-semibold">{event.actor_name}</span>
              <span className="text-slate-300">•</span>
              <span className="capitalize text-slate-500">{event.actor_type}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
