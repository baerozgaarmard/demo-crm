import { useState } from 'react';
import { 
  Clock, Calendar, Users, BarChart3,
  Bell, LogOut, ChevronRight, Key, Webhook, Phone, MessageSquare, Mail, Sparkles
} from 'lucide-react';
import { useStore } from '@/store';
import { CONFIG } from '@/config';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import type { Page } from '@/types';

export function SettingsPage() {
  const { currentUser, logout, navigate, integrationSettings, toast, ingestWebhookLead } = useStore();
  const [showIntegrations, setShowIntegrations] = useState(false);

  const svCount = useStore.getState().siteVisits.filter(sv => sv.status === 'scheduled' || sv.status === 'confirmed').length;

  const menuItems: { icon: React.ElementType; label: string; page?: Page; onClick?: () => void; badge?: string }[] = [
    { icon: Calendar, label: 'Site Visits', page: 'site-visits', badge: svCount > 0 ? String(svCount) : undefined },
    { icon: MessageSquare, label: 'Templates', page: 'templates' },
    { icon: Clock, label: 'Attendance', page: 'attendance' },
    { icon: Calendar, label: 'Social Media', page: 'social' },
    { icon: Users, label: 'Team', page: 'team' },
    { icon: BarChart3, label: 'Reports', page: 'reports' },
    { icon: Bell, label: 'Notifications', page: 'notifications' },
  ];

  const adminItems = [
    { icon: Key, label: 'Integrations', onClick: () => setShowIntegrations(true) },
    { icon: Webhook, label: 'Test Webhook', onClick: () => testWebhook() },
    { icon: Bell, label: 'Compliance', page: 'compliance' as Page },
    { icon: BarChart3, label: 'Billing & Usage', page: 'billing' as Page },
  ];

  const testWebhook = () => {
    const names = ['Priya Kapoor', 'Vikash Mehta', 'Anjali Gupta', 'Rohit Singhania', 'Neeta Joshi'];
    const sources = ['99acres', 'MagicBricks', 'Facebook Ads', 'Instagram Ads', 'Website'];
    const locations = ['Gurgaon', 'Noida', 'South Delhi', 'Dwarka', 'Greater Noida'];
    
    const newLead = ingestWebhookLead({
      fullName: names[Math.floor(Math.random() * names.length)],
      phone: `+91${9000000000 + Math.floor(Math.random() * 999999999)}`,
      email: `lead${Date.now()}@example.com`,
      source: sources[Math.floor(Math.random() * sources.length)],
      propertyType: ['Apartment', 'Villa', 'Plot'][Math.floor(Math.random() * 3)],
      budgetMin: (50 + Math.floor(Math.random() * 50)) * 100000,
      budgetMax: (100 + Math.floor(Math.random() * 100)) * 100000,
      preferredLocation: locations[Math.floor(Math.random() * locations.length)],
      notes: 'Test lead from webhook simulation',
    });
    
    if (!newLead) {
      toast('Failed to create test lead. Check console for details.', 'error');
      return;
    }
    
    toast(`🎉 New lead "${newLead.full_name}" created via webhook! Bridge call simulated.`, 'success');
    navigate('lead-detail', { id: newLead.id });
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'owner';

  return (
    <div className="space-y-4 pb-4">
      {/* Profile Card */}
      <Card padding="md">
        <div className="flex items-center gap-3">
          <Avatar name={currentUser?.full_name || ''} size="lg" />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{currentUser?.full_name}</h2>
            <p className="text-sm text-gray-500">{currentUser?.email}</p>
            <p className="text-xs text-primary-600 font-medium capitalize mt-0.5">
              {currentUser?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </Card>

      {/* Menu Items */}
      <Card padding="none">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => item.page ? navigate(item.page) : item.onClick?.()}
            className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${i !== 0 ? 'border-t border-gray-100' : ''}`}
          >
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
              <item.icon size={18} className="text-gray-600" />
            </div>
            <span className="flex-1 text-sm font-medium text-gray-900 text-left">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">{item.badge}</span>
            )}
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        ))}
      </Card>

      {/* Admin Section */}
      {isAdmin && (
        <Card padding="none">
          <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Admin</p>
          {adminItems.map((item, i) => (
            <button
              key={item.label}
              onClick={() => (item as any).page ? navigate((item as any).page) : item.onClick?.()}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${i !== 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
                <item.icon size={18} className="text-primary-600" />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-900 text-left">{item.label}</span>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          ))}
        </Card>
      )}

      {/* Legal */}
      <Card padding="none">
        <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Legal</p>
        <button onClick={() => navigate('privacy')} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors" aria-label="View Privacy Policy">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center"><Key size={18} className="text-gray-600" /></div>
          <span className="flex-1 text-sm font-medium text-gray-900 text-left">Privacy Policy</span>
          <ChevronRight size={18} className="text-gray-300" />
        </button>
        <button onClick={() => navigate('terms')} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-t border-gray-100" aria-label="View Terms of Service">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center"><Key size={18} className="text-gray-600" /></div>
          <span className="flex-1 text-sm font-medium text-gray-900 text-left">Terms of Service</span>
          <ChevronRight size={18} className="text-gray-300" />
        </button>
      </Card>

      {/* Logout */}
      <Card padding="none">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-colors"
          aria-label="Log out of your account"
        >
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
            <LogOut size={18} className="text-red-600" />
          </div>
          <span className="flex-1 text-sm font-medium text-red-600 text-left">Log Out</span>
        </button>
      </Card>

      {/* App Info */}
      <p className="text-center text-xs text-gray-400 pt-2">
        {CONFIG.appName} CRM v1.0<br />
        Built for Real Estate Teams
      </p>

      {/* Integrations Modal */}
      <Modal open={showIntegrations} onClose={() => setShowIntegrations(false)} title="Integrations" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Configure your API keys and integrations. In production, these would be securely stored.
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Phone size={16} className="text-emerald-500" />
                <span className="text-sm font-medium">Twilio Voice</span>
              </div>
              <Input placeholder="Account SID" className="mb-2" disabled value="DRY_RUN_MODE" />
              <Input placeholder="Auth Token" type="password" disabled value="••••••••" />
              <p className="text-[10px] text-amber-600 mt-1">⚠️ Running in dry-run mode</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={16} className="text-green-500" />
                <span className="text-sm font-medium">WhatsApp</span>
              </div>
              <Input placeholder="WhatsApp Sender Number" disabled value="DRY_RUN_MODE" />
              <p className="text-[10px] text-amber-600 mt-1">⚠️ Running in dry-run mode</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} className="text-blue-500" />
                <span className="text-sm font-medium">Email (Resend)</span>
              </div>
              <Input placeholder="Resend API Key" disabled value="DRY_RUN_MODE" />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-purple-500" />
                <span className="text-sm font-medium">OpenAI</span>
              </div>
              <Input placeholder="API Key" disabled value="DRY_RUN_MODE" />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Webhook size={16} className="text-gray-500" />
                <span className="text-sm font-medium">Webhook</span>
              </div>
              <Input label="Webhook URL" disabled value="POST /api/webhooks/leads" />
              <Input label="Secret" disabled value={integrationSettings.webhook_secret} />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <Select
                label="Lead Assignment Mode"
                value={integrationSettings.lead_assignment_mode}
                disabled
                options={[
                  { value: 'round_robin', label: 'Round Robin' },
                  { value: 'manual', label: 'Manual' },
                  { value: 'least_busy', label: 'Least Busy Agent' },
                ]}
              />
            </div>
          </div>

          <Button variant="secondary" className="w-full" onClick={() => {
            toast('Settings saved (dry-run mode)', 'info');
            setShowIntegrations(false);
          }}>
            Save Settings
          </Button>
        </div>
      </Modal>
    </div>
  );
}
