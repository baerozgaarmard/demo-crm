import { LayoutDashboard, Users, Building2, Clock, MoreHorizontal } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';
import type { Page } from '@/types';

const navItems: { page: Page; label: string; icon: React.ElementType }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'leads', label: 'Leads', icon: Users },
  { page: 'properties', label: 'Properties', icon: Building2 },
  { page: 'followups', label: 'Follow-ups', icon: Clock },
  { page: 'settings', label: 'More', icon: MoreHorizontal },
];

export function BottomNav() {
  const { currentPage, navigate } = useStore();

  const isActive = (page: Page) => {
    if (page === 'settings') {
      return ['settings', 'attendance', 'social', 'team', 'reports', 'notifications'].includes(currentPage);
    }
    if (page === 'leads') return currentPage === 'leads' || currentPage === 'lead-detail' || currentPage === 'add-lead';
    if (page === 'properties') return currentPage === 'properties' || currentPage === 'property-detail' || currentPage === 'add-property';
    return currentPage === page;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pb-safe" aria-label="Main navigation">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
        {navItems.map(({ page, label, icon: Icon }) => (
          <button
            key={page}
            onClick={() => navigate(page)}
            className={cn(
              'flex flex-col items-center justify-center py-2 px-3 rounded-xl min-w-[60px] min-h-[52px] transition-colors',
              isActive(page) ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <Icon size={22} strokeWidth={isActive(page) ? 2.5 : 1.5} />
            <span className={cn('text-[10px] mt-0.5', isActive(page) ? 'font-semibold' : 'font-medium')}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
