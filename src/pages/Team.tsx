import { useState } from 'react';
import { Plus, Phone, Mail, Shield } from 'lucide-react';
import { useStore } from '@/store';
import { maskPhone } from '@/utils/security';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import type { UserRole } from '@/types';

const roleLabels: Record<UserRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  sales_manager: 'Sales Manager',
  sales_agent: 'Sales Agent',
  field_executive: 'Field Executive',
  social_media_manager: 'Social Media',
};

const roleColors: Record<UserRole, string> = {
  owner: 'danger',
  admin: 'danger',
  sales_manager: 'warning',
  sales_agent: 'info',
  field_executive: 'success',
  social_media_manager: 'default',
};

export function TeamPage() {
  const { users, currentUser, addUser, toast } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'sales_agent' as UserRole,
  });

  const isAdmin = currentUser?.role === 'admin';

  const handleAdd = () => {
    if (!form.full_name || !form.email) {
      toast('Name and email are required', 'error');
      return;
    }
    addUser({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      is_active: true,
    });
    setShowAddModal(false);
    setForm({ full_name: '', email: '', phone: '', role: 'sales_agent' });
    toast('Team member added!', 'success');
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Team</h2>
          <p className="text-xs text-gray-500">{users.length} members</p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Add Member
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {users.map(user => (
          <Card key={user.id} padding="sm">
            <div className="flex items-center gap-3">
              <Avatar name={user.full_name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{user.full_name}</h3>
                  {user.id === currentUser?.id && (
                    <Badge variant="outline" size="sm">You</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <Mail size={11} /> {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={11} /> {maskPhone(user.phone)}
                  </div>
                )}
              </div>
              <Badge variant={roleColors[user.role] as any}>
                <Shield size={10} className="mr-1" />
                {roleLabels[user.role]}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Team Member">
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            placeholder="john@company.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Phone"
            placeholder="+91 9999999999"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
            options={[
              { value: 'sales_agent', label: 'Sales Agent' },
              { value: 'sales_manager', label: 'Sales Manager' },
              { value: 'field_executive', label: 'Field Executive' },
              { value: 'social_media_manager', label: 'Social Media Manager' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
          <Button onClick={handleAdd} className="w-full">Add Member</Button>
        </div>
      </Modal>
    </div>
  );
}
