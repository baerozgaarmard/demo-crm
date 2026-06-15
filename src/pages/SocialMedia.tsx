import { useState } from 'react';
import { Plus, Image, Video, Calendar, Edit3, Trash2, Globe, MessageCircle, Briefcase } from 'lucide-react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { format, parseISO } from 'date-fns';
import type { PostStatus } from '@/types';

const statusColors: Record<PostStatus, string> = {
  Idea: 'default', Draft: 'warning', Approved: 'info', Scheduled: 'info', Published: 'success', Rejected: 'danger',
};

const typeIcons: Record<string, React.ReactNode> = {
  'Instagram Post': <Image size={14} className="text-pink-500" />,
  'Instagram Reel': <Video size={14} className="text-pink-500" />,
  'Facebook Post': <Globe size={14} className="text-blue-600" />,
  'LinkedIn Post': <Briefcase size={14} className="text-blue-700" />,
  'Story': <MessageCircle size={14} className="text-purple-500" />,
};

export function SocialMediaPage() {
  const { socialPosts, navigate, updateSocialPost, deleteSocialPost, toast } = useStore();
  const [statusFilter, setStatusFilter] = useState<PostStatus | ''>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = statusFilter ? socialPosts.filter(p => p.status === statusFilter) : socialPosts;

  const handleDelete = (id: string) => {
    deleteSocialPost(id);
    setDeleteConfirm(null);
    toast('Post deleted', 'info');
  };

  const handleStatusChange = (id: string, status: PostStatus) => {
    updateSocialPost(id, { status });
    toast(`Post moved to ${status}`, 'success');
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Content Calendar</h2>
          <p className="text-xs text-gray-500">{socialPosts.length} posts</p>
        </div>
        <Button onClick={() => navigate('add-post')} size="sm">
          <Plus size={15} /> New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {([
          { value: '', label: 'All' },
          { value: 'Idea', label: '💡 Ideas' },
          { value: 'Draft', label: '✏️ Drafts' },
          { value: 'Scheduled', label: '📅 Scheduled' },
          { value: 'Published', label: '✅ Published' },
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

      {/* Posts */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No posts yet"
          description="Start planning your social media content"
          actionLabel="Create Post"
          onAction={() => navigate('add-post')}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <Card key={post.id} padding="sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  {typeIcons[post.post_type] || <Image size={18} className="text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{post.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{post.caption}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Badge variant={statusColors[post.status] as any} size="sm">{post.status}</Badge>
                    <Badge variant="outline" size="sm">{post.post_type}</Badge>
                    {post.scheduled_date && (
                      <span className="text-[10px] text-gray-400">
                        📅 {(() => { try { return format(parseISO(post.scheduled_date), 'MMM d, h:mm a'); } catch { return '-'; } })()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                {post.status === 'Idea' && (
                  <Button size="sm" variant="secondary" onClick={() => handleStatusChange(post.id, 'Draft')} className="flex-1">
                    <Edit3 size={12} /> To Draft
                  </Button>
                )}
                {post.status === 'Draft' && (
                  <Button size="sm" variant="primary" onClick={() => handleStatusChange(post.id, 'Scheduled')} className="flex-1">
                    <Calendar size={12} /> Schedule
                  </Button>
                )}
                {post.status === 'Scheduled' && (
                  <Button size="sm" variant="success" onClick={() => handleStatusChange(post.id, 'Published')} className="flex-1">
                    Publish
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(post.id)}>
                  <Trash2 size={12} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Post?" size="sm">
        <p className="text-sm text-gray-600 mb-4">This action cannot be undone.</p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
