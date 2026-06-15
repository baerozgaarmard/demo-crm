import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  // BUG FIX: Handle escape key to close modal
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-2',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className={cn(
        'relative bg-white w-full rounded-t-3xl sm:rounded-2xl shadow-xl animate-slide-up',
        'max-h-[85vh] overflow-y-auto',
        sizes[size]
      )}>
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b border-gray-100 rounded-t-3xl sm:rounded-t-2xl z-10">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-500 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
