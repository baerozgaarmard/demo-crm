import { cn } from '@/utils/cn';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colors = [
  'bg-primary-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-sky-500', 'bg-violet-500', 'bg-pink-500', 'bg-teal-500',
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string) {
  if (!name || !name.trim()) return '?';
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const safeName = name || '';
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-semibold shrink-0',
        getColor(safeName),
        sizes[size],
        className
      )}
      role="img"
      aria-label={safeName ? `Avatar for ${safeName}` : 'User avatar'}
    >
      {getInitials(safeName)}
    </div>
  );
}
