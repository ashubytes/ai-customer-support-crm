import React, { useState, useEffect } from 'react';
import { userService } from '../../services/user.service';
import { User, UserRole } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import {
  UserPlus,
  Search,
  Shield,
  Headphones,
  UserCheck,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Modal State for creating a user
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent' as UserRole,
  });
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const fetchUsers = () => {
    setIsLoading(true);
    userService
      .listUsers({ role: roleFilter || undefined, search: search || undefined })
      .then((res) => setUsers(res))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleToggleStatus = async (user: User) => {
    try {
      await userService.toggleStatus(user.id, !user.is_active);
      showToast(`User ${user.name} is now ${!user.is_active ? 'Active' : 'Inactive'}.`, 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await userService.updateRole(userId, newRole);
      showToast(`Role updated to ${newRole}.`, 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update role.', 'error');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      await userService.createUser(newUserData);
      showToast(`User ${newUserData.name} created successfully.`, 'success');
      setIsModalOpen(false);
      setNewUserData({ name: '', email: '', password: '', role: 'agent' });
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create user.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'agent':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <Headphones className="w-3 h-3" /> Agent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <UserCheck className="w-3 h-3" /> Customer
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            User & Agent Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage system administrators, support agents, and customer accounts
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Add Staff / Agent
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name or email..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
        >
          <option value="">All Roles</option>
          <option value="admin">Administrators</option>
          <option value="agent">Support Agents</option>
          <option value="customer">Customers</option>
        </select>
      </div>

      {/* Users Table */}
      <Card noPadding>
        {isLoading ? (
          <LoadingSpinner message="Loading user directory..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {getRoleBadge(u.role)}
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="text-[11px] border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50 text-slate-700 focus:outline-none"
                        >
                          <option value="customer">Customer</option>
                          <option value="agent">Agent</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant={u.is_active ? 'outline' : 'success'}
                        onClick={() => handleToggleStatus(u)}
                        className="text-xs"
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Staff or Support Agent"
        subtitle="Create a new internal team member account."
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            value={newUserData.name}
            onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
            placeholder="Agent Sarah"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={newUserData.email}
            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
            placeholder="sarah@crm.local"
            required
          />

          <Input
            label="Temporary Password"
            type="password"
            value={newUserData.password}
            onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
            placeholder="At least 6 characters"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assigned Role
            </label>
            <select
              value={newUserData.role}
              onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
            >
              <option value="agent">Support Agent</option>
              <option value="admin">Administrator</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreating}
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            >
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
