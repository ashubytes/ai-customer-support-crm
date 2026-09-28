import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import { useToast } from '../../context/ToastContext';
import { Ticket, Message, TicketStatus, TicketPriority } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../../components/common/Badge';
import { AiAssistancePanel } from '../../components/ai/AiAssistancePanel';
import { MessageThread, MessageThreadHandle } from '../../components/tickets/MessageThread';
import { AssignAgentModal } from '../../components/tickets/AssignAgentModal';
import { StatusChangeModal } from '../../components/tickets/StatusChangeModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  History,
} from 'lucide-react';

export const AgentTicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const threadRef = useRef<MessageThreadHandle>(null);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegeneratingAi, setIsRegeneratingAi] = useState<boolean>(false);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const fetchTicketDetails = async () => {
    if (!id) return;
    try {
      const [ticketData, messageData] = await Promise.all([
        ticketService.getTicket(id),
        ticketService.getMessages(id),
      ]);
      setTicket(ticketData);
      setMessages(messageData);
    } catch (err: any) {
      showToast('Error loading ticket details.', 'error');
      navigate('/agent/tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  // AI Actions
  const handleUseSuggestion = (suggestedText: string) => {
    if (threadRef.current) {
      threadRef.current.setMessageText(suggestedText);
      showToast('AI suggestion copied into reply composer.', 'info');
    }
  };

  const handleRegenerateAi = async () => {
    if (!id) return;
    try {
      setIsRegeneratingAi(true);
      const res = await ticketService.regenerateAiSuggestion(id);
      if (ticket) {
        setTicket({ ...ticket, ai_suggested_reply: res.suggested_reply });
      }
      showToast('AI suggestion regenerated successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to regenerate AI reply.', 'error');
    } finally {
      setIsRegeneratingAi(false);
    }
  };

  // Messaging
  const handleSendMessage = async (messageText: string, isInternal: boolean) => {
    if (!id) return;
    try {
      const newMsg = await ticketService.sendMessage(id, messageText, isInternal);
      setMessages((prev) => [...prev, newMsg]);
      showToast(isInternal ? 'Internal note added.' : 'Reply sent to customer.', 'success');
      // Refresh status in case agent replied to an Open ticket
      const updated = await ticketService.getTicket(id);
      setTicket(updated);
    } catch (err: any) {
      showToast('Failed to post message.', 'error');
    }
  };

  // Status & Assignment updates
  const handleUpdateStatus = async (newStatus: TicketStatus, notes?: string) => {
    if (!id) return;
    try {
      const updated = await ticketService.updateStatus(id, newStatus, notes);
      setTicket(updated);
      showToast(`Ticket status updated to ${newStatus}.`, 'success');
      fetchTicketDetails(); // Refresh audit history
    } catch (err: any) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleAssignAgent = async (agentId: number | null) => {
    if (!id) return;
    try {
      const updated = await ticketService.assignAgent(id, agentId);
      setTicket(updated);
      showToast('Ticket assigned successfully.', 'success');
      fetchTicketDetails();
    } catch (err: any) {
      showToast('Failed to assign ticket.', 'error');
    }
  };

  const handleUpdatePriority = async (newPriority: TicketPriority) => {
    if (!id) return;
    try {
      const updated = await ticketService.updatePriority(id, newPriority);
      setTicket(updated);
      showToast(`Ticket priority updated to ${newPriority}.`, 'success');
      fetchTicketDetails();
    } catch (err: any) {
      showToast('Failed to update priority.', 'error');
    }
  };

  if (isLoading || !ticket) {
    return <LoadingSpinner message="Loading agent workspace..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/agent/tickets')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Ticket Queue
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs shadow-xs">
            <span className="text-slate-400 font-medium">Priority:</span>
            <select
              value={ticket.priority}
              onChange={(e) => handleUpdatePriority(e.target.value as TicketPriority)}
              className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAssignModalOpen(true)}
            leftIcon={<UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
            className="text-xs bg-white"
          >
            Assign Agent
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsStatusModalOpen(true)}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Change Status
          </Button>
        </div>
      </div>

      {/* Main Ticket Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              {ticket.ticket_number}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <SentimentBadge sentiment={ticket.sentiment} />
          </div>

          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Created {new Date(ticket.created_at).toLocaleString()}
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {ticket.subject}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
              {ticket.category}
            </span>
            <span>•</span>
            <span>Assigned: <strong className="text-slate-800">{ticket.agent_name || 'Unassigned'}</strong></span>
          </div>
        </div>
      </div>

      {/* 2-Column Layout: Main Chat vs AI Panel & CRM Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Assistance Panel & Conversation Messages */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Intelligence Assistance Panel */}
          <AiAssistancePanel
            category={ticket.category}
            priority={ticket.priority}
            sentiment={ticket.sentiment}
            summary={ticket.ai_summary}
            suggestedReply={ticket.ai_suggested_reply}
            onUseSuggestion={handleUseSuggestion}
            onRegenerate={handleRegenerateAi}
            onSendReply={(reply) => handleSendMessage(reply, false)}
            isRegenerating={isRegeneratingAi}
          />

          {/* Conversation Messages Thread */}
          <Card title="Customer Conversation Thread" subtitle="Public customer replies and internal notes">
            <MessageThread
              ref={threadRef}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </Card>
        </div>

        {/* Right Column: CRM Customer 360 Quick Card & Audit History */}
        <div className="space-y-6">
          {/* Customer CRM Summary Card */}
          <Card title="Customer CRM Info" subtitle="Linked client profile">
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {ticket.customer_name ? ticket.customer_name.charAt(0) : 'C'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {ticket.customer_name || 'Guest User'}
                  </h4>
                  <p className="text-slate-500">{ticket.customer_company || 'Independent Customer'}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{ticket.customer_email}</span>
                </div>

                {ticket.customer_phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ticket.customer_phone}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <Link
                  to={`/agent/customers/${ticket.customer_id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-indigo-600 font-semibold text-xs border border-slate-200 transition-colors"
                >
                  <span>View 360° CRM Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </Card>

          {/* Ticket Audit History Accordion */}
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-500" />
                  Audit Trail History
                </span>
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-normal"
                >
                  {showHistory ? 'Hide' : 'Show'} ({ticket.history?.length || 0})
                </button>
              </div>
            }
          >
            {showHistory ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {ticket.history && ticket.history.length > 0 ? (
                  ticket.history.map((h) => (
                    <div key={h.id} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] uppercase text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {h.action}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 text-[11px]">{h.notes || `${h.old_value || ''} -> ${h.new_value || ''}`}</p>
                      <p className="text-[10px] text-slate-400">By: {h.actor_name || 'System'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-2">No history recorded.</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Click show to inspect lifecycle transitions and audit trail.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AssignAgentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        ticketId={ticket.id}
        currentAgentId={ticket.assigned_agent_id}
        onAssign={handleAssignAgent}
      />

      <StatusChangeModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentStatus={ticket.status}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};
