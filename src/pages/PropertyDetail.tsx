import { useState } from 'react';
import { MapPin, Bed, Bath, Maximize, Building2, Layers, Sofa, Send, Copy, CheckCircle } from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { messageService } from '@/services/messageService';

const propertyGradients = [
  'from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600', 'from-rose-400 to-rose-600',
];

export function PropertyDetailPage() {
  const { pageParams, properties, leads, navigate, toast, addActivity, currentUser } = useStore();
  const property = properties.find(p => p.id === pageParams.id);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Property not found</p>
        <Button onClick={() => navigate('properties')} className="mt-4">Back to Properties</Button>
      </div>
    );
  }

  const shareLink = `https://estateflow.app/p/${property.id}`;
  const gradientIndex = properties.indexOf(property) % propertyGradients.length;

  const matchingLeads = leads.filter(l =>
    l.status !== 'Won' && l.status !== 'Lost' &&
    l.property_type === property.property_type &&
    l.budget_min <= property.price * 1.2 &&
    l.budget_max >= property.price * 0.8
  ).slice(0, 10);

  const handleShareToLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    messageService.sharePropertyViaWhatsApp(lead, property);
    addActivity({
      lead_id: lead.id,
      user_id: currentUser?.id || '',
      type: 'property_share',
      title: 'Property shared',
      description: `Shared ${property.title} via WhatsApp (dry-run)`,
    });
    toast(`📤 Shared with ${lead.full_name} (dry-run)`, 'success');
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast('Link copied!', 'success');
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Hero */}
      <div className={`h-48 -mx-4 -mt-1 bg-gradient-to-br ${propertyGradients[gradientIndex]} flex items-end`}>
        <div className="w-full p-4 bg-gradient-to-t from-black/40 to-transparent">
          <Badge variant="success" className="mb-2">{property.availability}</Badge>
          <h2 className="text-xl font-bold text-white">{property.title}</h2>
          <p className="text-white/80 text-sm flex items-center gap-1">
            <MapPin size={14} /> {property.location}
          </p>
        </div>
      </div>

      {/* Price & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-primary-600">{messageService.formatPrice(property.price)}</p>
          <p className="text-xs text-gray-500">{property.size} {property.size_unit} • {property.property_type}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={copyLink}>
            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Link'}
          </Button>
          <Button size="sm" onClick={() => setShowShareModal(true)}>
            <Send size={14} /> Share
          </Button>
        </div>
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Bed, label: `${property.bedrooms} BHK`, sub: 'Bedrooms' },
          { icon: Bath, label: `${property.bathrooms}`, sub: 'Bathrooms' },
          { icon: Maximize, label: `${property.size}`, sub: property.size_unit },
          { icon: Layers, label: property.floor, sub: 'Floor' },
        ].map((f, i) => (
          <Card key={i} padding="sm" className="text-center">
            <f.icon size={18} className="mx-auto text-primary-500 mb-1" />
            <p className="text-sm font-bold text-gray-900">{f.label}</p>
            <p className="text-[10px] text-gray-500">{f.sub}</p>
          </Card>
        ))}
      </div>

      {/* Details */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Details</h3>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div>
            <p className="text-[10px] text-gray-400">Type</p>
            <p className="font-medium flex items-center gap-1"><Building2 size={13} className="text-gray-400" /> {property.property_type}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Furnishing</p>
            <p className="font-medium flex items-center gap-1"><Sofa size={13} className="text-gray-400" /> {property.furnishing}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Developer</p>
            <p className="font-medium">{property.developer || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Address</p>
            <p className="font-medium text-xs">{property.address}</p>
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
      </Card>

      {/* Amenities */}
      {property.amenities.length > 0 && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {property.amenities.map(a => (
              <Badge key={a} variant="outline" size="md">{a}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Matching Leads */}
      {matchingLeads.length > 0 && (
        <Card padding="sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Matching Leads ({matchingLeads.length})
          </h3>
          <div className="space-y-2">
            {matchingLeads.map(lead => (
              <div key={lead.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                <div className="flex items-center gap-2 min-w-0 flex-1" onClick={() => navigate('lead-detail', { id: lead.id })}>
                  <Avatar name={lead.full_name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{lead.full_name}</p>
                    <p className="text-[10px] text-gray-500">{lead.preferred_location} • {messageService.formatPrice(lead.budget_max)}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleShareToLead(lead.id)}>
                  <Send size={13} />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Share Modal */}
      <Modal open={showShareModal} onClose={() => setShowShareModal(false)} title="Share Property">
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Share Link</p>
            <div className="flex gap-2">
              <input readOnly value={shareLink} className="flex-1 text-sm bg-white px-3 py-2 rounded-lg border border-gray-200" />
              <Button size="sm" variant="outline" onClick={copyLink}>
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              </Button>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Share with leads</p>
            {matchingLeads.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No matching leads found</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {matchingLeads.map(lead => (
                  <div key={lead.id} className="flex items-center justify-between p-2 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Avatar name={lead.full_name} size="sm" />
                      <div>
                        <p className="text-sm font-medium">{lead.full_name}</p>
                        <p className="text-[10px] text-gray-500">{lead.phone}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleShareToLead(lead.id)}>
                      <Send size={13} /> Send
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
