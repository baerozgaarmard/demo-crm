import { Bell, ArrowLeft, LogOut, Search } from 'lucide-react';
import { useStore } from '@/store';
import { Avatar } from '@/components/ui/Avatar';
import { CONFIG } from '@/config';
import type { Page } from '@/types';

const pageTitles: Partial<Record<Page, string>> = {
  dashboard: 'Dashboard',
  leads: 'Leads',
  'lead-detail': 'Lead Details',
  'add-lead': 'Add Lead',
  properties: 'Properties',
  'property-detail': 'Property Details',
  'add-property': 'Add Property',
  followups: 'Follow-ups',
  attendance: 'Attendance',
  social: 'Social Media',
  'add-post': 'New Post',
  team: 'Team',
  settings: 'Settings',
  reports: 'Reports',
  notifications: 'Notifications',
  'import-leads': 'Import Leads',
  'site-visits': 'Site Visits',
  templates: 'Templates',
  compliance: 'Compliance',
  billing: 'Billing',
  'audit-log': 'Audit Log',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
};

const backPages: Partial<Record<Page, Page>> = {
  'lead-detail': 'leads',
  'add-lead': 'leads',
  'import-leads': 'leads',
  'site-visits': 'settings',
  'templates': 'settings',
  'compliance': 'settings',
  'billing': 'settings',
  'audit-log': 'settings',
  'property-detail': 'properties',
  'add-property': 'properties',
  'add-post': 'social',
  attendance: 'settings',
  social: 'settings',
  team: 'settings',
  reports: 'settings',
  notifications: 'dashboard',
  privacy: 'settings',
  terms: 'settings',
};

export function Header() {
  const { currentPage, navigate, currentUser, notifications, logout } = useStore();
  const unreadCount = notifications.filter(n => n.user_id === currentUser?.id && !n.read).length;

  const hasBack = currentPage in backPages;
  const title = pageTitles[currentPage] || CONFIG.appName;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {hasBack ? (
            <button
              onClick={() => navigate(backPages[currentPage]!)}
              className="p-1 -ml-1 rounded-lg hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Go back"
            >
              <ArrowLeft size={22} />
            </button>
          ) : currentPage === 'dashboard' ? (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{CONFIG.appName.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-gray-900">{CONFIG.appName}</h1>
                <p className="text-[10px] text-gray-500">{CONFIG.tagline}</p>
              </div>
            </div>
          ) : null}
          <h1 className="text-lg font-semibold text-gray-900">{hasBack || currentPage !== 'dashboard' ? title : ''}</h1>
        </div>

        <div className="flex items-center gap-1">
          {currentPage === 'dashboard' && (
            <button
              onClick={() => navigate('leads')}
              className="p-2 rounded-xl hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-500 text-gray-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Search leads"
            >
              <Search size={20} />
            </button>
          )}
          <button
            onClick={() => navigate('notifications')}
            className="relative p-2 rounded-xl hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-500 text-gray-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-dot">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
            <Avatar name={currentUser?.full_name || ''} size="sm" />
            <div className="text-right">
              <p className="text-xs font-medium text-gray-900">{currentUser?.full_name}</p>
              <p className="text-[10px] text-gray-500 capitalize">{currentUser?.role?.replace('_', ' ')}</p>
            </div>
            <button onClick={logout} className="p-1 text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-primary-500 rounded" aria-label="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
