import { useState } from 'react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, TextArea } from '@/components/ui/Input';
import type { PropertyType, AvailabilityStatus, FurnishingStatus } from '@/types';

export function AddPropertyPage() {
  const { addProperty, navigate, toast } = useStore();

  const [form, setForm] = useState({
    title: '',
    location: '',
    address: '',
    property_type: 'Apartment' as PropertyType,
    price: '',
    size: '',
    size_unit: 'sq.ft',
    bedrooms: '2',
    bathrooms: '2',
    floor: '',
    furnishing: 'Semi-Furnished' as FurnishingStatus,
    availability: 'Available' as AvailabilityStatus,
    description: '',
    amenities: '',
    developer: '',
  });

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast('Title is required', 'error'); return; }
    if (!form.location.trim()) { toast('Location is required', 'error'); return; }

    addProperty({
      title: form.title,
      location: form.location,
      address: form.address,
      property_type: form.property_type,
      price: Number(form.price) || 0,
      size: Number(form.size) || 0,
      size_unit: form.size_unit,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      floor: form.floor,
      furnishing: form.furnishing,
      availability: form.availability,
      description: form.description,
      amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
      images: [],
      developer: form.developer,
    });

    toast('Property added successfully!', 'success');
    navigate('properties');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-4">
      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Info</h3>
        <div className="space-y-3">
          <Input label="Title *" placeholder="e.g., Green Valley 3BHK" value={form.title} onChange={e => update('title', e.target.value)} />
          <Input label="Location *" placeholder="Gurgaon" value={form.location} onChange={e => update('location', e.target.value)} />
          <Input label="Address" placeholder="Full address" value={form.address} onChange={e => update('address', e.target.value)} />
          <Select
            label="Property Type"
            value={form.property_type}
            onChange={e => update('property_type', e.target.value)}
            options={['Apartment', 'Villa', 'Plot', 'Commercial', 'Rental'].map(s => ({ value: s, label: s }))}
          />
          <Input label="Developer" placeholder="DLF, Godrej, etc." value={form.developer} onChange={e => update('developer', e.target.value)} />
        </div>
      </Card>

      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Specifications</h3>
        <div className="space-y-3">
          <Input label="Price (₹)" placeholder="5000000" value={form.price} onChange={e => update('price', e.target.value)} type="number" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Size" placeholder="1200" value={form.size} onChange={e => update('size', e.target.value)} type="number" />
            <Select
              label="Unit"
              value={form.size_unit}
              onChange={e => update('size_unit', e.target.value)}
              options={[{ value: 'sq.ft', label: 'sq.ft' }, { value: 'sq.m', label: 'sq.m' }, { value: 'sq.yd', label: 'sq.yd' }]}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Bedrooms" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} type="number" />
            <Input label="Bathrooms" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} type="number" />
            <Input label="Floor" placeholder="3/10" value={form.floor} onChange={e => update('floor', e.target.value)} />
          </div>
          <Select
            label="Furnishing"
            value={form.furnishing}
            onChange={e => update('furnishing', e.target.value)}
            options={['Unfurnished', 'Semi-Furnished', 'Fully Furnished'].map(s => ({ value: s, label: s }))}
          />
          <Select
            label="Availability"
            value={form.availability}
            onChange={e => update('availability', e.target.value)}
            options={['Available', 'Hold', 'Sold', 'Rented'].map(s => ({ value: s, label: s }))}
          />
        </div>
      </Card>

      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Additional</h3>
        <div className="space-y-3">
          <TextArea label="Description" placeholder="Describe the property..." value={form.description} onChange={e => update('description', e.target.value)} />
          <Input label="Amenities (comma separated)" placeholder="Parking, Gym, Pool" value={form.amenities} onChange={e => update('amenities', e.target.value)} />
        </div>
      </Card>

      <div className="sticky bottom-16 bg-gray-50 py-3 -mx-4 px-4">
        <Button type="submit" className="w-full" size="lg">Add Property</Button>
      </div>
    </form>
  );
}
