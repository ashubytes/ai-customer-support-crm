import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import { CustomerCRMProfile } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { CustomerStatsCard } from '../../components/crm/CustomerStatsCard';
import { CustomerTimeline } from '../../components/crm/CustomerTimeline';
import { TicketTable } from '../../components/tickets/TicketTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Edit3,
} from 'lucide-react';

export const CustomerProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<CustomerCRMProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    notes: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProfile = () => {
    if (!id) return;
    setIsLoading(true);
    customerService
      .getCustomerProfile(id)
      .then((data) => {
        setProfile(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          company: data.company || '',
          notes: data.notes || '',
        });
      })
      .catch(() => {
        showToast('Failed to load customer CRM profile.', 'error');
        navigate('/agent/customers');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleOpenEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        company: profile.company || '',
        notes: profile.notes || '',
      });
      setIsEditModalOpen(true);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setIsUpdating(true);
      await customerService.updateCustomer(id, formData);
      showToast('Customer record updated successfully!', 'success');
      setIsEditModalOpen(false);
      fetchProfile();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update customer record', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !profile) {
    return <LoadingSpinner message="Assembling 360-degree customer profile..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/agent/customers')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to CRM Directory
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenEdit}
          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
        >
          Edit Customer & Notes
        </Button>
      </div>

      {/* Customer Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-indigo-100 flex-shrink-0">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{profile.name}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                CRM Contact #{profile.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {profile.company || 'Individual Client'}
            </p>
          </div>
        </div>

        {/* Contact Info Pills */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{profile.email}</span>
          </div>

          {profile.phone && (
            <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <Calendar className="w-3.5 h-3.5" />
            <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* CRM Statistics KPI Cards */}
      <CustomerStatsCard stats={profile.stats} />

      {/* 2-Column Section: Interaction Timeline & Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Tickets & Customer Notes */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Recent Support Tickets"
            subtitle="Previous ticket history for this customer"
            noPadding
          >
            <TicketTable
              tickets={profile.recentTickets || []}
              detailRoutePrefix="/agent/tickets"
              showCustomer={false}
            />
          </Card>

          {/* CRM Account Notes */}
          <Card
            title="Internal CRM Notes"
            subtitle="Account insights and instructions for support agents"
            action={
              <button
                onClick={handleOpenEdit}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Edit Notes
              </button>
            }
          >
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
              {profile.notes || 'No custom notes recorded for this customer account.'}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Complete Interaction Timeline */}
        <div className="space-y-6">
          <Card
            title="Interaction Timeline"
            subtitle="Chronological audit of tickets, replies, and status updates"
          >
            <CustomerTimeline events={profile.interactionTimeline} />
          </Card>
        </div>
      </div>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Customer Profile & Notes"
        subtitle="Update CRM contact details and internal account notes."
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <Input
            label="Customer Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Acme Corp"
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1-555-0101"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Internal CRM Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="Enterprise tier client, prefers email communication, etc."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 leading-relaxed"
            />
          </div>

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
              Save CRM Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
