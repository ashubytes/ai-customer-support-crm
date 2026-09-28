import api from './api';

export interface Deal {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_company?: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expected_close_date?: string | null;
  created_at: string;
  updated_at: string;
}

export const dealService = {
  async list(search = ''): Promise<Deal[]> {
    const res = await api.get('/deals', { params: { search } });
    return res.data.data;
  },
  async create(data: {
    customerId: number;
    title: string;
    value: number;
    stage: string;
    probability: number;
    expectedCloseDate?: string;
  }): Promise<Deal> {
    const res = await api.post('/deals', data);
    return res.data.data;
  },
  async update(id: number, data: Partial<Deal> & { expectedCloseDate?: string }) {
    const res = await api.put(`/deals/${id}`, data);
    return res.data.data;
  },
};
