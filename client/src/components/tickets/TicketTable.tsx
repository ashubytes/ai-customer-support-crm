import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from '../../types';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../common/Badge';
import { ArrowRight } from 'lucide-react';

interface TicketTableProps {
  tickets: Ticket[];
  detailRoutePrefix?: string; // e.g. '/agent/tickets' or '/customer/tickets'
  showCustomer?: boolean;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  detailRoutePrefix = '/agent/tickets',
  showCustomer = true,
}) => {
  if (tickets.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm font-medium">
        No support tickets found matching criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="py-3.5 px-4">Ticket</th>
            <th className="py-3.5 px-4">Subject & Category</th>
            {showCustomer && <th className="py-3.5 px-4">Customer</th>}
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Priority</th>
            <th className="py-3.5 px-4">Sentiment</th>
            <th className="py-3.5 px-4">Assigned Agent</th>
            <th className="py-3.5 px-4">Created</th>
            <th className="py-3.5 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
          {tickets.map((t) => (
            <tr
              key={t.id}
              className="hover:bg-slate-50/80 transition-colors group"
            >
              {/* Ticket number */}
              <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600">
                <Link to={`${detailRoutePrefix}/${t.id}`} className="hover:underline">
                  {t.ticket_number}
                </Link>
              </td>

              {/* Subject & Category */}
              <td className="py-3.5 px-4 max-w-xs">
                <Link
                  to={`${detailRoutePrefix}/${t.id}`}
                  className="font-semibold text-slate-900 hover:text-indigo-600 truncate block text-sm"
                  title={t.subject}
                >
                  {t.subject}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                    {t.category}
                  </span>
                  {t.ai_summary && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                      AI: {t.ai_summary}
                    </span>
                  )}
                </div>
              </td>

              {/* Customer */}
              {showCustomer && (
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-slate-900">{t.customer_name || 'Guest'}</p>
                  <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                    {t.customer_company || t.customer_email}
                  </p>
                </td>
              )}

              {/* Status */}
              <td className="py-3.5 px-4">
                <StatusBadge status={t.status} />
              </td>

              {/* Priority */}
              <td className="py-3.5 px-4">
                <PriorityBadge priority={t.priority} />
              </td>

              {/* Sentiment */}
              <td className="py-3.5 px-4">
                <SentimentBadge sentiment={t.sentiment} />
              </td>

              {/* Assigned Agent */}
              <td className="py-3.5 px-4">
                {t.agent_name ? (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                      {t.agent_name.charAt(0)}
                    </div>
                    <span className="truncate max-w-[110px]">{t.agent_name}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                )}
              </td>

              {/* Created Date */}
              <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                {new Date(t.created_at).toLocaleDateString()}
              </td>

              {/* Action Link */}
              <td className="py-3.5 px-4 text-right">
                <Link
                  to={`${detailRoutePrefix}/${t.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
