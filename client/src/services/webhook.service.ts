import api from './api';

export interface WebhookConfig {
  id: number;
  name: string;
  endpoint_url: string;
  api_key?: string | null;
  deal_created: boolean;
  deal_updated: boolean;
  max_retries: number;
  is_active: boolean;
  created_at: string;
}

export interface WebhookDelivery {
  id: number;
  webhook_id: number;
  deal_id: number;
  event_type: string;
  response_status: number | null;
  attempt_number: number;
  status: 'success' | 'failed' | 'retrying';
  error_message?: string | null;
  created_at: string;
}

export const webhookService = {
  async list(): Promise<WebhookConfig[]> {
    const res = await api.get('/webhooks');
    return res.data.data;
  },
  async create(data: {
    name: string;
    endpoint_url: string;
    api_key?: string;
    deal_created: boolean;
    deal_updated: boolean;
    max_retries: number;
  }) {
    const res = await api.post('/webhooks', data);
    return res.data;
  },
  async update(id: number, data: Partial<WebhookConfig>) {
    const res = await api.put(`/webhooks/${id}`, data);
    return res.data;
  },
  async toggle(id: number) {
    const res = await api.patch(`/webhooks/${id}/toggle`);
    return res.data;
  },
  async remove(id: number) {
    const res = await api.delete(`/webhooks/${id}`);
    return res.data;
  },
  async deliveries(id: number): Promise<WebhookDelivery[]> {
    const res = await api.get(`/webhooks/${id}/deliveries`);
    return res.data.data;
  },
};
