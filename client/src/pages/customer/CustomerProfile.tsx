import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/auth.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Mail, Building, Phone, Calendar, ShieldCheck, Edit3 } from 'lucide-react';

export const CustomerProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    company: user?.company || '',
    password: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleOpenEdit = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      company: user?.company || '',
      password: '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await authService.updateProfile(formData);
      await refreshUser();
      showToast('Profile updated successfully!', 'success');
      setIsEditModalOpen(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Account Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Your personal and organization support contact details
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenEdit}
          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
        >
          Edit Profile
        </Button>
      </div>

      <Card title="Profile Information" subtitle="Registered user identity and contact information">
        <div className="space-y-6">
          {/* Avatar and name banner */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-indigo-100">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  Active Customer Account
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 font-medium mb-1">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Email Address</span>
              </div>
              <p className="font-semibold text-slate-900 text-sm">{user?.email}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 font-medium mb-1">
                <Building className="w-4 h-4 text-slate-500" />
                <span>Company / Organization</span>
              </div>
              <p className="font-semibold text-slate-900 text-sm">{user?.company || 'N/A'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 font-medium mb-1">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>Phone Number</span>
              </div>
              <p className="font-semibold text-slate-900 text-sm">{user?.phone || 'N/A'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 font-medium mb-1">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Account Created</span>
              </div>
              <p className="font-semibold text-slate-900 text-sm">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        subtitle="Update your contact details or password."
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1-555-0101"
          />

          <Input
            label="Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Acme Corp"
          />

          <Input
            label="New Password (optional)"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Leave blank to keep current password"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdating}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
