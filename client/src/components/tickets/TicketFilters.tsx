import { Search, RotateCcw } from 'lucide-react';

interface TicketFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  priority: string;
  onPriorityChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  onReset: () => void;
}

export const TicketFilters: React.FC<TicketFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  onReset,
}) => {
  const categories = [
    'All Categories',
    'Account',
    'Payment',
    'Billing',
    'Refund',
    'Technical Issue',
    'Login',
    'Order',
    'Product',
    'Delivery',
    'Other',
  ];

  const statuses = ['All Statuses', 'Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed'];

  const priorities = ['All Priorities', 'Low', 'Medium', 'High', 'Urgent'];

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by ticket, subject, or customer..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
          />
        </div>

        {/* Status */}
        <div>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
          >
            {statuses.map((s) => (
              <option key={s} value={s === 'All Statuses' ? '' : s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
          >
            {priorities.map((p) => (
              <option key={p} value={p === 'All Priorities' ? '' : p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
          >
            {categories.map((c) => (
              <option key={c} value={c === 'All Categories' ? '' : c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(search || status || priority || category) && (
        <div className="flex items-center justify-end pt-1">
          <button
            onClick={onReset}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
};
