import { useState } from 'react';
import { Shield, FileText, Download, Clock, CheckCircle, Users, Lock, Eye, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { format, parseISO } from 'date-fns';

export function CompliancePage() {
  const { leads, activities, users, toast, navigate } = useStore();
  const [tab, setTab] = useState<'overview' | 'consent' | 'audit' | 'dnd'>('overview');

  const consentedLeads = leads.filter(l => l.consent_given);
  const dndLeads = leads.filter(l => l.dnd_flag);
  const optedOut = leads.filter(l => l.opt_out);
  const noConsent = leads.filter(l => !l.consent_given);
  const recentActivities = activities.slice(0, 30);

  const ts = (d: string) => { try { return format(parseISO(d), 'MMM d, h:mm a'); } catch { return '—'; } };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-2 mb-1"><Shield size={20} className="text-primary-600" /><h2 className="text-lg font-bold text-gray-900">Compliance Center</h2></div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[{ v: 'overview', l: '📊 Overview' }, { v: 'consent', l: '✅ Consent' }, { v: 'dnd', l: '🚫 DND' }, { v: 'audit', l: '📋 Audit Log' }].map(t => (
          <button key={t.v} onClick={() => setTab(t.v as any)} className={`px-3 py-1.5 text-xs rounded-full border whitespace-nowrap ${tab === t.v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'}`}>{t.l}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Card padding="sm" className="text-center"><CheckCircle size={18} className="mx-auto text-emerald-500 mb-1" /><p className="text-xl font-bold text-emerald-600">{consentedLeads.length}</p><p className="text-[10px] text-gray-500">Consent Given</p></Card>
            <Card padding="sm" className="text-center"><AlertTriangle size={18} className="mx-auto text-amber-500 mb-1" /><p className="text-xl font-bold text-amber-600">{noConsent.length}</p><p className="text-[10px] text-gray-500">No Consent</p></Card>
            <Card padding="sm" className="text-center"><Lock size={18} className="mx-auto text-red-500 mb-1" /><p className="text-xl font-bold text-red-600">{dndLeads.length}</p><p className="text-[10px] text-gray-500">DND Flagged</p></Card>
            <Card padding="sm" className="text-center"><Users size={18} className="mx-auto text-gray-500 mb-1" /><p className="text-xl font-bold text-gray-600">{optedOut.length}</p><p className="text-[10px] text-gray-500">Opted Out</p></Card>
          </div>
          <Card padding="md">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Compliance Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Consent tracking</span><Badge variant="success">Active</Badge></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">DND checking</span><Badge variant="warning">Manual</Badge></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Data retention</span><Badge variant="info">365 days</Badge></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Privacy policy</span><Badge variant="success">Published</Badge></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Data export capability</span><Badge variant="success">Available</Badge></div>
            </div>
          </Card>
          <Card padding="sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => { toast('Lead data exported (dry-run)', 'info'); }}><Download size={14} /> Export All Lead Data (CSV)</Button>
              <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => navigate('privacy')}><FileText size={14} /> View Privacy Policy</Button>
              <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => setTab('audit')}><Eye size={14} /> View Audit Log</Button>
            </div>
          </Card>
        </>
      )}

      {/* Consent tab */}
      {tab === 'consent' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">{noConsent.length} leads without consent</p>
          {noConsent.length === 0 ? (
            <Card padding="md" className="text-center"><CheckCircle size={24} className="mx-auto text-emerald-500 mb-2" /><p className="text-sm font-medium text-gray-900">All leads have consent</p></Card>
          ) : (
            noConsent.slice(0, 20).map(l => (
              <Card key={l.id} padding="sm" onClick={() => navigate('lead-detail', { id: l.id })}>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-gray-900">{l.full_name}</p><p className="text-xs text-gray-500">{l.phone} · {l.source}</p></div>
                  <Badge variant="warning" size="sm">No Consent</Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* DND tab */}
      {tab === 'dnd' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">{dndLeads.length} DND-flagged leads — do not contact</p>
          {dndLeads.length === 0 ? (
            <Card padding="md" className="text-center"><Shield size={24} className="mx-auto text-gray-400 mb-2" /><p className="text-sm font-medium text-gray-900">No DND leads</p></Card>
          ) : (
            dndLeads.map(l => (
              <Card key={l.id} padding="sm" onClick={() => navigate('lead-detail', { id: l.id })}>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-gray-900">{l.full_name}</p><p className="text-xs text-gray-500">{l.phone}</p></div>
                  <Badge variant="danger" size="sm">🚫 DND</Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Audit Log */}
      {tab === 'audit' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Last {recentActivities.length} actions across the CRM</p>
          {recentActivities.length === 0 ? (
            <EmptyState icon={Clock} title="No activity yet" description="Actions will appear here" />
          ) : (
            recentActivities.map(act => {
              const user = users.find(u => u.id === act.user_id);
              return (
                <Card key={act.id} padding="sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{act.title}</p>
                      <p className="text-xs text-gray-500 truncate">{act.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                        <span>{user?.full_name || 'System'}</span>
                        <span>·</span>
                        <span>{ts(act.created_at)}</span>
                        <Badge variant="outline" size="sm">{act.type.replace(/_/g, ' ')}</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
