import React from 'react';
import { TicketStatus, TicketPriority, TicketSentiment } from '../../types';

export const StatusBadge: React.FC<{ status: TicketStatus | string }> = ({ status }) => {
  const styles: Record<string, string> = {
    Open: 'bg-blue-50 text-blue-700 border-blue-200/60 ring-1 ring-blue-500/10',
    Assigned: 'bg-purple-50 text-purple-700 border-purple-200/60 ring-1 ring-purple-500/10',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200/60 ring-1 ring-amber-500/10',
    Pending: 'bg-orange-50 text-orange-700 border-orange-200/60 ring-1 ring-orange-500/10',
    Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-1 ring-emerald-500/10',
    Closed: 'bg-slate-100 text-slate-700 border-slate-200/60 ring-1 ring-slate-500/10',
  };

  const currentStyle = styles[status] || styles['Open'];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${currentStyle}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TicketPriority | string }> = ({ priority }) => {
  const styles: Record<string, string> = {
    Low: 'bg-slate-100 text-slate-700 border-slate-200',
    Medium: 'bg-sky-50 text-sky-700 border-sky-200',
    High: 'bg-orange-50 text-orange-700 border-orange-200',
    Urgent: 'bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse',
  };

  const currentStyle = styles[priority] || styles['Medium'];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${currentStyle}`}
    >
      {priority}
    </span>
  );
};

export const SentimentBadge: React.FC<{ sentiment: TicketSentiment | string }> = ({ sentiment }) => {
  const styles: Record<string, { bg: string; dot: string }> = {
    Positive: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    Neutral: { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
    Negative: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  };

  const config = styles[sentiment] || styles['Neutral'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
      {sentiment}
    </span>
  );
};
