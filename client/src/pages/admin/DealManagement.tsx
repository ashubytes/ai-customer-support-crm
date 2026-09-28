import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { dealService, Deal } from '../../services/deal.service';

export const DealManagement: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ customerId: '', title: '', value: '0', stage: 'Prospecting', probability: '0' });

  const load = async () => setDeals(await dealService.list(search));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await dealService.create({
      customerId: Number(form.customerId),
      title: form.title,
      value: Number(form.value),
      stage: form.stage,
      probability: Number(form.probability),
    });
    setForm({ customerId: '', title: '', value: '0', stage: 'Prospecting', probability: '0' });
    await load();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Deal Synchronization</h1>
          <p className="text-sm text-slate-500">Creating or updating a deal triggers configured outbound webhooks.</p></div>
        <Button variant="outline" onClick={load} leftIcon={<RefreshCw className="w-4 h-4" />}>Refresh</Button>
      </div>

      <Card title="Create deal" subtitle="Use this form to test deal.created webhook delivery.">
        <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border rounded-xl px-3 py-2" placeholder="Customer ID" type="number" required
            value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })} />
          <input className="border rounded-xl px-3 py-2" placeholder="Deal title" required
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <input className="border rounded-xl px-3 py-2" placeholder="Value" type="number"
            value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
          <input className="border rounded-xl px-3 py-2" placeholder="Stage"
            value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })} />
          <input className="border rounded-xl px-3 py-2" placeholder="Probability %" type="number" min={0} max={100}
            value={form.probability} onChange={e => setForm({ ...form, probability: e.target.value })} />
          <Button type="submit" leftIcon={<Plus className="w-4 h-4" />}>Create Deal</Button>
        </form>
      </Card>

      <Card title="Deals" noPadding>
        <div className="p-4 flex gap-2">
          <input className="border rounded-xl px-3 py-2 flex-1" placeholder="Search deals/customers"
            value={search} onChange={e => setSearch(e.target.value)} />
          <Button variant="outline" onClick={load}>Search</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left"><tr>
              <th className="p-3">ID</th><th className="p-3">Deal</th><th className="p-3">Customer</th>
              <th className="p-3">Value</th><th className="p-3">Stage</th><th className="p-3">Probability</th>
            </tr></thead>
            <tbody>{deals.map(d => <tr key={d.id} className="border-t">
              <td className="p-3">#{d.id}</td><td className="p-3 font-medium">{d.title}</td>
              <td className="p-3">{d.customer_name}</td><td className="p-3">{d.value}</td>
              <td className="p-3">{d.stage}</td><td className="p-3">{d.probability}%</td>
            </tr>)}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DealManagement;
