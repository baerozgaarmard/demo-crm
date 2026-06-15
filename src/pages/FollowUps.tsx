import { useState, useMemo } from 'react';
import { Phone, MessageSquare, Mail, MapPin, Clock, CheckCircle, RotateCcw, X as XIcon } from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
// Avatar available if needed
import { EmptyState } from '@/components/ui/EmptyState';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import type { FollowUpStatus } from '@/types';

const typeIcons: Record<string, React.ReactNode> = {
  call: <Phone size={14} className="text-emerald-500" />,
  whatsapp: <MessageSquare size={14} className="text-green-500" />,
  sms: <MessageSquare size={14} className="text-purple-500" />,
  email: <Mail size={14} className="text-blue-500" />,
  site_visit: <MapPin size={14} className="text-amber-500" />,
};

export function FollowUpsPage() {
  const { followUps, leads, updateFollowUp, navigate, toast, addActivity, currentUser } = useStore();
  const [statusFilter, setStatusFilter] = useState<FollowUpStatus | ''>('pending');

  const filtered = useMemo(() => {
    let result = [...followUps];
    if (statusFilter) result = result.filter(f => f.status === statusFilter);
    return result.sort((a, b) => a.due_date.localeCompare(b.due_date));
  }, [followUps, statusFilter]);

  const getDueLabel = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isPast(date) && !isToday(date)) return { text: 'Overdue', color: 'text-red-500' };
      if (isToday(date)) return { text: 'Today', color: 'text-amber-600' };
      if (isTomorrow(date)) return { text: 'Tomorrow', color: 'text-blue-500' };
      return { text: format(date, 'MMM d'), color: 'text-gray-500' };
    } catch {
      return { text: '-', color: 'text-gray-400' };
    }
  };

  const handleComplete = (fuId: string) => {
    const fu = followUps.find(f => f.id === fuId);
    updateFollowUp(fuId, { status: 'completed', completed_at: new Date().toISOString() });
    if (fu) {
      addActivity({
        lead_id: fu.lead_id,
        user_id: currentUser?.id || '',
        type: 'followup_completed',
        title: 'Follow-up completed',
        description: `Completed ${fu.type} follow-up`,
      });
    }
    toast('Follow-up marked as complete', 'success');
  };

  const handleSnooze = (fuId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    // BUG FIX: Keep status as 'pending' so it still shows up in pending list
    // The 'snoozed' status is for tracking that it was snoozed, but we want it back in pending
    updateFollowUp(fuId, { due_date: tomorrow.toISOString(), status: 'pending' });
    toast('Follow-up snoozed to tomorrow 10 AM', 'info');
  };

  const pendingCount = followUps.filter(f => f.status === 'pending').length;
  const overdueCount = followUps.filter(f => {
    try { return f.status === 'pending' && isPast(parseISO(f.due_date)) && !isToday(parseISO(f.due_date)); } catch { return false; }
  }).length;

  return (
    <div className="space-y-4 pb-4">
      {/* Summary */}
      <div className="flex gap-3">
        <Card padding="sm" className="flex-1 text-center">
          <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-[10px] text-gray-500">Pending</p>
        </Card>
        <Card padding="sm" className="flex-1 text-center">
          <p className="text-xl font-bold text-red-600">{overdueCount}</p>
          <p className="text-[10px] text-gray-500">Overdue</p>
        </Card>
        <Card padding="sm" className="flex-1 text-center">
          <p className="text-xl font-bold text-emerald-600">{followUps.filter(f => f.status === 'completed').length}</p>
          <p className="text-[10px] text-gray-500">Completed</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {([
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'completed', label: 'Completed' },
          { value: 'snoozed', label: 'Snoozed' },
          { value: 'cancelled', label: 'Cancelled' },
        ] as const).map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 text-xs rounded-full border whitespace-nowrap transition-colors ${statusFilter === f.value ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No follow-ups"
          description={statusFilter === 'pending' ? "You're all caught up!" : "No follow-ups with this status"}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(fu => {
            const lead = leads.find(l => l.id === fu.lead_id);
            const due = getDueLabel(fu.due_date);
            return (
              <Card key={fu.id} padding="sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{typeIcons[fu.channel || fu.type || 'call'] || <Clock size={14} className="text-gray-400" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-primary-600"
                        onClick={() => lead && navigate('lead-detail', { id: lead.id })}
                      >
                        {lead?.full_name || 'Unknown'}
                      </span>
                      <span className={`text-[10px] font-semibold ${due.color}`}>{due.text}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{fu.template || fu.message || ''}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" size="sm">{fu.type}</Badge>
                      <Badge variant={fu.status === 'completed' ? 'success' : fu.status === 'pending' ? 'warning' : 'default'} size="sm">
                        {fu.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {fu.status === 'pending' && (
                  <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                    <Button size="sm" variant="success" onClick={() => handleComplete(fu.id)} className="flex-1">
                      <CheckCircle size={13} /> Complete
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleSnooze(fu.id)} className="flex-1">
                      <RotateCcw size={13} /> Snooze
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateFollowUp(fu.id, { status: 'cancelled' })}>
                      <XIcon size={13} />
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
