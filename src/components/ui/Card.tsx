import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export function Card({ children, className, onClick, padding = 'md' }: CardProps) {
  const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5' };
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm',
        paddings[padding],
        onClick && 'cursor-pointer card-hover active:scale-[0.98]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
