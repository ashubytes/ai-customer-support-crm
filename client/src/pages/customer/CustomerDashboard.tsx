import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticket.service';
import { Ticket } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TicketTable } from '../../components/tickets/TicketTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PlusCircle, Ticket as TicketIcon, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    ticketService
      .listTickets({ limit: 5 })
      .then((res) => setTickets(res.tickets))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const total = tickets.length;
  const open = tickets.filter((t) => ['Open', 'Assigned', 'In Progress'].includes(t.status)).length;
  const resolved = tickets.filter((t) => t.status === 'Resolved').length;
  const pending = tickets.filter((t) => t.status === 'Pending').length;

  if (isLoading) {
    return <LoadingSpinner message="Loading customer dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
            Customer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-3">
            Welcome, {user?.name}!
          </h1>
          <p className="text-indigo-100 text-sm mt-1 max-w-xl leading-relaxed">
            Submit support inquiries, review real-time ticket progress, and communicate directly with our support team.
          </p>
        </div>
        <Link to="/customer/tickets/new">
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold border-none shadow-md whitespace-nowrap"
            leftIcon={<PlusCircle className="w-5 h-5" />}
          >
            Create New Ticket
          </Button>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">My Total Tickets</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{total}</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <TicketIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Active / In Progress</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{open}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Awaiting Feedback</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{pending}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Resolved</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{resolved}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <Card
        title="Recent Support Tickets"
        subtitle="Track your active inquiries and conversation updates"
        action={
          <Link
            to="/customer/tickets"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View All Tickets &rarr;
          </Link>
        }
        noPadding
      >
        <TicketTable
          tickets={tickets}
          detailRoutePrefix="/customer/tickets"
          showCustomer={false}
        />
      </Card>
    </div>
  );
};
