import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../../services/analytics.service';
import { userService } from '../../services/user.service';
import { ticketService } from '../../services/ticket.service';
import { AnalyticsData, Ticket } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TicketTable } from '../../components/tickets/TicketTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ShieldCheck,
  Users,
  Sparkles,
  Database,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getOverview(),
      ticketService.listTickets({ limit: 5 }),
      userService.listUsers(),
    ])
      .then(([analyticsRes, ticketRes, usersRes]) => {
        setAnalytics(analyticsRes);
        setRecentTickets(ticketRes.tickets);
        setUsersCount(usersRes.length);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !analytics) {
    return <LoadingSpinner message="Loading administrator control center..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Admin Welcome Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 bg-purple-900/50 border border-purple-700/50 px-3 py-1 rounded-full">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-3">
            Admin Command Center
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl leading-relaxed">
            Manage users, monitor AI triage pipelines, configure support teams, and inspect system KPIs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/users">
            <Button
              size="md"
              variant="primary"
              leftIcon={<Users className="w-4 h-4" />}
            >
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">MySQL 8.0 Persistence</p>
            <p className="text-sm font-bold text-slate-900">Online & Synchronized</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">FastAPI AI Microservice</p>
            <p className="text-sm font-bold text-slate-900">Gemini Triage Active</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">RBAC Security Guard</p>
            <p className="text-sm font-bold text-slate-900">3 Roles Enforced</p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total System Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{usersCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">CRM Customer Entities</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{analytics.kpi.totalCustomers}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Support Tickets</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{analytics.kpi.totalTickets}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Resolution Rate</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {analytics.kpi.totalTickets > 0
              ? `${Math.round((analytics.kpi.resolvedTickets / analytics.kpi.totalTickets) * 100)}%`
              : '100%'}
          </p>
        </div>
      </div>

      {/* Global Recent Tickets */}
      <Card
        title="Global Support Feed"
        subtitle="Live ticket submissions and triage events"
        action={
          <Link
            to="/admin/tickets"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Manage All Tickets &rarr;
          </Link>
        }
        noPadding
      >
        <TicketTable
          tickets={recentTickets}
          detailRoutePrefix="/agent/tickets"
          showCustomer={true}
        />
      </Card>
    </div>
  );
};
