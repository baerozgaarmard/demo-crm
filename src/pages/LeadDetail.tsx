import { useState } from 'react';
import {
  Phone, MessageSquare, Building2, Clock, MapPin, Edit3,
  Flame, User, Calendar, DollarSign, Tag, FileText, Send,
  CheckCircle, Star, ArrowRight
} from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { format, parseISO } from 'date-fns';
import { messageService, followUpTemplates } from '@/services/messageService';
import { callService } from '@/services/callService';
import type { LeadStatus, LeadTemperature, FollowUpType } from '@/types';

const statuses: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Site Visit Scheduled', 'Negotiation', 'Won', 'Lost', 'Not Responding'];

export function LeadDetailPage() {
  const { pageParams, leads, users, properties, activities, calls, navigate, updateLead, addActivity, addFollowUp, addCall, toast, currentUser } = useStore();
  const lead = leads.find(l => l.id === pageParams.id);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [fuType, setFuType] = useState<FollowUpType>('call');
  const [fuDate, setFuDate] = useState('');
  const [fuTemplate, setFuTemplate] = useState(followUpTemplates[0].text);
  const [isCallLoading, setIsCallLoading] = useState(false);
  const [isWhatsAppLoading, setIsWhatsAppLoading] = useState(false);

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lead not found</p>
        <Button onClick={() => navigate('leads')} className="mt-4">Back to Leads</Button>
      </div>
    );
  }

  const agent = users.find(u => u.id === lead.assigned_agent_id);
  const leadActivities = activities.filter(a => a.lead_id === lead.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const leadCalls = calls.filter(c => c.lead_id === lead.id);
  // Follow-ups for this lead could be shown in a separate section
  const agents = users.filter(u => u.role === 'sales_agent');

  const matchingProperties = properties.filter(p =>
    p.availability === 'Available' &&
    p.property_type === lead.property_type &&
    p.price >= lead.budget_min * 0.8 &&
    p.price <= lead.budget_max * 1.2
  ).slice(0, 5);

  const handleCall = async () => {
    if (!currentUser) { toast('Please log in to make calls', 'error'); return; }
    if (!agent) { toast('No agent assigned. Assign an agent first.', 'error'); return; }
    if (isCallLoading) return;
    setIsCallLoading(true);
    try {
      toast('📞 Initiating bridge call...', 'info');
      const result = await callService.initiateBridgeCall(agent, lead);
      addCall({
        lead_id: lead.id, agent_id: currentUser.id,
        call_sid: result.callSid, conference_sid: result.conferenceSid,
        status: 'completed', duration: 180, recording_url: '',
        started_at: new Date().toISOString(),
        ended_at: new Date(Date.now() + 180000).toISOString(),
        outcome: 'connected',
      });
      addActivity({ lead_id: lead.id, user_id: currentUser.id, type: 'call', title: 'Call made', description: `Called ${lead.full_name} - Connected (dry-run)` });
      updateLead(lead.id, { last_contacted: new Date().toISOString(), status: lead.status === 'New' ? 'Contacted' : lead.status });
      toast('✅ Call completed (dry-run)', 'success');
    } finally { setIsCallLoading(false); }
  };

  const handleWhatsApp = async () => {
    if (isWhatsAppLoading) return;
    setIsWhatsAppLoading(true);
    try {
      const template = followUpTemplates[0].text;
      await messageService.sendWhatsApp(lead, template);
      addActivity({ lead_id: lead.id, user_id: currentUser?.id || '', type: 'message_whatsapp', title: 'WhatsApp sent', description: messageService.getFilledTemplate(template, lead) });
      toast('💬 WhatsApp sent (dry-run)', 'success');
    } finally { setIsWhatsAppLoading(false); }
  };

  const handleStatusChange = (status: LeadStatus) => {
    updateLead(lead.id, { status });
    addActivity({
      lead_id: lead.id,
      user_id: currentUser?.id || '',
      type: 'status_change',
      title: 'Status changed',
      description: `Status changed to ${status}`,
    });
    setShowStatusModal(false);
    toast(`Status updated to ${status}`, 'success');
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addActivity({
      lead_id: lead.id,
      user_id: currentUser?.id || '',
      type: 'note',
      title: 'Note added',
      description: noteText,
    });
    setNoteText('');
    setShowNoteModal(false);
    toast('Note added', 'success');
  };

  const handleScheduleFollowUp = () => {
    if (!fuDate) { toast('Please select a date', 'error'); return; }
    addFollowUp({
      lead_id: lead.id,
      agent_id: currentUser?.id || '',
      type: fuType,
      due_date: new Date(fuDate).toISOString(),
      status: 'pending',
      template: messageService.getFilledTemplate(fuTemplate, lead),
      notes: '',
      completed_at: null,
    });
    updateLead(lead.id, { next_followup: new Date(fuDate).toISOString() });
    setShowFollowUpModal(false);
    toast('Follow-up scheduled', 'success');
  };

  const handleShareProperty = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;
    messageService.sharePropertyViaWhatsApp(lead, property);
    addActivity({
      lead_id: lead.id,
      user_id: currentUser?.id || '',
      type: 'property_share',
      title: 'Property shared',
      description: `Shared ${property.title} via WhatsApp (dry-run)`,
    });
    setShowShareModal(false);
    toast(`📤 ${property.title} shared via WhatsApp (dry-run)`, 'success');
  };

  const handleAssign = (agentId: string) => {
    const newAgent = users.find(u => u.id === agentId);
    updateLead(lead.id, { assigned_agent_id: agentId });
    addActivity({
      lead_id: lead.id,
      user_id: currentUser?.id || '',
      type: 'assignment',
      title: 'Lead reassigned',
      description: `Reassigned to ${newAgent?.full_name || 'Unknown'}`,
    });
    setShowAssignModal(false);
    toast(`Lead assigned to ${newAgent?.full_name}`, 'success');
  };

  const toggleHot = () => {
    const newTemp: LeadTemperature = lead.temperature === 'Hot' ? 'Warm' : 'Hot';
    updateLead(lead.id, { temperature: newTemp });
    toast(newTemp === 'Hot' ? '🔥 Marked as Hot Lead' : 'Changed to Warm', 'success');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Lead Header */}
      <Card padding="md">
        <div className="flex items-start gap-3">
          <Avatar name={lead.full_name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 truncate">{lead.full_name}</h2>
              <button onClick={toggleHot}>
                <Flame size={18} className={lead.temperature === 'Hot' ? 'text-red-500 fill-red-500' : 'text-gray-300'} />
              </button>
            </div>
            <p className="text-sm text-gray-500">{lead.phone}</p>
            {lead.email && <p className="text-xs text-gray-400">{lead.email}</p>}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant={lead.status === 'Won' ? 'success' : lead.status === 'Lost' ? 'danger' : 'info'}>{lead.status}</Badge>
              <Badge variant={lead.temperature === 'Hot' ? 'hot' : lead.temperature === 'Warm' ? 'warm' : 'cold'}>
                {lead.temperature}
              </Badge>
              <Badge variant="outline">{lead.source}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions - Sticky on mobile */}
      <div className="sticky top-[57px] z-20 bg-gray-50 py-2 -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button onClick={handleCall} size="sm" variant="success" className="shrink-0" disabled={isCallLoading} aria-label="Call this lead">
            <Phone size={15} /> {isCallLoading ? 'Calling...' : 'Call'}
          </Button>
          <Button onClick={handleWhatsApp} size="sm" className="shrink-0 !bg-green-600 hover:!bg-green-700" disabled={isWhatsAppLoading} aria-label="Send WhatsApp to this lead">
            <MessageSquare size={15} /> {isWhatsAppLoading ? 'Sending...' : 'WhatsApp'}
          </Button>
          <Button onClick={() => setShowShareModal(true)} size="sm" variant="outline" className="shrink-0">
            <Send size={15} /> Share Property
          </Button>
          <Button onClick={() => setShowFollowUpModal(true)} size="sm" variant="outline" className="shrink-0">
            <Clock size={15} /> Follow-up
          </Button>
          <Button onClick={() => setShowNoteModal(true)} size="sm" variant="outline" className="shrink-0">
            <FileText size={15} /> Note
          </Button>
        </div>
      </div>

      {/* Lead Info */}
      <Card padding="sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Lead Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-400">Property Type</p>
              <p className="font-medium">{lead.property_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-400">Budget</p>
              <p className="font-medium">{messageService.formatPrice(lead.budget_min)} - {messageService.formatPrice(lead.budget_max)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-400">Location</p>
              <p className="font-medium">{lead.preferred_location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-400">Source</p>
              <p className="font-medium">{lead.source}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-400">Agent</p>
              <p className="font-medium">{agent?.full_name || 'Unassigned'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-400">Created</p>
              <p className="font-medium">{(() => { try { return format(parseISO(lead.created_at), 'MMM d, yyyy'); } catch { return '-'; } })()}</p>
            </div>
          </div>
        </div>
        {lead.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">{lead.notes}</p>
          </div>
        )}
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <Button size="sm" variant="ghost" onClick={() => setShowStatusModal(true)}>
            <Edit3 size={13} /> Change Status
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowAssignModal(true)}>
            <User size={13} /> Reassign
          </Button>
        </div>
      </Card>

      {/* Recommended Properties */}
      {matchingProperties.length > 0 && (
        <Card padding="sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Star size={14} className="text-amber-500" /> Recommended Properties
          </h3>
          <div className="space-y-2">
            {matchingProperties.map(prop => (
              <div key={prop.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{prop.title}</p>
                  <p className="text-[10px] text-gray-500">{prop.location} • {messageService.formatPrice(prop.price)} • {prop.size} {prop.size_unit}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleShareProperty(prop.id)}
                    className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                  >
                    <Send size={13} />
                  </button>
                  <button
                    onClick={() => navigate('property-detail', { id: prop.id })}
                    className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300"
                  >
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Call History */}
      {leadCalls.length > 0 && (
        <Card padding="sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Phone size={14} className="text-emerald-500" /> Call History ({leadCalls.length})
          </h3>
          <div className="space-y-2">
            {leadCalls.slice(0, 5).map(call => (
              <div key={call.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${call.status === 'completed' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  <Phone size={14} className={call.status === 'completed' ? 'text-emerald-600' : 'text-red-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{call.status === 'completed' ? 'Connected' : 'Missed'}</p>
                  <p className="text-[10px] text-gray-500">
                    {Math.floor(call.duration / 60)}m {call.duration % 60}s •{' '}
                    {(() => { try { return format(parseISO(call.started_at), 'MMM d, h:mm a'); } catch { return '-'; } })()} •{' '}
                    {call.outcome || '-'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Timeline */}
      <Card padding="sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock size={14} className="text-primary-500" /> Timeline
        </h3>
        <div className="space-y-3">
          {leadActivities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No activity yet</p>
          ) : (
            leadActivities.map(act => (
              <div key={act.id} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{act.title}</p>
                  <p className="text-xs text-gray-500">{act.description}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {(() => { try { return format(parseISO(act.created_at), 'MMM d, h:mm a'); } catch { return '-'; } })()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Modals */}
      <Modal open={showStatusModal} onClose={() => setShowStatusModal(false)} title="Change Status">
        <div className="space-y-2">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${lead.status === s ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              {s === lead.status && <CheckCircle size={14} className="inline mr-2" />}
              {s}
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={showNoteModal} onClose={() => setShowNoteModal(false)} title="Add Note">
        <div className="space-y-4">
          <TextArea
            placeholder="Write your note here..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            rows={4}
          />
          <Button onClick={handleAddNote} className="w-full">Save Note</Button>
        </div>
      </Modal>

      <Modal open={showFollowUpModal} onClose={() => setShowFollowUpModal(false)} title="Schedule Follow-up">
        <div className="space-y-4">
          <Select
            label="Type"
            value={fuType}
            onChange={e => setFuType(e.target.value as FollowUpType)}
            options={[
              { value: 'call', label: '📞 Call' },
              { value: 'whatsapp', label: '💬 WhatsApp' },
              { value: 'sms', label: '📱 SMS' },
              { value: 'email', label: '📧 Email' },
              { value: 'site_visit', label: '🏠 Site Visit' },
            ]}
          />
          <Input
            label="Date & Time"
            type="datetime-local"
            value={fuDate}
            onChange={e => setFuDate(e.target.value)}
          />
          <div>
            <label className="text-sm font-medium text-gray-700">Template</label>
            <div className="space-y-2 mt-1">
              {followUpTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setFuTemplate(t.text)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs border transition-colors ${fuTemplate === t.text ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <p className="font-medium text-gray-700">{t.name}</p>
                  <p className="text-gray-500 mt-0.5">{messageService.getFilledTemplate(t.text, lead)}</p>
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleScheduleFollowUp} className="w-full">Schedule Follow-up</Button>
        </div>
      </Modal>

      <Modal open={showShareModal} onClose={() => setShowShareModal(false)} title="Share Property">
        <div className="space-y-2">
          {properties.filter(p => p.availability === 'Available').map(prop => (
            <div key={prop.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{prop.title}</p>
                <p className="text-xs text-gray-500">{prop.location} • {messageService.formatPrice(prop.price)}</p>
              </div>
              <Button size="sm" onClick={() => handleShareProperty(prop.id)}>
                <Send size={13} /> Share
              </Button>
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Agent">
        <div className="space-y-2">
          {agents.map(a => (
            <button
              key={a.id}
              onClick={() => handleAssign(a.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${lead.assigned_agent_id === a.id ? 'bg-primary-100' : 'hover:bg-gray-50'}`}
            >
              <Avatar name={a.full_name} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-900">{a.full_name}</p>
                <p className="text-xs text-gray-500">{a.email}</p>
              </div>
              {lead.assigned_agent_id === a.id && <CheckCircle size={16} className="text-primary-600 ml-auto" />}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
