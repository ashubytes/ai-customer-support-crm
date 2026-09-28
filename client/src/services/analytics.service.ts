import api from './api';
import { AnalyticsData, ApiResponse } from '../types';

export const analyticsService = {
  async getOverview(): Promise<AnalyticsData> {
    const res = await api.get<ApiResponse<AnalyticsData>>('/analytics/overview');
    return res.data.data;
  },
};
