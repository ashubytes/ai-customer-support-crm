import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import { Ticket } from '../../types';
import { Card } from '../../components/common/Card';
import { TicketTable } from '../../components/tickets/TicketTable';
import { TicketFilters } from '../../components/tickets/TicketFilters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AgentTickets: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters state initialized from query params if any
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [status, setStatus] = useState<string>(searchParams.get('status') || '');
  const [priority, setPriority] = useState<string>(searchParams.get('priority') || '');
  const [category, setCategory] = useState<string>(searchParams.get('category') || '');

  const fetchTickets = () => {
    setIsLoading(true);
    ticketService
      .listTickets({
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        category: category || undefined,
      })
      .then((res) => {
        setTickets(res.tickets);
        setTotal(res.total);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, [search, status, priority, category]);

  const handleReset = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setCategory('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Support Ticket Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying {tickets.length} of {total} tickets in queue
          </p>
        </div>
      </div>

      <TicketFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        category={category}
        onCategoryChange={setCategory}
        onReset={handleReset}
      />

      <Card noPadding>
        {isLoading ? (
          <LoadingSpinner message="Filtering support queue..." />
        ) : (
          <TicketTable
            tickets={tickets}
            detailRoutePrefix="/agent/tickets"
            showCustomer={true}
          />
        )}
      </Card>
    </div>
  );
};
