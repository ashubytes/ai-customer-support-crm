import api from './api';
import {
  Ticket,
  Message,
  ApiResponse,
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from '../types';

export interface TicketFilterParams {
  status?: string;
  priority?: string;
  category?: string;
  assignedAgentId?: number;
  customerId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TicketListResult {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
}

export const ticketService = {
  async listTickets(params: TicketFilterParams = {}): Promise<TicketListResult> {
    const res = await api.get<ApiResponse<TicketListResult>>('/tickets', { params });
    return res.data.data;
  },

  async getTicket(id: number | string): Promise<Ticket> {
    const res = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    return res.data.data;
  },

  async createTicket(data: {
    subject: string;
    description: string;
    category?: TicketCategory;
    priority?: TicketPriority;
    customerId?: number;
  }): Promise<Ticket> {
    const res = await api.post<ApiResponse<Ticket>>('/tickets', data);
    return res.data.data;
  },

  async updateStatus(id: number | string, status: TicketStatus, notes?: string): Promise<Ticket> {
    const res = await api.put<ApiResponse<Ticket>>(`/tickets/${id}/status`, { status, notes });
    return res.data.data;
  },

  async assignAgent(id: number | string, agentId: number | null): Promise<Ticket> {
    const res = await api.put<ApiResponse<Ticket>>(`/tickets/${id}/assign`, { agentId });
    return res.data.data;
  },

  async updatePriority(id: number | string, priority: TicketPriority): Promise<Ticket> {
    const res = await api.put<ApiResponse<Ticket>>(`/tickets/${id}/priority`, { priority });
    return res.data.data;
  },

  async regenerateAiSuggestion(id: number | string): Promise<{ suggested_reply: string }> {
    const res = await api.post<ApiResponse<{ suggested_reply: string }>>(`/tickets/${id}/ai-suggest`);
    return res.data.data;
  },

  async getMessages(ticketId: number | string): Promise<Message[]> {
    const res = await api.get<ApiResponse<Message[]>>(`/tickets/${ticketId}/messages`);
    return res.data.data;
  },

  async sendMessage(ticketId: number | string, message: string, isInternal: boolean = false): Promise<Message> {
    const res = await api.post<ApiResponse<Message>>(`/tickets/${ticketId}/messages`, {
      message,
      isInternal,
    });
    return res.data.data;
  },
};
