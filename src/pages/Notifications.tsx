import { Bell, UserPlus, Phone, Clock, Building2, MapPin, CheckCheck } from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { format, parseISO } from 'date-fns';

const typeIcons: Record<string, React.ReactNode> = {
  lead_assigned: <UserPlus size={16} className="text-primary-500" />,
  new_lead: <UserPlus size={16} className="text-emerald-500" />,
  missed_call: <Phone size={16} className="text-red-500" />,
  followup_due: <Clock size={16} className="text-amber-500" />,
  property_shared: <Building2 size={16} className="text-violet-500" />,
  site_visit: <MapPin size={16} className="text-blue-500" />,
};

export function NotificationsPage() {
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useStore();

  const userNotifications = notifications
    .filter(n => n.user_id === currentUser?.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          <p className="text-xs text-gray-500">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="ghost" onClick={markAllNotificationsRead}>
            <CheckCheck size={15} /> Mark all read
          </Button>
        )}
      </div>

      {userNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up!"
        />
      ) : (
        <div className="space-y-2">
          {userNotifications.map(notif => (
            <Card
              key={notif.id}
              padding="sm"
              className={notif.read ? 'opacity-60' : ''}
              onClick={() => markNotificationRead(notif.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  {typeIcons[notif.type] || <Bell size={16} className="text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{notif.title}</h3>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {(() => { try { return format(parseISO(notif.created_at), 'MMM d, h:mm a'); } catch { return '-'; } })()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
