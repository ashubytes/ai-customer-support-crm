import api from './api';
import { User, ApiResponse, UserRole } from '../types';

export const userService = {
  async listUsers(params: { role?: string; search?: string } = {}): Promise<User[]> {
    const res = await api.get<ApiResponse<User[]>>('/users', { params });
    return res.data.data;
  },

  async getAgentsList(): Promise<User[]> {
    const res = await api.get<ApiResponse<User[]>>('/users/agents');
    return res.data.data;
  },

  async createUser(data: { name: string; email: string; password: string; role: UserRole }): Promise<User> {
    const res = await api.post<ApiResponse<User>>('/users', data);
    return res.data.data;
  },

  async toggleStatus(id: number | string, isActive: boolean): Promise<void> {
    await api.put(`/users/${id}/status`, { isActive });
  },

  async updateRole(id: number | string, role: UserRole): Promise<void> {
    await api.put(`/users/${id}/role`, { role });
  },
};
