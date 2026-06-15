import { useState, useMemo } from 'react';
import { MapPin, Calendar, Clock, Building2, CheckCircle, XCircle, Plus, ChevronDown, ChevronUp, Car, Navigation, Star, AlertTriangle, Eye } from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { format, parseISO, isToday } from 'date-fns';
import type { SiteVisitStatus, LeadTemperature } from '@/types';

const statusCfg: Record<SiteVisitStatus, { label: string; variant: string; icon: React.ElementType }> = {
  scheduled: { label: 'Scheduled', variant: 'info', icon: Calendar },
  confirmed: { label: 'Confirmed', variant: 'success', icon: CheckCircle },
  in_progress: { label: 'In Progress', variant: 'warning', icon: Navigation },
  completed: { label: 'Completed', variant: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'danger', icon: XCircle },
  no_show: { label: 'No Show', variant: 'danger', icon: AlertTriangle },
};

export function SiteVisitsPage() {
  const { siteVisits, leads, properties, users, addSiteVisit, updateSiteVisit, navigate, toast, currentUser } = useStore();
  const [filter, setFilter] = useState<SiteVisitStatus | ''>('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [interest, setInterest] = useState<LeadTemperature>('Warm');
  const [form, setForm] = useState({ lead_id: '', property_id: '', scheduled_date: '', scheduled_time: '11:00', field_executive_id: '', pickup_location: '', transport_arranged: false, visit_notes: '' });

  const fieldExecs = users.filter(u => u.role === 'field_executive');
  const filtered = useMemo(() => {
    let r = [...siteVisits].sort((a, b) => `${a.scheduled_date}T${a.scheduled_time}`.localeCompare(`${b.scheduled_date}T${b.scheduled_time}`));
    if (filter) r = r.filter(sv => sv.status === filter);
    return r;
  }, [siteVisits, filter]);

  const today = new Date().toISOString().split('T')[0];
  const todayN = siteVisits.filter(sv => sv.scheduled_date === today && sv.status !== 'cancelled').length;
  const upcomingN = siteVisits.filter(sv => sv.status === 'scheduled' || sv.status === 'confirmed').length;
  const completedN = siteVisits.filter(sv => sv.status === 'completed').length;
  const getLead = (id: string) => leads.find(l => l.id === id);
  const getProp = (id: string) => properties.find(p => p.id === id);
  const getUser = (id: string) => users.find(u => u.id === id);
  const dayLabel = (d: string) => { try { const p = parseISO(d); return isToday(p) ? 'Today' : format(p, 'EEE, MMM d'); } catch { return d; } };

  const handleSchedule = () => {
    if (!form.lead_id || !form.property_id || !form.scheduled_date) { toast('Fill all required fields', 'error'); return; }
    addSiteVisit({ lead_id: form.lead_id, property_id: form.property_id, agent_id: currentUser?.id || '', field_executive_id: form.field_executive_id, scheduled_date: form.scheduled_date, scheduled_time: form.scheduled_time, status: 'scheduled', pickup_location: form.pickup_location, transport_arranged: form.transport_arranged, visit_notes: form.visit_notes, feedback: '', interest_level: null, completed_at: null });
    if (form.field_executive_id) { const l = getLead(form.lead_id); const p = getProp(form.property_id); useStore.getState().addNotification({ user_id: form.field_executive_id, type: 'site_visit_scheduled', title: 'New Site Visit', message: `${l?.full_name} at ${p?.title} on ${form.scheduled_date}`, read: false }); }
    setShowSchedule(false);
    setForm({ lead_id: '', property_id: '', scheduled_date: '', scheduled_time: '11:00', field_executive_id: '', pickup_location: '', transport_arranged: false, visit_notes: '' });
    toast('Site visit scheduled!', 'success');
  };

  const handleComplete = (id: string) => {
    updateSiteVisit(id, { status: 'completed', feedback, interest_level: interest, completed_at: new Date().toISOString() });
    setCompleteId(null); setFeedback(''); setInterest('Warm');
    toast('Visit completed', 'success');
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-gray-900">Site Visits</h2><p className="text-xs text-gray-500">{todayN} today · {upcomingN} upcoming</p></div>
        <Button size="sm" onClick={() => setShowSchedule(true)} aria-label="Schedule visit"><Plus size={15} /> Schedule</Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card padding="sm" className="text-center"><Calendar size={18} className="mx-auto text-primary-500 mb-1" /><p className="text-xl font-bold">{todayN}</p><p className="text-[10px] text-gray-500">Today</p></Card>
        <Card padding="sm" className="text-center"><Clock size={18} className="mx-auto text-amber-500 mb-1" /><p className="text-xl font-bold">{upcomingN}</p><p className="text-[10px] text-gray-500">Upcoming</p></Card>
        <Card padding="sm" className="text-center"><CheckCircle size={18} className="mx-auto text-emerald-500 mb-1" /><p className="text-xl font-bold">{completedN}</p><p className="text-[10px] text-gray-500">Done</p></Card>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[{ v: '', l: 'All' }, { v: 'scheduled', l: '📅 Scheduled' }, { v: 'confirmed', l: '✅ Confirmed' }, { v: 'completed', l: '✓ Done' }, { v: 'cancelled', l: '✕ Cancelled' }, { v: 'no_show', l: '⚠ No Show' }].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v as any)} className={`px-3 py-1.5 text-xs rounded-full border whitespace-nowrap ${filter === f.v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'}`}>{f.l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={MapPin} title="No site visits" description={filter ? 'None with this status' : 'Schedule your first site visit'} actionLabel="Schedule" onAction={() => setShowSchedule(true)} />
      ) : (
        <div className="space-y-2">
          {filtered.map(sv => {
            const lead = getLead(sv.lead_id); const prop = getProp(sv.property_id); const cfg = statusCfg[sv.status];
            const isActive = sv.status === 'scheduled' || sv.status === 'confirmed';
            return (
              <Card key={sv.id} padding="none" className="overflow-hidden">
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sv.status === 'completed' ? 'bg-emerald-100' : sv.status === 'cancelled' || sv.status === 'no_show' ? 'bg-red-100' : 'bg-primary-100'}`}>
                      <cfg.icon size={18} className={sv.status === 'completed' ? 'text-emerald-600' : sv.status === 'cancelled' || sv.status === 'no_show' ? 'text-red-600' : 'text-primary-600'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate cursor-pointer hover:text-primary-600" onClick={() => lead && navigate('lead-detail', { id: lead.id })}>{lead?.full_name || 'Unknown'}</span>
                        <Badge variant={cfg.variant as any} size="sm">{cfg.label}</Badge>
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-0.5 flex items-center gap-1"><Building2 size={11} /> {prop?.title || 'Unknown'}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                        <span className="flex items-center gap-0.5"><Calendar size={10} /> {dayLabel(sv.scheduled_date)}</span>
                        <span className="flex items-center gap-0.5"><Clock size={10} /> {sv.scheduled_time}</span>
                        {sv.transport_arranged && <span className="flex items-center gap-0.5 text-emerald-600"><Car size={10} /> Transport</span>}
                      </div>
                    </div>
                    <button onClick={() => setExpanded(expanded === sv.id ? null : sv.id)} className="p-1 text-gray-400">{expanded === sv.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
                  </div>
                </div>
                {expanded === sv.id && (
                  <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><p className="text-[10px] text-gray-400">Agent</p><p className="font-medium">{getUser(sv.agent_id)?.full_name || '—'}</p></div>
                      <div><p className="text-[10px] text-gray-400">Field Exec</p><p className="font-medium">{sv.field_executive_id ? getUser(sv.field_executive_id)?.full_name : 'N/A'}</p></div>
                      {sv.pickup_location && <div className="col-span-2"><p className="text-[10px] text-gray-400">Pickup</p><p className="font-medium">{sv.pickup_location}</p></div>}
                      {sv.feedback && <div className="col-span-2 bg-emerald-50 rounded-lg p-2"><p className="text-[10px] text-emerald-600 font-medium">Feedback</p><p className="text-gray-700">{sv.feedback}</p>{sv.interest_level && <Badge variant={sv.interest_level === 'Hot' ? 'hot' : sv.interest_level === 'Warm' ? 'warm' : 'cold'} size="sm" className="mt-1">{sv.interest_level}</Badge>}</div>}
                    </div>
                    {lead && <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2"><Avatar name={lead.full_name} size="sm" /><div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{lead.full_name}</p><p className="text-[10px] text-gray-500">{lead.phone}</p></div><button onClick={() => navigate('lead-detail', { id: lead.id })} className="p-1.5 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300" aria-label="View lead"><Eye size={12} /></button></div>}
                  </div>
                )}
                {isActive && (
                  <div className="flex border-t border-gray-100">
                    <button onClick={() => updateSiteVisit(sv.id, { status: 'confirmed' })} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"><CheckCircle size={13} /> Confirm</button>
                    <div className="w-px bg-gray-100" />
                    <button onClick={() => { setFeedback(''); setInterest('Warm'); setCompleteId(sv.id); }} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-primary-600 hover:bg-primary-50"><Star size={13} /> Complete</button>
                    <div className="w-px bg-gray-100" />
                    <button onClick={() => { updateSiteVisit(sv.id, { status: 'cancelled' }); toast('Cancelled', 'info'); }} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50"><XCircle size={13} /> Cancel</button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showSchedule} onClose={() => setShowSchedule(false)} title="Schedule Site Visit" size="lg">
        <div className="space-y-4">
          <Select label="Lead *" value={form.lead_id} onChange={e => setForm(f => ({ ...f, lead_id: e.target.value }))} options={[{ value: '', label: 'Select lead...' }, ...leads.filter(l => !['Won', 'Lost', 'Junk'].includes(l.status)).map(l => ({ value: l.id, label: `${l.full_name} — ${l.phone}` }))]} />
          <Select label="Property *" value={form.property_id} onChange={e => setForm(f => ({ ...f, property_id: e.target.value }))} options={[{ value: '', label: 'Select property...' }, ...properties.filter(p => p.availability === 'Available' || p.availability === 'Upcoming').map(p => ({ value: p.id, label: `${p.title} — ${p.location}` }))]} />
          <div className="grid grid-cols-2 gap-3"><Input label="Date *" type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} /><Input label="Time" type="time" value={form.scheduled_time} onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))} /></div>
          <Select label="Field Executive" value={form.field_executive_id} onChange={e => setForm(f => ({ ...f, field_executive_id: e.target.value }))} options={[{ value: '', label: 'None / Self' }, ...fieldExecs.map(u => ({ value: u.id, label: u.full_name }))]} />
          <Input label="Pickup Location" placeholder="Metro station, landmark..." value={form.pickup_location} onChange={e => setForm(f => ({ ...f, pickup_location: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.transport_arranged} onChange={e => setForm(f => ({ ...f, transport_arranged: e.target.checked }))} className="rounded border-gray-300 text-primary-600 w-5 h-5" /><span className="text-gray-700">Transport arranged</span></label>
          <TextArea label="Notes" placeholder="Special instructions..." value={form.visit_notes} onChange={e => setForm(f => ({ ...f, visit_notes: e.target.value }))} />
          <Button onClick={handleSchedule} className="w-full"><Calendar size={15} /> Schedule Visit</Button>
        </div>
      </Modal>

      <Modal open={!!completeId} onClose={() => setCompleteId(null)} title="Complete Visit">
        <div className="space-y-4">
          <TextArea label="Feedback *" placeholder="How did it go? Client reaction..." value={feedback} onChange={e => setFeedback(e.target.value)} rows={4} />
          <Select label="Interest Level" value={interest} onChange={e => setInterest(e.target.value as LeadTemperature)} options={[{ value: 'Hot', label: '🔥 Hot — Ready to book' }, { value: 'Warm', label: '☀️ Warm — Needs time' }, { value: 'Cold', label: '❄️ Cold — Not interested' }]} />
          <Button onClick={() => completeId && handleComplete(completeId)} className="w-full" disabled={!feedback.trim()}><CheckCircle size={15} /> Mark Completed</Button>
        </div>
      </Modal>
    </div>
  );
}
