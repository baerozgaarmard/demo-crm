import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';

export function Toast() {
  const { showToast, toastType, clearToast } = useStore();

  if (!showToast) return null;

  const icons = { success: CheckCircle, error: XCircle, info: Info };
  const colors = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-primary-600',
  };
  const Icon = icons[toastType];

  return (
    <div className="fixed top-4 left-4 right-4 z-[60] flex justify-center animate-slide-up pointer-events-none">
      <div className={cn(
        'flex items-center gap-2 px-4 py-3 rounded-2xl text-white text-sm font-medium shadow-lg max-w-sm pointer-events-auto',
        colors[toastType]
      )}>
        <Icon size={18} />
        <span className="flex-1">{showToast}</span>
        <button onClick={clearToast} className="p-0.5">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
