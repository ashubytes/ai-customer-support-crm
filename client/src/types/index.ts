export type UserRole = 'customer' | 'agent' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  customerId?: number;
  phone?: string;
  company?: string;
  created_at: string;
}

export interface Customer {
  id: number;
  user_id: number | null;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  notes: string | null;
  total_tickets?: number;
  active_tickets?: number;
  created_at: string;
  updated_at: string;
}

export type TicketCategory =
  | 'Account'
  | 'Payment'
  | 'Billing'
  | 'Refund'
  | 'Technical Issue'
  | 'Login'
  | 'Order'
  | 'Product'
  | 'Delivery'
  | 'Other';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TicketSentiment = 'Positive' | 'Neutral' | 'Negative';

export type TicketStatus =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Pending'
  | 'Resolved'
  | 'Closed';

export interface Ticket {
  id: number;
  ticket_number: string;
  customer_id: number;
  assigned_agent_id: number | null;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  sentiment: TicketSentiment;
  status: TicketStatus;
  ai_summary: string | null;
  ai_suggested_reply: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;

  customer_name?: string;
  customer_email?: string;
  customer_company?: string;
  customer_phone?: string;
  agent_name?: string;
  agent_email?: string;
  history?: TicketHistory[];
}

export interface Message {
  id: number;
  ticket_id: number;
  sender_id: number;
  message: string;
  sender_type: 'customer' | 'agent' | 'admin' | 'system';
  is_internal: boolean;
  created_at: string;
  sender_name?: string;
  sender_email?: string;
  sender_role?: UserRole;
}

export interface TicketHistory {
  id: number;
  ticket_id: number;
  actor_id: number | null;
  action: string;
  old_value: string | null;
  new_value: string | null;
  notes: string | null;
  created_at: string;
  actor_name?: string;
}

export interface CustomerCRMProfile extends Customer {
  stats: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    pendingTickets: number;
    avgSentiment: string;
  };
  recentTickets: Ticket[];
  interactionTimeline: {
    event_type: string;
    ticket_id: number;
    ticket_number: string;
    description: string;
    timestamp: string;
    actor_name: string;
    actor_type: string;
  }[];
}

export interface AnalyticsData {
  kpi: {
    totalCustomers: number;
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    pendingTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    avgResolutionHours: number;
  };
  byCategory: { category: TicketCategory; count: number }[];
  byPriority: { priority: TicketPriority; count: number }[];
  byStatus: { status: TicketStatus; count: number }[];
  bySentiment: { sentiment: TicketSentiment; count: number }[];
  agentPerformance: {
    id: number;
    name: string;
    email: string;
    total_assigned: number;
    total_resolved: number;
    active_tickets: number;
    avg_resolution_hours: number | null;
  }[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any[];
}
