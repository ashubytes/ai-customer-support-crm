import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import { AuthLayout } from './layouts/AuthLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { AgentLayout } from './layouts/AgentLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CreateTicket } from './pages/customer/CreateTicket';
import { CustomerTickets } from './pages/customer/CustomerTickets';
import { CustomerTicketDetail } from './pages/customer/CustomerTicketDetail';
import { CustomerProfile } from './pages/customer/CustomerProfile';

// Agent Pages
import { AgentDashboard } from './pages/agent/AgentDashboard';
import { AgentTickets } from './pages/agent/AgentTickets';
import { AgentTicketDetail } from './pages/agent/AgentTicketDetail';
import { CustomerDirectory } from './pages/agent/CustomerDirectory';
import { CustomerProfileView } from './pages/agent/CustomerProfileView';
import { AgentAnalytics } from './pages/agent/AgentAnalytics';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { CustomerManagement } from './pages/admin/CustomerManagement';
import { TicketManagement } from './pages/admin/TicketManagement';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { WebhookManagement } from './pages/admin/WebhookManagement';
import { DealManagement } from './pages/admin/DealManagement';

import { NotFound } from './pages/NotFound';

// Root redirector based on authenticated user role
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'agent') return <Navigate to="/agent/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Root Route */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public / Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Customer Portal */}
            <Route path="/customer" element={<CustomerLayout />}>
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="tickets/new" element={<CreateTicket />} />
              <Route path="tickets" element={<CustomerTickets />} />
              <Route path="tickets/:id" element={<CustomerTicketDetail />} />
              <Route path="profile" element={<CustomerProfile />} />
            </Route>

            {/* Agent Portal */}
            <Route path="/agent" element={<AgentLayout />}>
              <Route path="dashboard" element={<AgentDashboard />} />
              <Route path="tickets" element={<AgentTickets />} />
              <Route path="tickets/:id" element={<AgentTicketDetail />} />
              <Route path="customers" element={<CustomerDirectory />} />
              <Route path="customers/:id" element={<CustomerProfileView />} />
              <Route path="analytics" element={<AgentAnalytics />} />
            </Route>

            {/* Admin Portal */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="tickets" element={<TicketManagement />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="deals" element={<DealManagement />} />
              <Route path="webhooks" element={<WebhookManagement />} />
            </Route>

            {/* 404 Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
