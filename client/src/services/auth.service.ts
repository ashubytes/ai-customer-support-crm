import api from './api';
import { User, ApiResponse } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
    return res.data.data;
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    company?: string;
  }): Promise<LoginResponse> {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/register', data);
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.data.user;
  },

  async updateProfile(data: { name?: string; phone?: string; company?: string; password?: string }): Promise<void> {
    await api.put('/auth/profile', data);
  },
};
