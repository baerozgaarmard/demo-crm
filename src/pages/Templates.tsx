import { useState } from 'react';
import { Plus, MessageSquare, Phone, Mail, MapPin, Edit3, Trash2, Copy, CheckCircle, Zap } from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import type { FollowUpChannel } from '@/types';

const channelIcons: Record<string, React.ReactNode> = {
  whatsapp: <MessageSquare size={14} className="text-green-500" />,
  sms: <Phone size={14} className="text-purple-500" />,
  email: <Mail size={14} className="text-blue-500" />,
  call: <Phone size={14} className="text-emerald-500" />,
  site_visit: <MapPin size={14} className="text-amber-500" />,
  in_person: <Zap size={14} className="text-gray-500" />,
};

const categoryLabels: Record<string, string> = {
  greeting: '👋 Greeting', followup: '🔄 Follow-up', property_share: '🏠 Property Share',
  site_visit: '📍 Site Visit', post_visit: '⭐ Post Visit', closing: '🤝 Closing', custom: '✏️ Custom',
};

const VARIABLES = ['{{name}}', '{{agent_name}}', '{{location}}', '{{property_title}}', '{{price}}', '{{bedrooms}}', '{{size}}', '{{address}}', '{{share_link}}', '{{visit_date}}', '{{visit_time}}'];

export function TemplatesPage() {
  const { templates, addTemplate, updateTemplate, deleteTemplate, toast } = useStore();
  const [channelFilter, setChannelFilter] = useState<FollowUpChannel | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', channel: 'whatsapp' as FollowUpChannel, category: 'followup' as any, body: '' });

  const filtered = channelFilter ? templates.filter(t => t.channel === channelFilter) : templates;

  const handleSave = () => {
    if (!form.name.trim() || !form.body.trim()) { toast('Name and body are required', 'error'); return; }
    const vars = VARIABLES.filter(v => form.body.includes(v)).map(v => v.replace(/[{}]/g, ''));
    if (editId) {
      updateTemplate(editId, { name: form.name, channel: form.channel, category: form.category, body: form.body, variables: vars });
      toast('Template updated', 'success');
    } else {
      addTemplate({ name: form.name, channel: form.channel, category: form.category, body: form.body, variables: vars, is_default: false, usage_count: 0 });
      toast('Template created', 'success');
    }
    setShowForm(false); setEditId(null);
    setForm({ name: '', channel: 'whatsapp', category: 'followup', body: '' });
  };

  const openEdit = (id: string) => {
    const t = templates.find(t => t.id === id);
    if (!t) return;
    setForm({ name: t.name, channel: t.channel, category: t.category, body: t.body });
    setEditId(id); setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id); setDeleteId(null);
    toast('Template deleted', 'info');
  };

  const copyBody = (id: string, body: string) => {
    navigator.clipboard?.writeText(body);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
    toast('Copied to clipboard', 'success');
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-gray-900">Message Templates</h2><p className="text-xs text-gray-500">{templates.length} templates</p></div>
        <Button size="sm" onClick={() => { setEditId(null); setForm({ name: '', channel: 'whatsapp', category: 'followup', body: '' }); setShowForm(true); }}><Plus size={15} /> New</Button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[{ v: '', l: 'All' }, { v: 'whatsapp', l: '💬 WhatsApp' }, { v: 'sms', l: '📱 SMS' }, { v: 'email', l: '📧 Email' }, { v: 'call', l: '📞 Call' }].map(f => (
          <button key={f.v} onClick={() => setChannelFilter(f.v as any)} className={`px-3 py-1.5 text-xs rounded-full border whitespace-nowrap ${channelFilter === f.v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'}`}>{f.l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No templates" description="Create your first message template" actionLabel="Create Template" onAction={() => setShowForm(true)} />
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <Card key={t.id} padding="sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">{channelIcons[t.channel]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{t.name}</h3>
                    {t.is_default && <Badge variant="outline" size="sm">Default</Badge>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="default" size="sm">{t.channel}</Badge>
                    <Badge variant="outline" size="sm">{categoryLabels[t.category] || t.category}</Badge>
                    <span className="text-[10px] text-gray-400">Used {t.usage_count}×</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 whitespace-pre-line">{t.body}</p>
                  {t.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {t.variables.map(v => <span key={v} className="text-[10px] px-1.5 py-0.5 bg-primary-50 text-primary-600 rounded">{`{{${v}}}`}</span>)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                <Button size="sm" variant="ghost" onClick={() => copyBody(t.id, t.body)} className="flex-1">
                  {copied === t.id ? <CheckCircle size={12} /> : <Copy size={12} />} {copied === t.id ? 'Copied' : 'Copy'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(t.id)} className="flex-1"><Edit3 size={12} /> Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteId(t.id)} className="text-red-500"><Trash2 size={12} /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null); }} title={editId ? 'Edit Template' : 'New Template'} size="lg">
        <div className="space-y-4">
          <Input label="Template Name" placeholder="e.g., Follow-up after site visit" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Channel" value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value as any }))} options={[{ value: 'whatsapp', label: 'WhatsApp' }, { value: 'sms', label: 'SMS' }, { value: 'email', label: 'Email' }, { value: 'call', label: 'Call Script' }]} />
            <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} options={[{ value: 'greeting', label: 'Greeting' }, { value: 'followup', label: 'Follow-up' }, { value: 'property_share', label: 'Property Share' }, { value: 'site_visit', label: 'Site Visit' }, { value: 'post_visit', label: 'Post Visit' }, { value: 'closing', label: 'Closing' }, { value: 'custom', label: 'Custom' }]} />
          </div>
          <div>
            <TextArea label="Message Body" placeholder="Hi {{name}}, ..." value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={6} />
            <div className="mt-2">
              <p className="text-[10px] text-gray-400 mb-1">Insert variable:</p>
              <div className="flex flex-wrap gap-1">
                {VARIABLES.map(v => (
                  <button key={v} onClick={() => setForm(f => ({ ...f, body: f.body + ' ' + v }))} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-primary-100 hover:text-primary-600">{v}</button>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleSave} className="w-full">{editId ? 'Update Template' : 'Create Template'}</Button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Template?" size="sm">
        <p className="text-sm text-gray-600 mb-4">This action cannot be undone.</p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
