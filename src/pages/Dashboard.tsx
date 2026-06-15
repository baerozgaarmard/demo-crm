import { useMemo } from 'react';
import {
  UserPlus, Phone, Clock, Flame, MapPin, Building2, Users, Activity,
  Plus, ArrowRight, TrendingUp, MessageSquare, CheckCircle
} from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { format, parseISO } from 'date-fns';

export function DashboardPage() {
  const { leads, calls, followUps, siteVisits, properties, attendance, activities, users, currentUser, navigate } = useStore();

  const today = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const newLeadsToday = leads.filter(l => l.created_at.startsWith(today)).length;
    const callsToday = calls.filter(c => c.started_at.startsWith(today)).length;
    const callsConnected = calls.filter(c => c.started_at.startsWith(today) && c.status === 'completed').length;
    const followUpsDueToday = followUps.filter(f => f.due_date.startsWith(today) && f.status === 'pending').length;
    const hotLeads = leads.filter(l => l.temperature === 'Hot' && l.status !== 'Won' && l.status !== 'Lost').length;
    const siteVisitsToday = siteVisits.filter(sv => sv.scheduled_date === today && sv.status !== 'cancelled').length;
    const availableProps = properties.filter(p => p.availability === 'Available').length;
    const checkedIn = attendance.filter(a => a.check_in_time.startsWith(today) && !a.check_out_time).length;
    const totalTeam = users.filter(u => u.role !== 'owner').length;
    // Speed-to-lead
    const responseTimes = leads.filter(l => l.first_response_seconds != null).map(l => l.first_response_seconds!);
    const avgSpeedToLead = responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;
    // Conversion
    const wonThisMonth = leads.filter(l => l.status === 'Won').length;
    const lostThisMonth = leads.filter(l => l.status === 'Lost').length;
    const conversionRate = leads.length > 0 ? ((wonThisMonth / leads.length) * 100) : 0;

    return { newLeadsToday, callsToday, callsConnected, followUpsDueToday, hotLeads, siteVisitsToday, availableProps, checkedIn, totalTeam, avgSpeedToLead, wonThisMonth, lostThisMonth, conversionRate };
  }, [leads, calls, followUps, siteVisits, properties, attendance, users, today]);

  // Agent leaderboard
  const agentBoard = useMemo(() => {
    return users.filter(u => u.role === 'sales_agent').map(a => ({
      id: a.id, name: a.full_name.split(' ')[0],
      leads: leads.filter(l => l.assigned_agent_id === a.id).length,
      calls: calls.filter(c => c.agent_id === a.id && c.status === 'completed').length,
      won: leads.filter(l => l.assigned_agent_id === a.id && l.status === 'Won').length,
      visits: siteVisits.filter(sv => sv.agent_id === a.id).length,
    })).sort((a, b) => b.won - a.won || b.calls - a.calls);
  }, [users, leads, calls, siteVisits]);

  const recentActivities = activities.slice(0, 8);
  const upcomingFollowUps = followUps
    .filter(f => f.status === 'pending')
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5);

  const statCards = [
    { label: 'New Leads', value: stats.newLeadsToday, icon: UserPlus, color: 'bg-primary-500', page: 'leads' as const },
    { label: 'Calls Today', value: stats.callsToday, icon: Phone, color: 'bg-emerald-500', page: 'leads' as const },
    { label: 'Follow-ups Due', value: stats.followUpsDueToday, icon: Clock, color: 'bg-amber-500', page: 'followups' as const },
    { label: 'Hot Leads', value: stats.hotLeads, icon: Flame, color: 'bg-red-500', page: 'leads' as const },
    { label: 'Site Visits', value: stats.siteVisitsToday, icon: MapPin, color: 'bg-sky-500', page: 'site-visits' as const },
    { label: 'Available', value: stats.availableProps, icon: Building2, color: 'bg-violet-500', page: 'properties' as const },
  ];

  const getAgentName = (id: string) => users.find(u => u.id === id)?.full_name || 'Unknown';

  return (
    <div className="space-y-5 pb-4">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {currentUser?.full_name?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Here's your business overview</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        <Button onClick={() => navigate('add-lead')} size="sm" className="shrink-0">
          <Plus size={16} /> Add Lead
        </Button>
        <Button onClick={() => navigate('add-property')} variant="outline" size="sm" className="shrink-0">
          <Building2 size={16} /> Add Property
        </Button>
        <Button onClick={() => navigate('attendance')} variant="outline" size="sm" className="shrink-0">
          <CheckCircle size={16} /> Attendance
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className="cursor-pointer" onClick={() => navigate(stat.page)} padding="sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
              <div className={`${stat.color} p-2 rounded-xl`}>
                <stat.icon size={18} className="text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Team Attendance */}
      <Card padding="sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Users size={16} className="text-primary-500" /> Team Status
          </h3>
          <Badge variant="success">{stats.checkedIn}/{stats.totalTeam} checked in</Badge>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {users.filter(u => u.role !== 'admin').map(user => {
            const isCheckedIn = attendance.some(a => a.user_id === user.id && a.check_in_time.startsWith(today) && !a.check_out_time);
            return (
              <div key={user.id} className="flex flex-col items-center gap-1 shrink-0 min-w-[56px]">
                <div className="relative">
                  <Avatar name={user.full_name} size="sm" />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isCheckedIn ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                </div>
                <span className="text-[10px] text-gray-500 text-center leading-tight">{user.full_name.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Speed-to-Lead & Conversion */}
      <div className="grid grid-cols-3 gap-2">
        <Card padding="sm" className="text-center">
          <p className="text-lg font-bold text-primary-600">{stats.avgSpeedToLead > 0 ? `${Math.round(stats.avgSpeedToLead / 60)}m` : '—'}</p>
          <p className="text-[10px] text-gray-500">Avg Response</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-lg font-bold text-emerald-600">{stats.conversionRate.toFixed(1)}%</p>
          <p className="text-[10px] text-gray-500">Conversion</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-lg font-bold text-gray-900">{stats.wonThisMonth}<span className="text-red-400 text-sm">/{stats.lostThisMonth}</span></p>
          <p className="text-[10px] text-gray-500">Won / Lost</p>
        </Card>
      </div>

      {/* Agent Leaderboard */}
      {agentBoard.length > 0 && (
        <Card padding="sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-500" /> Agent Leaderboard
          </h3>
          <div className="space-y-2">
            {agentBoard.map((agent, i) => (
              <div key={agent.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'}`}>{i + 1}</div>
                <Avatar name={agent.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                  <div className="flex gap-3 text-[10px] text-gray-500">
                    <span>{agent.leads} leads</span>
                    <span>{agent.calls} calls</span>
                    <span>{agent.visits} visits</span>
                    <span className="text-emerald-600 font-semibold">{agent.won} won</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upcoming Follow-ups */}
      {upcomingFollowUps.length > 0 && (
        <Card padding="sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={16} className="text-amber-500" /> Upcoming Follow-ups
            </h3>
            <button onClick={() => navigate('followups')} className="text-xs text-primary-600 font-medium flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {upcomingFollowUps.map(fu => {
              const lead = leads.find(l => l.id === fu.lead_id);
              const typeIcons: Record<string, React.ReactNode> = {
                call: <Phone size={14} className="text-emerald-500" />,
                whatsapp: <MessageSquare size={14} className="text-green-500" />,
                email: <Mail size={14} className="text-blue-500" />,
                sms: <MessageSquare size={14} className="text-purple-500" />,
                site_visit: <MapPin size={14} className="text-amber-500" />,
              };
              const fuChannel = fu.channel || fu.type || 'call';
              return (
                <div
                  key={fu.id}
                  onClick={() => lead && navigate('lead-detail', { id: lead.id })}
                  className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100"
                >
                  {typeIcons[fuChannel]}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{lead?.full_name || 'Unknown'}</p>
                    <p className="text-[10px] text-gray-500">{fu.template || fu.message || ''}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {(() => {
                      try { return format(parseISO(fu.due_date), 'h:mm a'); } catch { return ''; }
                    })()}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <Card padding="sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Activity size={16} className="text-primary-500" /> Recent Activity
          </h3>
        </div>
        <div className="space-y-3">
          {recentActivities.map(act => (
            <div key={act.id} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                {act.type === 'call' && <Phone size={14} className="text-emerald-500" />}
                {act.type === 'assignment' && <UserPlus size={14} className="text-primary-500" />}
                {act.type === 'property_share' && <Building2 size={14} className="text-violet-500" />}
                {act.type === 'note' && <MessageSquare size={14} className="text-gray-500" />}
                {act.type === 'status_change' && <TrendingUp size={14} className="text-amber-500" />}
                {(act.type === 'followup_created' || act.type === 'followup_completed') && <Clock size={14} className="text-sky-500" />}
                {(act.type === 'message_whatsapp' || act.type === 'message_sms' || act.type === 'message_email') && <MessageSquare size={14} className="text-green-500" />}
                {(act.type === 'site_visit_scheduled' || act.type === 'site_visit_completed') && <MapPin size={14} className="text-red-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{act.title}</p>
                <p className="text-xs text-gray-500 truncate">{act.description}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {getAgentName(act.user_id)} • {(() => { try { return format(parseISO(act.created_at), 'MMM d, h:mm a'); } catch { return ''; } })()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Mail({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
