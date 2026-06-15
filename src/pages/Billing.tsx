import { Phone, MessageSquare, Mail, HardDrive, Users, TrendingUp, CreditCard, Zap } from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

function UsageMeter({ label, used, limit, unit, icon: Icon, color }: { label: string; used: number; limit: number; unit: string; icon: React.ElementType; color: string }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isHigh = pct > 80;
  return (
    <Card padding="sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}><Icon size={16} className="text-white" /></div>
        <div className="flex-1"><p className="text-xs font-medium text-gray-900">{label}</p><p className="text-[10px] text-gray-400">{used.toLocaleString()} / {limit.toLocaleString()} {unit}</p></div>
        {isHigh && <Badge variant="danger" size="sm">High</Badge>}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${isHigh ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </Card>
  );
}

export function BillingPage() {
  const { billingUsage, organization, users, leads, toast } = useStore();
  const plan = organization.plan || 'growth';
  const planLimits: Record<string, { calls: number; whatsapp: number; sms: number; storage: number; users: number; leads: number }> = {
    trial: { calls: 100, whatsapp: 500, sms: 100, storage: 100, users: 3, leads: 500 },
    starter: { calls: 500, whatsapp: 2000, sms: 500, storage: 500, users: 10, leads: 2000 },
    growth: { calls: 2000, whatsapp: 10000, sms: 2000, storage: 2000, users: 25, leads: 10000 },
    enterprise: { calls: 99999, whatsapp: 99999, sms: 99999, storage: 10000, users: 100, leads: 99999 },
  };
  const limits = planLimits[plan] || planLimits.growth;

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-2 mb-1"><CreditCard size={20} className="text-primary-600" /><h2 className="text-lg font-bold text-gray-900">Billing & Usage</h2></div>

      {/* Plan */}
      <Card padding="md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Current Plan</h3>
            <p className="text-xs text-gray-500">Billing period: {billingUsage.period}</p>
          </div>
          <Badge variant={plan === 'enterprise' ? 'success' : plan === 'growth' ? 'info' : 'warning'} size="md">
            <Zap size={12} className="mr-1" /> {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </Badge>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div><p className="text-lg font-bold text-gray-900">{limits.users}</p><p className="text-gray-500">Max Users</p></div>
          <div><p className="text-lg font-bold text-gray-900">{limits.leads > 99000 ? '∞' : limits.leads.toLocaleString()}</p><p className="text-gray-500">Max Leads</p></div>
          <div><p className="text-lg font-bold text-gray-900">{limits.calls > 99000 ? '∞' : limits.calls.toLocaleString()}</p><p className="text-gray-500">Call Min</p></div>
        </div>
      </Card>

      {/* Usage Meters */}
      <h3 className="text-sm font-semibold text-gray-700">This Month's Usage</h3>
      <div className="grid gap-2">
        <UsageMeter label="Call Minutes" used={billingUsage.call_minutes} limit={limits.calls} unit="min" icon={Phone} color="bg-emerald-500" />
        <UsageMeter label="WhatsApp Messages" used={billingUsage.whatsapp_messages} limit={limits.whatsapp} unit="msgs" icon={MessageSquare} color="bg-green-500" />
        <UsageMeter label="SMS Messages" used={billingUsage.sms_messages} limit={limits.sms} unit="msgs" icon={Mail} color="bg-purple-500" />
        <UsageMeter label="Storage" used={billingUsage.storage_mb} limit={limits.storage} unit="MB" icon={HardDrive} color="bg-blue-500" />
        <UsageMeter label="Active Users" used={billingUsage.active_users} limit={limits.users} unit="users" icon={Users} color="bg-amber-500" />
        <UsageMeter label="Leads Created" used={billingUsage.leads_created} limit={limits.leads > 99000 ? billingUsage.leads_created + 1000 : limits.leads} unit="leads" icon={TrendingUp} color="bg-primary-500" />
      </div>

      {/* Upgrade CTA */}
      {plan !== 'enterprise' && (
        <Card padding="md" className="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-none">
          <h3 className="text-sm font-semibold">Need more capacity?</h3>
          <p className="text-xs text-primary-200 mt-1">Upgrade your plan for higher limits on calls, messages, and storage.</p>
          <Button variant="secondary" size="sm" className="mt-3 !bg-white !text-primary-700" onClick={() => toast('Contact sales for plan upgrade (demo)', 'info')}>
            Upgrade Plan
          </Button>
        </Card>
      )}

      {/* Quick Stats */}
      <Card padding="sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Account Summary</h3>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Organization</span><span className="font-medium">{organization.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Total Users</span><span className="font-medium">{users.length}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Total Leads</span><span className="font-medium">{leads.length}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Plan</span><span className="font-medium capitalize">{plan}</span></div>
        </div>
      </Card>
    </div>
  );
}
