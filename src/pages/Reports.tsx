import { useMemo } from 'react';
import { TrendingUp, Users, Phone, Building2, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export function ReportsPage() {
  const { leads, calls, properties, users } = useStore();

  const leadsBySource = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => { counts[l.source] = (counts[l.source] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [leads]);

  const leadsByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const agentPerformance = useMemo(() => {
    const agents = users.filter(u => u.role === 'sales_agent');
    return agents.map(a => ({
      name: a.full_name.split(' ')[0],
      leads: leads.filter(l => l.assigned_agent_id === a.id).length,
      calls: calls.filter(c => c.agent_id === a.id).length,
      won: leads.filter(l => l.assigned_agent_id === a.id && l.status === 'Won').length,
    }));
  }, [users, leads, calls]);

  const wonLeads = leads.filter(l => l.status === 'Won').length;
  const lostLeads = leads.filter(l => l.status === 'Lost').length;
  const conversionRate = leads.length > 0 ? ((wonLeads / leads.length) * 100).toFixed(1) : 0;
  const availableProps = properties.filter(p => p.availability === 'Available').length;
  const totalCalls = calls.length;
  const completedCalls = calls.filter(c => c.status === 'completed').length;

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-lg font-bold text-gray-900">Reports & Analytics</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card padding="sm" className="text-center">
          <Users size={20} className="mx-auto text-primary-500 mb-1" />
          <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
          <p className="text-[10px] text-gray-500">Total Leads</p>
        </Card>
        <Card padding="sm" className="text-center">
          <TrendingUp size={20} className="mx-auto text-emerald-500 mb-1" />
          <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
          <p className="text-[10px] text-gray-500">Conversion Rate</p>
        </Card>
        <Card padding="sm" className="text-center">
          <Phone size={20} className="mx-auto text-blue-500 mb-1" />
          <p className="text-2xl font-bold text-gray-900">{completedCalls}/{totalCalls}</p>
          <p className="text-[10px] text-gray-500">Calls Connected</p>
        </Card>
        <Card padding="sm" className="text-center">
          <Building2 size={20} className="mx-auto text-violet-500 mb-1" />
          <p className="text-2xl font-bold text-gray-900">{availableProps}</p>
          <p className="text-[10px] text-gray-500">Available Properties</p>
        </Card>
      </div>

      {/* Won/Lost */}
      <Card padding="sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Won vs Lost</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-600">{wonLeads}</p>
              <p className="text-[10px] text-gray-500">Won</p>
            </div>
          </div>
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${wonLeads + lostLeads > 0 ? (wonLeads / (wonLeads + lostLeads)) * 100 : 50}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <div>
              <p className="text-lg font-bold text-red-600">{lostLeads}</p>
              <p className="text-[10px] text-gray-500">Lost</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle size={16} className="text-red-600" />
            </div>
          </div>
        </div>
      </Card>

      {/* Leads by Source */}
      <Card padding="sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Leads by Source</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leadsBySource} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Leads by Status */}
      <Card padding="sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Leads by Status</h3>
        <div className="h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={leadsByStatus}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {leadsByStatus.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {leadsByStatus.map((item, i) => (
            <div key={item.name} className="flex items-center gap-1 text-[10px]">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-gray-600">{item.name} ({item.value})</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Agent Performance */}
      <Card padding="sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Agent Performance</h3>
        <div className="space-y-2">
          {agentPerformance.map((agent, i) => (
            <div key={agent.name} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-600">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                <div className="flex gap-3 text-[10px] text-gray-500">
                  <span>{agent.leads} leads</span>
                  <span>{agent.calls} calls</span>
                  <span className="text-emerald-600 font-medium">{agent.won} won</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
