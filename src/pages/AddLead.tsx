import { useState } from 'react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, TextArea } from '@/components/ui/Input';
import type { LeadSource, PropertyType, LeadTemperature } from '@/types';

export function AddLeadPage() {
  const { addLead, users, navigate, toast } = useStore();
  const agents = users.filter(u => u.role === 'sales_agent');

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    source: 'Manual' as LeadSource,
    property_type: 'Apartment' as PropertyType,
    budget_min: '',
    budget_max: '',
    preferred_location: '',
    temperature: 'Warm' as LeadTemperature,
    assigned_agent_id: agents[0]?.id || '',
    notes: '',
  });

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast('Name is required', 'error'); return; }
    if (!form.phone.trim()) { toast('Phone is required', 'error'); return; }
    if (!form.assigned_agent_id && agents.length > 0) { 
      toast('Please select an agent', 'error'); 
      return; 
    }

    const newLead = addLead({
      full_name: form.full_name,
      phone: form.phone,
      email: form.email,
      source: form.source,
      property_type: form.property_type,
      budget_min: Number(form.budget_min) || 0,
      budget_max: Number(form.budget_max) || 0,
      preferred_location: form.preferred_location,
      status: 'New',
      temperature: form.temperature,
      assigned_agent_id: form.assigned_agent_id,
      notes: form.notes,
      next_followup: null,
      last_contacted: null,
    });

    if (!newLead) return; // Security validation failed
    
    toast(`Lead ${form.full_name} added successfully!`, 'success');
    navigate('lead-detail', { id: newLead.id });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-4">
      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
        <div className="space-y-3">
          <Input label="Full Name *" placeholder="Enter full name" value={form.full_name} onChange={e => update('full_name', e.target.value)} />
          <Input label="Phone Number *" placeholder="+91 9999999999" value={form.phone} onChange={e => update('phone', e.target.value)} type="tel" />
          <Input label="Email" placeholder="email@example.com" value={form.email} onChange={e => update('email', e.target.value)} type="email" />
        </div>
      </Card>

      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Interest</h3>
        <div className="space-y-3">
          <Select
            label="Source"
            value={form.source}
            onChange={e => update('source', e.target.value)}
            options={['36 Acre', 'MagicBricks', 'Housing', 'Facebook', 'Instagram', 'Website', 'Referral', 'Manual', 'Other'].map(s => ({ value: s, label: s }))}
          />
          <Select
            label="Property Type"
            value={form.property_type}
            onChange={e => update('property_type', e.target.value)}
            options={['Apartment', 'Villa', 'Plot', 'Commercial', 'Rental'].map(s => ({ value: s, label: s }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Min Budget (₹)" placeholder="5000000" value={form.budget_min} onChange={e => update('budget_min', e.target.value)} type="number" />
            <Input label="Max Budget (₹)" placeholder="10000000" value={form.budget_max} onChange={e => update('budget_max', e.target.value)} type="number" />
          </div>
          <Input label="Preferred Location" placeholder="Gurgaon, Noida, etc." value={form.preferred_location} onChange={e => update('preferred_location', e.target.value)} />
        </div>
      </Card>

      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Assignment</h3>
        <div className="space-y-3">
          <Select
            label="Lead Temperature"
            value={form.temperature}
            onChange={e => update('temperature', e.target.value)}
            options={[
              { value: 'Hot', label: '🔥 Hot' },
              { value: 'Warm', label: '☀️ Warm' },
              { value: 'Cold', label: '❄️ Cold' },
            ]}
          />
          <Select
            label="Assign to Agent"
            value={form.assigned_agent_id}
            onChange={e => update('assigned_agent_id', e.target.value)}
            options={agents.length > 0 
              ? agents.map(a => ({ value: a.id, label: a.full_name }))
              : [{ value: '', label: 'No agents available' }]
            }
          />
          <TextArea label="Notes" placeholder="Add any additional notes..." value={form.notes} onChange={e => update('notes', e.target.value)} />
        </div>
      </Card>

      <div className="sticky bottom-16 bg-gray-50 py-3 -mx-4 px-4">
        <Button type="submit" className="w-full" size="lg">
          Add Lead
        </Button>
      </div>
    </form>
  );
}
