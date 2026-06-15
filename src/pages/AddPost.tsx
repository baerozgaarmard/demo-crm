import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, TextArea } from '@/components/ui/Input';
import type { PostType, PostStatus } from '@/types';

export function AddPostPage() {
  const { addSocialPost, users, navigate, toast, currentUser } = useStore();
  const socialUsers = users.filter(u => u.role === 'social_media_manager' || u.role === 'admin');

  const [form, setForm] = useState({
    title: '',
    post_type: 'Instagram Post' as PostType,
    caption: '',
    status: 'Draft' as PostStatus,
    scheduled_date: '',
    assigned_to: currentUser?.id || socialUsers[0]?.id || '',
    notes: '',
  });

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast('Title is required', 'error'); return; }

    addSocialPost({
      title: form.title,
      post_type: form.post_type,
      caption: form.caption,
      media_url: '',
      status: form.status,
      scheduled_date: form.scheduled_date ? new Date(form.scheduled_date).toISOString() : null,
      assigned_to: form.assigned_to,
      notes: form.notes,
    });

    toast('Post created!', 'success');
    navigate('social');
  };

  const generateCaption = () => {
    const captions = [
      `🏠 Discover your dream home! Check out our latest property listing in the heart of the city. Premium amenities, unbeatable location. DM us for details! #RealEstate #DreamHome #PropertyForSale`,
      `✨ New listing alert! Beautiful apartment with stunning views and modern finishes. Don't miss this opportunity! 📞 Contact us today. #RealEstate #NewListing #Investment`,
      `🔑 Looking for the perfect home? We've got you covered! Browse our exclusive collection of premium properties. Link in bio! #EstateFlow #PropertySearch #HomeBuying`,
    ];
    update('caption', captions[Math.floor(Math.random() * captions.length)]);
    toast('✨ AI caption generated (placeholder)', 'info');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-4">
      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Post Details</h3>
        <div className="space-y-3">
          <Input label="Title" placeholder="Post title" value={form.title} onChange={e => update('title', e.target.value)} />
          <Select
            label="Post Type"
            value={form.post_type}
            onChange={e => update('post_type', e.target.value)}
            options={['Instagram Post', 'Instagram Reel', 'Facebook Post', 'LinkedIn Post', 'Story'].map(s => ({ value: s, label: s }))}
          />
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Caption</label>
              <button type="button" onClick={generateCaption} className="text-xs text-primary-600 font-medium flex items-center gap-1">
                <Sparkles size={12} /> AI Generate
              </button>
            </div>
            <TextArea
              placeholder="Write your caption..."
              value={form.caption}
              onChange={e => update('caption', e.target.value)}
              rows={5}
            />
          </div>
        </div>
      </Card>

      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Publishing</h3>
        <div className="space-y-3">
          <Select
            label="Status"
            value={form.status}
            onChange={e => update('status', e.target.value)}
            options={['Idea', 'Draft', 'Scheduled', 'Published'].map(s => ({ value: s, label: s }))}
          />
          <Input
            label="Schedule Date"
            type="datetime-local"
            value={form.scheduled_date}
            onChange={e => update('scheduled_date', e.target.value)}
          />
          <Select
            label="Assign To"
            value={form.assigned_to}
            onChange={e => update('assigned_to', e.target.value)}
            options={socialUsers.map(u => ({ value: u.id, label: u.full_name }))}
          />
          <TextArea label="Notes" placeholder="Internal notes..." value={form.notes} onChange={e => update('notes', e.target.value)} />
        </div>
      </Card>

      <div className="sticky bottom-16 bg-gray-50 py-3 -mx-4 px-4">
        <Button type="submit" className="w-full" size="lg">Create Post</Button>
      </div>
    </form>
  );
}
