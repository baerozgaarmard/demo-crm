import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Phone, MessageSquare, ChevronRight, Flame, X, SlidersHorizontal, Upload } from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
// date-fns available for formatting if needed
import type { LeadStatus, LeadSource, LeadTemperature } from '@/types';
import { messageService } from '@/services/messageService';

const statusColors: Record<LeadStatus, string> = {
  'New': 'info', 'Contacted': 'default', 'Interested': 'warning', 'Site Visit Scheduled': 'info',
  'Site Visit Done': 'info', 'Negotiation': 'warning', 'Booking': 'success',
  'Won': 'success', 'Lost': 'danger', 'Not Responding': 'default', 'Junk': 'danger', 'On Hold': 'default',
};

export function LeadsPage() {
  const { leads, users, navigate, toast } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [tempFilter, setTempFilter] = useState<LeadTemperature | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...leads];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.full_name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.preferred_location || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter) result = result.filter(l => l.status === statusFilter);
    if (sourceFilter) result = result.filter(l => l.source === sourceFilter);
    if (tempFilter) result = result.filter(l => l.temperature === tempFilter);
    return result;
  }, [leads, search, statusFilter, sourceFilter, tempFilter]);

  const getAgentName = (id: string) => users.find(u => u.id === id)?.full_name || 'Unassigned';

  const activeFilters = [statusFilter, sourceFilter, tempFilter].filter(Boolean).length;

  return (
    <div className="space-y-4 pb-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads by name, phone, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={16} className="text-gray-400" />
            </button>
          )}
        </div>
        <Button
          variant={activeFilters > 0 ? 'primary' : 'outline'}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="relative shrink-0"
          aria-label="Toggle filters"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={18} />
          {activeFilters > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </Button>
        <Button onClick={() => navigate('import-leads')} size="icon" variant="outline" className="shrink-0" aria-label="Import leads from CSV">
          <Upload size={18} />
        </Button>
        <Button onClick={() => navigate('add-lead')} size="icon" className="shrink-0" aria-label="Add new lead">
          <Plus size={18} />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card padding="sm" className="animate-slide-up">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {(['', 'New', 'Contacted', 'Interested', 'Site Visit Scheduled', 'Negotiation', 'Won', 'Lost', 'Not Responding'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${statusFilter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {s || 'All'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Temperature</p>
              <div className="flex gap-1.5">
                {(['', 'Hot', 'Warm', 'Cold'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTempFilter(t)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${tempFilter === t ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {t ? `${t === 'Hot' ? '🔥' : t === 'Warm' ? '☀️' : '❄️'} ${t}` : 'All'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Source</p>
              <div className="flex flex-wrap gap-1.5">
                {(['', '99acres', 'MagicBricks', 'Housing.com', 'Facebook Ads', 'Instagram Ads', 'Google Ads', 'Website', 'Referral', 'Manual'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSourceFilter(s)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${sourceFilter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {s || 'All'}
                  </button>
                ))}
              </div>
            </div>
            {activeFilters > 0 && (
              <button
                onClick={() => { setStatusFilter(''); setSourceFilter(''); setTempFilter(''); }}
                className="text-xs text-red-500 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Results count */}
      <p className="text-xs text-gray-500">{filtered.length} lead{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Lead List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No leads found"
          description="Try adjusting your search or filters"
          actionLabel="Add Lead"
          onAction={() => navigate('add-lead')}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(lead => (
            <Card
              key={lead.id}
              padding="none"
              onClick={() => navigate('lead-detail', { id: lead.id })}
              className="overflow-hidden"
            >
              <div className="p-3">
                <div className="flex items-start gap-3">
                  <Avatar name={lead.full_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{lead.full_name}</h3>
                      {lead.temperature === 'Hot' && <Flame size={14} className="text-red-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{lead.phone} • {lead.preferred_location}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <Badge variant={statusColors[lead.status] as any}>{lead.status}</Badge>
                      <Badge variant="outline">{lead.source}</Badge>
                      <Badge variant={lead.temperature === 'Hot' ? 'hot' : lead.temperature === 'Warm' ? 'warm' : 'cold'}>
                        {lead.temperature}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">
                        {messageService.formatPrice(lead.budget_min)} - {messageService.formatPrice(lead.budget_max)}
                      </span>
                      <span className="text-[10px] text-gray-300">•</span>
                      <span className="text-[10px] text-gray-400">{lead.property_type}</span>
                      <span className="text-[10px] text-gray-300">•</span>
                      <span className="text-[10px] text-gray-400">{getAgentName(lead.assigned_agent_id).split(' ')[0]}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 shrink-0 mt-2" />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast('📞 Bridge call initiated (dry-run mode)', 'info');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                >
                  <Phone size={13} /> Call
                </button>
                <div className="w-px bg-gray-100" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast('💬 WhatsApp message sent (dry-run mode)', 'info');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-green-600 hover:bg-green-50"
                >
                  <MessageSquare size={13} /> WhatsApp
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
