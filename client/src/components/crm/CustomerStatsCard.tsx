import React from 'react';
import { Ticket, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface CustomerStatsProps {
  stats: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    pendingTickets: number;
    avgSentiment?: string;
  };
}

export const CustomerStatsCard: React.FC<CustomerStatsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Total Tickets',
      value: stats.totalTickets,
      icon: Ticket,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      label: 'Open / Active',
      value: stats.openTickets,
      icon: Clock,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      label: 'Resolved',
      value: stats.resolvedTickets,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'Pending',
      value: stats.pendingTickets,
      icon: AlertCircle,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-medium text-slate-500">{c.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{c.value}</p>
            </div>
            <div className={`p-3 rounded-xl border ${c.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
