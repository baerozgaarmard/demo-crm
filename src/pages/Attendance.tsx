import { useState, useCallback } from 'react';
import { LogIn, LogOut, MapPin, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { format, parseISO } from 'date-fns';

export function AttendancePage() {
  const { attendance, users, currentUser, checkIn, checkOut } = useStore();
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const todayRecord = attendance.find(
    a => a.user_id === currentUser?.id && a.check_in_time.startsWith(today)
  );

  const isCheckedIn = todayRecord && !todayRecord.check_out_time;
  const hasCheckedOut = todayRecord?.check_out_time;

  const getLocation = useCallback((): Promise<{ lat: number | null; lng: number | null }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: null, lng: null });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: null, lng: null }),
        { timeout: 5000 }
      );
    });
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    const loc = await getLocation();
    checkIn(loc.lat, loc.lng);
    setLoading(false);
  };

  const handleCheckOut = async () => {
    setLoading(true);
    const loc = await getLocation();
    checkOut(loc.lat, loc.lng);
    setLoading(false);
  };

  const allToday = attendance.filter(a => a.check_in_time.startsWith(today));
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'sales_manager';

  return (
    <div className="space-y-4 pb-4">
      {/* Check In/Out Card */}
      <Card padding="lg" className="text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-100 flex items-center justify-center mb-3">
          {isCheckedIn ? (
            <CheckCircle size={32} className="text-emerald-500" />
          ) : hasCheckedOut ? (
            <LogOut size={32} className="text-gray-400" />
          ) : (
            <Clock size={32} className="text-primary-500" />
          )}
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          {isCheckedIn ? "You're checked in" : hasCheckedOut ? "Day complete" : "Ready to start?"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isCheckedIn
            ? `Since ${(() => { try { return format(parseISO(todayRecord!.check_in_time), 'h:mm a'); } catch { return '-'; } })()}`
            : hasCheckedOut
              ? `Checked out at ${(() => { try { return format(parseISO(todayRecord!.check_out_time!), 'h:mm a'); } catch { return '-'; } })()}`
              : format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>

        <div className="mt-4">
          {!todayRecord && (
            <Button onClick={handleCheckIn} size="lg" className="w-full" disabled={loading}>
              <LogIn size={18} /> {loading ? 'Getting location...' : 'Check In'}
            </Button>
          )}
          {isCheckedIn && (
            <Button onClick={handleCheckOut} size="lg" variant="danger" className="w-full" disabled={loading}>
              <LogOut size={18} /> {loading ? 'Getting location...' : 'Check Out'}
            </Button>
          )}
          {hasCheckedOut && (
            <p className="text-sm text-emerald-600 font-medium">✅ All done for today!</p>
          )}
        </div>

        {todayRecord && (
          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[10px] text-gray-400">Check In</p>
              <p className="font-medium text-emerald-600">
                {(() => { try { return format(parseISO(todayRecord.check_in_time), 'h:mm a'); } catch { return '-'; } })()}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Check Out</p>
              <p className="font-medium text-gray-900">
                {todayRecord.check_out_time
                  ? (() => { try { return format(parseISO(todayRecord.check_out_time), 'h:mm a'); } catch { return '-'; } })()
                  : '—'}
              </p>
            </div>
            {todayRecord.check_in_lat && (
              <div className="col-span-2">
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <MapPin size={10} /> Location captured
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Team Attendance (Admin view) */}
      {isAdmin && (
        <Card padding="sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users size={14} className="text-primary-500" /> Team Attendance Today
          </h3>
          <div className="space-y-2">
            {users.filter(u => u.role !== 'admin').map(user => {
              const rec = allToday.find(a => a.user_id === user.id);
              const isIn = rec && !rec.check_out_time;
              return (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                  <div className="relative">
                    <Avatar name={user.full_name} size="sm" />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-50 ${isIn ? 'bg-emerald-400' : rec ? 'bg-gray-400' : 'bg-red-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-[10px] text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    {rec ? (
                      <>
                        <Badge variant={rec.status === 'late' ? 'warning' : 'success'} size="sm">{rec.status}</Badge>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {(() => { try { return format(parseISO(rec.check_in_time), 'h:mm a'); } catch { return '-'; } })()}
                          {rec.check_out_time && ` - ${(() => { try { return format(parseISO(rec.check_out_time), 'h:mm a'); } catch { return '-'; } })()}`}
                        </p>
                      </>
                    ) : (
                      <Badge variant="danger" size="sm">
                        <AlertCircle size={10} className="mr-1" /> Absent
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
