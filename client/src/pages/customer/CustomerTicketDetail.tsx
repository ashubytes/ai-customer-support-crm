import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import { useToast } from '../../context/ToastContext';
import { Ticket, Message } from '../../types';
import { Card } from '../../components/common/Card';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { MessageThread } from '../../components/tickets/MessageThread';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ArrowLeft, Calendar, User } from 'lucide-react';

export const CustomerTicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTicketData = async () => {
    if (!id) return;
    try {
      const [ticketData, messageData] = await Promise.all([
        ticketService.getTicket(id),
        ticketService.getMessages(id),
      ]);
      setTicket(ticketData);
      setMessages(messageData);
    } catch (err: any) {
      showToast('Failed to load ticket details.', 'error');
      navigate('/customer/tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketData();
  }, [id]);

  const handleSendMessage = async (messageText: string) => {
    if (!id) return;
    try {
      const newMsg = await ticketService.sendMessage(id, messageText, false);
      setMessages((prev) => [...prev, newMsg]);
      showToast('Message sent!', 'success');
      // Refresh status in case customer reopened a resolved ticket
      const updatedTicket = await ticketService.getTicket(id);
      setTicket(updatedTicket);
    } catch (err: any) {
      showToast('Failed to send message.', 'error');
    }
  };

  if (isLoading || !ticket) {
    return <LoadingSpinner message="Loading support ticket conversation..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/customer/tickets')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to tickets list
      </button>

      {/* Ticket Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              {ticket.ticket_number}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            Created: {new Date(ticket.created_at).toLocaleString()}
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {ticket.subject}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
              Category: {ticket.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Assigned Specialist: {ticket.agent_name || 'Assigned to Support Pool'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Conversation Thread */}
      <Card title="Support Conversation" subtitle="Live discussion with our support team">
        <MessageThread
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </Card>
    </div>
  );
};
