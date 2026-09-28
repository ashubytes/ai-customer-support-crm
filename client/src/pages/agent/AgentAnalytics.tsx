import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analytics.service';
import { AnalyticsData } from '../../types';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const AgentAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    analyticsService
      .getOverview()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !data) {
    return <LoadingSpinner message="Calculating support analytics & metrics..." />;
  }

  // Colors for charts
  const CATEGORY_COLORS = ['#6366f1', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#64748b'];
  const SENTIMENT_COLORS: Record<string, string> = {
    Positive: '#10b981',
    Neutral: '#94a3b8',
    Negative: '#f43f5e',
  };

  const PRIORITY_COLORS: Record<string, string> = {
    Low: '#94a3b8',
    Medium: '#0ea5e9',
    High: '#f97316',
    Urgent: '#ef4444',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Support & CRM Analytics Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time metrics, AI triage distribution, sentiment analysis, and agent resolution speeds
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Tickets</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{data.kpi.totalTickets}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">All-time volume</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Active Queue</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {data.kpi.openTickets + data.kpi.inProgressTickets}
          </p>
          <span className="text-[10px] text-blue-500 mt-1 block">Requiring action</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Pending Feedback</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{data.kpi.pendingTickets}</p>
          <span className="text-[10px] text-amber-500 mt-1 block">Awaiting customer</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Resolved</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{data.kpi.resolvedTickets}</p>
          <span className="text-[10px] text-emerald-500 mt-1 block">Successfully closed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold text-slate-500">Avg Resolution</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {data.kpi.avgResolutionHours}h
          </p>
          <span className="text-[10px] text-indigo-500 mt-1 block">Target: &lt; 8 hours</span>
        </div>
      </div>

      {/* Row 1: Category Distribution & Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <Card
          title="Tickets by Category"
          subtitle="AI-detected issue categories across all tickets"
        >
          <div className="h-72 w-full">
            {data.byCategory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No category data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.byCategory}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {data.byCategory.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Priority Bar Chart */}
        <Card
          title="Priority Distribution"
          subtitle="Severity breakdown across open and resolved tickets"
        >
          <div className="h-72 w-full">
            {data.byPriority.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No priority data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byPriority} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="priority" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {data.byPriority.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PRIORITY_COLORS[entry.priority] || '#6366f1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Row 2: Sentiment Distribution & Status Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Donut Chart */}
        <Card
          title="AI Sentiment Analysis"
          subtitle="Customer sentiment detected at ticket creation"
        >
          <div className="h-72 w-full">
            {data.bySentiment.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No sentiment data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.bySentiment}
                    dataKey="count"
                    nameKey="sentiment"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={4}
                  >
                    {data.bySentiment.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={SENTIMENT_COLORS[entry.sentiment] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Status Breakdown Bar Chart */}
        <Card
          title="Tickets by Status"
          subtitle="Current lifecycle progression of tickets"
        >
          <div className="h-72 w-full">
            {data.byStatus.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No status data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byStatus} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Row 3: Agent Performance Table */}
      <Card
        title="Support Agent Performance"
        subtitle="Individual resolution metrics, caseloads, and response speeds"
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Agent Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-center">Total Assigned</th>
                <th className="py-3.5 px-4 text-center">Active Tickets</th>
                <th className="py-3.5 px-4 text-center">Resolved</th>
                <th className="py-3.5 px-4 text-center">Avg Resolution Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {data.agentPerformance.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      {agent.name.charAt(0)}
                    </div>
                    <span>{agent.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{agent.email}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                    {agent.total_assigned}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {agent.active_tickets}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {agent.total_resolved}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-indigo-600">
                    {agent.avg_resolution_hours !== null ? `${agent.avg_resolution_hours}h` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
