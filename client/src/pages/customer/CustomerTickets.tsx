import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import { Ticket } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TicketTable } from '../../components/tickets/TicketTable';
import { TicketFilters } from '../../components/tickets/TicketFilters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PlusCircle } from 'lucide-react';

export const CustomerTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters state
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [category, setCategory] = useState<string>('');

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Support Tickets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {tickets.length} of {total} tickets
          </p>
        </div>

        <Link to="/customer/tickets/new">
          <Button
            size="md"
            variant="primary"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Create Ticket
          </Button>
        </Link>
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
          <LoadingSpinner message="Filtering your tickets..." />
        ) : (
          <TicketTable
            tickets={tickets}
            detailRoutePrefix="/customer/tickets"
            showCustomer={false}
          />
        )}
      </Card>
    </div>
  );
};
