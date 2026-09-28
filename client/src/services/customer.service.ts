import api from './api';
import { Customer, CustomerCRMProfile, ApiResponse } from '../types';

export interface CustomerListResult {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
}

export const customerService = {
  async listCustomers(params: { search?: string; page?: number; limit?: number } = {}): Promise<CustomerListResult> {
    const res = await api.get<ApiResponse<CustomerListResult>>('/customers', { params });
    return res.data.data;
  },

  async getCustomerProfile(id: number | string): Promise<CustomerCRMProfile> {
    const res = await api.get<ApiResponse<CustomerCRMProfile>>(`/customers/${id}`);
    return res.data.data;
  },

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const res = await api.post<ApiResponse<Customer>>('/customers', data);
    return res.data.data;
  },

  async updateCustomer(id: number | string, data: Partial<Customer>): Promise<Customer> {
    const res = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return res.data.data;
  },
};
