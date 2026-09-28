import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Shield, Headphones, UserCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const roleBadges: Record<string, { label: string; icon: any; color: string }> = {
    admin: { label: 'Administrator', icon: Shield, color: 'bg-purple-100 text-purple-800 border-purple-200' },
    agent: { label: 'Support Agent', icon: Headphones, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    customer: { label: 'Customer', icon: UserCheck, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  };

  const currentRole = user?.role ? roleBadges[user.role] : null;
  const RoleIcon = currentRole?.icon;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-200">
          <span className="text-lg tracking-tight">N</span>
        </div>
        <div>
          <span className="font-bold text-slate-900 tracking-tight text-base">NexusCRM</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded ml-2">
            AI Support
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {currentRole && RoleIcon && (
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentRole.color}`}
          >
            <RoleIcon className="w-3.5 h-3.5" />
            {currentRole.label}
          </div>
        )}

        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
