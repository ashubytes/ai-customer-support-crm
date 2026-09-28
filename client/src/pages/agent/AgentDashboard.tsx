import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import { analyticsService } from '../../services/analytics.service';
import { Ticket, AnalyticsData } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TicketTable } from '../../components/tickets/TicketTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Inbox,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const AgentDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      ticketService.listTickets({ limit: 6 }),
      analyticsService.getOverview(),
    ])
      .then(([ticketRes, analyticsRes]) => {
        setTickets(ticketRes.tickets);
        setAnalytics(analyticsRes);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !analytics) {
    return <LoadingSpinner message="Loading support operations dashboard..." />;
  }

  const urgentTickets = tickets.filter(
    (t) => (t.priority === 'Urgent' || t.priority === 'High') && t.status !== 'Resolved'
  );

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Support Agent Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time queue monitoring, AI ticket triage, and CRM interaction timeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/agent/tickets">
            <Button variant="primary" size="md">
              View Ticket Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total System Tickets</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{analytics.kpi.totalTickets}</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Open / Active Queue</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{analytics.kpi.openTickets + analytics.kpi.inProgressTickets}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Resolved Tickets</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{analytics.kpi.resolvedTickets}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">CRM Customers</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{analytics.kpi.totalCustomers}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* AI Attention Banner */}
      {urgentTickets.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-600 text-white flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900">
                {urgentTickets.length} High / Urgent Priority Tickets in Queue
              </p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                AI sentiment analysis flagged negative sentiment or critical billing/technical failures.
              </p>
            </div>
          </div>
          <Link
            to="/agent/tickets?priority=Urgent"
            className="text-xs font-bold text-rose-700 hover:text-rose-900 underline whitespace-nowrap"
          >
            Review Urgent Tickets &rarr;
          </Link>
        </div>
      )}

      {/* Recent Ticket Queue */}
      <Card
        title="Recent Ticket Queue"
        subtitle="Showing latest support inquiries across all categories"
        action={
          <Link
            to="/agent/tickets"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View Full Queue &rarr;
          </Link>
        }
        noPadding
      >
        <TicketTable
          tickets={tickets}
          detailRoutePrefix="/agent/tickets"
          showCustomer={true}
        />
      </Card>
    </div>
  );
};
