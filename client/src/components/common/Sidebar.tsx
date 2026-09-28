import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  BarChart3,
  User,
  ShieldCheck,
  Building2,
  Webhook,
  BriefcaseBusiness,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;

  const customerNav = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Submit Ticket', path: '/customer/tickets/new', icon: PlusCircle },
    { name: 'My Tickets', path: '/customer/tickets', icon: Ticket },
    { name: 'My Profile', path: '/customer/profile', icon: User },
  ];

  const agentNav = [
    { name: 'Dashboard', path: '/agent/dashboard', icon: LayoutDashboard },
    { name: 'Ticket Queue', path: '/agent/tickets', icon: Ticket },
    { name: 'CRM Customers', path: '/agent/customers', icon: Building2 },
    { name: 'Analytics', path: '/agent/analytics', icon: BarChart3 },
  ];

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users & Agents', path: '/admin/users', icon: ShieldCheck },
    { name: 'CRM Directory', path: '/admin/customers', icon: Building2 },
    { name: 'All Tickets', path: '/admin/tickets', icon: Ticket },
    { name: 'System Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Deals', path: '/admin/deals', icon: BriefcaseBusiness },
    { name: 'Webhooks', path: '/admin/webhooks', icon: Webhook },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'agent' ? agentNav : customerNav;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        <nav className="space-y-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-semibold text-white">AI Engine Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Automated sentiment analysis, ticket triage, and reply suggestions ready.
          </p>
        </div>
      </div>
    </aside>
  );
};
