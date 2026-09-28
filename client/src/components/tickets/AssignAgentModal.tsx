import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { userService } from '../../services/user.service';
import { User } from '../../types';
import { UserCheck } from 'lucide-react';

interface AssignAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  currentAgentId: number | null;
  onAssign: (agentId: number | null) => Promise<void>;
}

export const AssignAgentModal: React.FC<AssignAgentModalProps> = ({
  isOpen,
  onClose,
  currentAgentId,
  onAssign,
}) => {
  const [agents, setAgents] = useState<User[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    currentAgentId ? String(currentAgentId) : ''
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      userService
        .getAgentsList()
        .then((res) => setAgents(res))
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
      setSelectedAgentId(currentAgentId ? String(currentAgentId) : '');
    }
  }, [isOpen, currentAgentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const targetId = selectedAgentId ? Number(selectedAgentId) : null;
      await onAssign(targetId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Support Agent"
      subtitle="Select a support agent to handle this ticket."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Support Agent
          </label>
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
          >
            <option value="">-- Unassigned --</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} ({agent.email})
              </option>
            ))}
          </select>
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
            leftIcon={<UserCheck className="w-3.5 h-3.5" />}
          >
            Save Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
