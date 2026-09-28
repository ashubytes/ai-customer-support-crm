import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { TicketCategory } from '../../types';
import { Sparkles, Send, ArrowLeft } from 'lucide-react';

export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [subject, setSubject] = useState<string>('');
  const [category, setCategory] = useState<TicketCategory>('Technical Issue');
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const categories: TicketCategory[] = [
    'Technical Issue',
    'Payment',
    'Billing',
    'Refund',
    'Account',
    'Login',
    'Order',
    'Product',
    'Delivery',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Please provide a subject and detailed description.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const newTicket = await ticketService.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
      });

      showToast(`Ticket ${newTicket.ticket_number} created and analyzed by AI!`, 'success');
      navigate(`/customer/tickets/${newTicket.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create ticket. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top navigation */}
      <button
        onClick={() => navigate('/customer/tickets')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to tickets
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Submit a Support Request
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Our AI triage assistant will analyze your inquiry and route it to the right specialist.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <Input
            label="Ticket Subject"
            placeholder="e.g. Cannot access dashboard after recent upgrade"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            helperText="Summarize your issue in one concise sentence"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-900"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Detailed Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Please provide steps to reproduce, error codes, invoice numbers, or relevant context..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-900 leading-relaxed"
              required
            />
            <p className="mt-1 text-xs text-slate-400">
              The more details you provide, the faster our AI and support agents can resolve your inquiry.
            </p>
          </div>

          {/* AI Banner */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100">
            <div className="p-2 rounded-lg bg-indigo-600 text-white flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs text-indigo-950 leading-relaxed">
              <span className="font-bold">Automated AI Triage:</span> Upon submission, our Gemini AI engine will automatically summarize your ticket, assess priority, and suggest an immediate resolution path.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/customer/tickets')}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Submit Ticket
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
