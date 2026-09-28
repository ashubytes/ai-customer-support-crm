import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Eye, Link2, Power, Trash2, XCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { webhookService, WebhookConfig, WebhookDelivery } from '../../services/webhook.service';

export const WebhookManagement: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [selectedLogs, setSelectedLogs] = useState<WebhookDelivery[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    endpoint_url: '',
    api_key: '',
    deal_created: true,
    deal_updated: true,
    max_retries: 3,
  });

  const load = async () => {
    setLoading(true);
    try {
      setWebhooks(await webhookService.list());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await webhookService.create(form);
      setForm({ name: '', endpoint_url: '', api_key: '', deal_created: true, deal_updated: true, max_retries: 3 });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const showLogs = async (id: number) => {
    setSelectedId(id);
    setSelectedLogs(await webhookService.deliveries(id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Outbound Webhooks</h1>
        <p className="text-sm text-slate-500 mt-1">
          Synchronize deal creation and updates with external systems.
        </p>
      </div>

      <Card title="Configure webhook" subtitle="Choose which deal events should be delivered.">
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border rounded-xl px-3 py-2" placeholder="Webhook name" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border rounded-xl px-3 py-2" placeholder="https://example.com/webhook" required
            value={form.endpoint_url} onChange={(e) => setForm({ ...form, endpoint_url: e.target.value })} />
          <input className="border rounded-xl px-3 py-2" placeholder="API key (optional)" type="password"
            value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} />
          <input className="border rounded-xl px-3 py-2" type="number" min={0} max={10}
            value={form.max_retries} onChange={(e) => setForm({ ...form, max_retries: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.deal_created}
              onChange={(e) => setForm({ ...form, deal_created: e.target.checked })} />
            Deal created
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.deal_updated}
              onChange={(e) => setForm({ ...form, deal_updated: e.target.checked })} />
            Deal updated
          </label>
          <div className="md:col-span-2">
            <Button type="submit" isLoading={saving} leftIcon={<Link2 className="w-4 h-4" />}>
              Save Webhook
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Configured webhooks" subtitle="Active endpoints and delivery controls." noPadding>
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading...</div>
        ) : webhooks.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No webhooks configured.</div>
        ) : (
          <div className="divide-y">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${webhook.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <p className="font-semibold text-slate-900">{webhook.name}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{webhook.endpoint_url}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Events: {webhook.deal_created ? 'created ' : ''}{webhook.deal_updated ? 'updated' : ''}
                    {' · '}Retries: {webhook.max_retries}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => showLogs(webhook.id)}
                    leftIcon={<Eye className="w-4 h-4" />}>Logs</Button>
                  <Button size="sm" variant={webhook.is_active ? 'secondary' : 'success'}
                    onClick={async () => { await webhookService.toggle(webhook.id); await load(); }}
                    leftIcon={<Power className="w-4 h-4" />}>
                    {webhook.is_active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button size="sm" variant="danger" onClick={async () => { await webhookService.remove(webhook.id); await load(); }}
                    leftIcon={<Trash2 className="w-4 h-4" />}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedId !== null && (
        <Card title="Delivery logs" subtitle="Latest 200 delivery attempts." noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="p-3">Event</th><th className="p-3">Deal</th><th className="p-3">Status</th>
                  <th className="p-3">HTTP</th><th className="p-3">Attempt</th><th className="p-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {selectedLogs.map((log) => (
                  <tr key={log.id} className="border-t">
                    <td className="p-3">{log.event_type}</td>
                    <td className="p-3">#{log.deal_id}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1">
                        {log.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
                         log.status === 'failed' ? <XCircle className="w-4 h-4 text-rose-600" /> :
                         <Activity className="w-4 h-4 text-amber-600" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3">{log.response_status ?? '-'}</td>
                    <td className="p-3">{log.attempt_number}</td>
                    <td className="p-3">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default WebhookManagement;
