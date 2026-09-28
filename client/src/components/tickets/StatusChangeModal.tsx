import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TicketStatus } from '../../types';
import { CheckCircle2 } from 'lucide-react';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: TicketStatus;
  onUpdateStatus: (newStatus: TicketStatus, notes?: string) => Promise<void>;
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  currentStatus,
  onUpdateStatus,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(currentStatus);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);
      setNotes('');
    }
  }, [isOpen, currentStatus]);

  const statuses: TicketStatus[] = [
    'Open',
    'Assigned',
    'In Progress',
    'Pending',
    'Resolved',
    'Closed',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onUpdateStatus(selectedStatus, notes.trim() || undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Ticket Status"
      subtitle="Update the lifecycle state of this support ticket."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            New Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Internal Note / Reason (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Reason for status change (e.g. Issue fixed in deployment #104)..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Update Status
          </Button>
        </div>
      </form>
    </Modal>
  );
};
