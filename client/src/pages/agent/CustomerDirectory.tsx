import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import { Customer } from '../../types';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search, Mail, Phone, ArrowRight } from 'lucide-react';

export const CustomerDirectory: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCustomers = () => {
    setIsLoading(true);
    customerService
      .listCustomers({ search: search || undefined })
      .then((res) => {
        setCustomers(res.customers);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            CRM Customer Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search customer profiles, account histories, and interaction timelines
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, company, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
          />
        </div>
      </div>

      {/* Customers Table */}
      <Card noPadding>
        {isLoading ? (
          <LoadingSpinner message="Searching CRM customer directory..." />
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium">
            No customers found matching "{search}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4 text-center">Total Tickets</th>
                  <th className="py-3.5 px-4 text-center">Active Tickets</th>
                  <th className="py-3.5 px-4 text-right">360° Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <Link
                            to={`/agent/customers/${c.id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600"
                          >
                            {c.name}
                          </Link>
                          <p className="text-[11px] text-slate-400">ID: #{c.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{c.company || 'Individual'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                        {c.total_tickets || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          (c.active_tickets || 0) > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {c.active_tickets || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/agent/customers/${c.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        <span>View 360° CRM</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
