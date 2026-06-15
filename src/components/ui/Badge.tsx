import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'hot' | 'warm' | 'cold' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

const variants: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  hot: 'bg-red-100 text-red-600',
  warm: 'bg-amber-100 text-amber-600',
  cold: 'bg-blue-100 text-blue-600',
  outline: 'bg-white border border-gray-200 text-gray-600',
};

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full whitespace-nowrap',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
