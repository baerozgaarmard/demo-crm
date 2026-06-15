import { useState, useMemo } from 'react';
import { Search, Plus, MapPin, Bed, Bath, Maximize, X, SlidersHorizontal } from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { messageService } from '@/services/messageService';
import type { PropertyType, AvailabilityStatus } from '@/types';

const availColors: Record<AvailabilityStatus, string> = {
  Available: 'success', Hold: 'warning', Sold: 'danger', Rented: 'info', Upcoming: 'default',
};

const propertyGradients = [
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
  'from-cyan-400 to-cyan-600',
  'from-indigo-400 to-indigo-600',
  'from-pink-400 to-pink-600',
  'from-teal-400 to-teal-600',
  'from-orange-400 to-orange-600',
];

export function PropertiesPage() {
  const { properties, navigate } = useStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PropertyType | ''>('');
  const [statusFilter, setStatusFilter] = useState<AvailabilityStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...properties];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.developer.toLowerCase().includes(q)
      );
    }
    if (typeFilter) result = result.filter(p => p.property_type === typeFilter);
    if (statusFilter) result = result.filter(p => p.availability === statusFilter);
    return result;
  }, [properties, search, typeFilter, statusFilter]);

  const activeFilters = [typeFilter, statusFilter].filter(Boolean).length;

  return (
    <div className="space-y-4 pb-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
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
          aria-label="Toggle filters"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={18} />
        </Button>
        <Button onClick={() => navigate('add-property')} size="icon" className="shrink-0" aria-label="Add new property">
          <Plus size={18} />
        </Button>
      </div>

      {showFilters && (
        <Card padding="sm" className="animate-slide-up">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Type</p>
              <div className="flex flex-wrap gap-1.5">
                {(['', 'Apartment', 'Villa', 'Plot', 'Commercial', 'Rental'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${typeFilter === t ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'}`}
                  >
                    {t || 'All'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {(['', 'Available', 'Hold', 'Sold', 'Rented'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${statusFilter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'}`}
                  >
                    {s || 'All'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <p className="text-xs text-gray-500">{filtered.length} properties</p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No properties found"
          description="Try adjusting your search or add a new property"
          actionLabel="Add Property"
          onAction={() => navigate('add-property')}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((prop, i) => (
            <Card key={prop.id} padding="none" onClick={() => navigate('property-detail', { id: prop.id })} className="overflow-hidden">
              {/* Placeholder image */}
              <div className={`h-32 bg-gradient-to-br ${propertyGradients[i % propertyGradients.length]} flex items-end p-3`}>
                <Badge variant={availColors[prop.availability] as any} className="backdrop-blur-sm">{prop.availability}</Badge>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{prop.title}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={12} /> {prop.location}
                </p>
                <p className="text-base font-bold text-primary-600 mt-1">{messageService.formatPrice(prop.price)}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Bed size={12} /> {prop.bedrooms} BHK</span>
                  <span className="flex items-center gap-1"><Bath size={12} /> {prop.bathrooms}</span>
                  <span className="flex items-center gap-1"><Maximize size={12} /> {prop.size} {prop.size_unit}</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <Badge variant="outline">{prop.property_type}</Badge>
                  <Badge variant="outline">{prop.furnishing}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
