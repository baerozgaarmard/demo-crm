import { useEffect, useCallback, Component, type ReactNode } from 'react';
import { useStore } from '@/store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Toast } from '@/components/layout/Toast';
import { updateActivity, isSessionExpired } from '@/utils/security';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, RefreshCw, FileQuestion, Shield, FileText } from 'lucide-react';
import { CONFIG } from '@/config';

// Direct imports (singlefile plugin bundles everything — no code-splitting)
import { LoginPage } from '@/pages/Login';
import { DashboardPage } from '@/pages/Dashboard';
import { LeadsPage } from '@/pages/Leads';
import { LeadDetailPage } from '@/pages/LeadDetail';
import { AddLeadPage } from '@/pages/AddLead';
import { ImportLeadsPage } from '@/pages/ImportLeads';
import { SiteVisitsPage } from '@/pages/SiteVisits';
import { TemplatesPage } from '@/pages/Templates';
import { CompliancePage } from '@/pages/Compliance';
import { BillingPage } from '@/pages/Billing';
import { PropertiesPage } from '@/pages/Properties';
import { PropertyDetailPage } from '@/pages/PropertyDetail';
import { AddPropertyPage } from '@/pages/AddProperty';
import { FollowUpsPage } from '@/pages/FollowUps';
import { AttendancePage } from '@/pages/Attendance';
import { SocialMediaPage } from '@/pages/SocialMedia';
import { AddPostPage } from '@/pages/AddPost';
import { TeamPage } from '@/pages/Team';
import { SettingsPage } from '@/pages/Settings';
import { ReportsPage } from '@/pages/Reports';
import { NotificationsPage } from '@/pages/Notifications';

// ── Error Boundary ──
interface EBProps { children: ReactNode }
interface EBState { hasError: boolean }

class ErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card padding="lg" className="max-w-sm text-center">
            <AlertTriangle size={40} className="mx-auto text-amber-500 mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Something went wrong</h2>
            <p className="text-sm text-gray-500 mb-4">An unexpected error occurred. Please refresh.</p>
            <Button onClick={() => { localStorage.removeItem('estateflow-crm-store'); window.location.reload(); }} className="w-full">
              <RefreshCw size={16} /> Reload App
            </Button>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── 404 Page ──
function NotFoundPage() {
  const { navigate } = useStore();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <FileQuestion size={36} className="text-gray-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">The page you are looking for does not exist.</p>
      <Button onClick={() => navigate('dashboard')}>Back to Dashboard</Button>
    </div>
  );
}

// ── Privacy Policy ──
function PrivacyPolicyPage() {
  const { navigate } = useStore();
  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-2 mb-2"><Shield size={20} className="text-primary-600" /><h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1></div>
      <Card padding="md">
        <div className="text-gray-700 space-y-3">
          <p className="text-xs text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-base font-semibold text-gray-900">1. Information We Collect</h2>
          <p className="text-sm">{CONFIG.appName} CRM collects personal information for business operations: full name, phone number, email address, location preferences, property interest data, and GPS coordinates for attendance (with consent).</p>
          <h2 className="text-base font-semibold text-gray-900">2. How We Use Your Information</h2>
          <p className="text-sm">Data is used exclusively for lead management, customer relationship management, team coordination, and business reporting. We do not sell personal data to third parties.</p>
          <h2 className="text-base font-semibold text-gray-900">3. Data Storage &amp; Security</h2>
          <p className="text-sm">All data is stored securely with encryption at rest and in transit. Access is controlled through role-based permissions. Data is retained only as long as necessary for business purposes.</p>
          <h2 className="text-base font-semibold text-gray-900">4. Third-Party Services</h2>
          <p className="text-sm">We may integrate with Twilio (calls/messaging), Supabase (database), and email providers. Each operates under their own privacy policies.</p>
          <h2 className="text-base font-semibold text-gray-900">5. Your Rights</h2>
          <p className="text-sm">Under applicable data protection laws (including India DPDP Act 2023), you have the right to access, correct, or delete your personal data. Contact your organization administrator.</p>
          <h2 className="text-base font-semibold text-gray-900">6. Contact</h2>
          <p className="text-sm">For privacy inquiries, contact your {CONFIG.appName} CRM administrator.</p>
        </div>
      </Card>
      <Button variant="ghost" onClick={() => navigate('settings')}>← Back to Settings</Button>
    </div>
  );
}

// ── Terms of Service ──
function TermsOfServicePage() {
  const { navigate } = useStore();
  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-2 mb-2"><FileText size={20} className="text-primary-600" /><h1 className="text-xl font-bold text-gray-900">Terms of Service</h1></div>
      <Card padding="md">
        <div className="text-gray-700 space-y-3">
          <p className="text-xs text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-base font-semibold text-gray-900">1. Acceptance</h2>
          <p className="text-sm">By accessing {CONFIG.appName} CRM, you agree to these terms. If you do not agree, discontinue use immediately.</p>
          <h2 className="text-base font-semibold text-gray-900">2. Permitted Use</h2>
          <p className="text-sm">{CONFIG.appName} is provided for legitimate real estate business use only. You may not use the service for spam, harassment, or any unlawful activity.</p>
          <h2 className="text-base font-semibold text-gray-900">3. Account Responsibility</h2>
          <p className="text-sm">You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.</p>
          <h2 className="text-base font-semibold text-gray-900">4. Data Accuracy</h2>
          <p className="text-sm">Users must ensure all lead and property information entered is accurate and collected with proper consent.</p>
          <h2 className="text-base font-semibold text-gray-900">5. Limitation of Liability</h2>
          <p className="text-sm">{CONFIG.appName} is provided &quot;as is&quot;. We are not liable for any indirect, incidental, or consequential damages arising from use of the service.</p>
        </div>
      </Card>
      <Button variant="ghost" onClick={() => navigate('settings')}>← Back to Settings</Button>
    </div>
  );
}

// ── Page Router ──
function AppContent() {
  const { currentPage } = useStore();
  switch (currentPage) {
    case 'dashboard': return <DashboardPage />;
    case 'leads': return <LeadsPage />;
    case 'lead-detail': return <LeadDetailPage />;
    case 'add-lead': return <AddLeadPage />;
    case 'import-leads': return <ImportLeadsPage />;
    case 'site-visits': return <SiteVisitsPage />;
    case 'templates': return <TemplatesPage />;
    case 'compliance': return <CompliancePage />;
    case 'billing': return <BillingPage />;
    case 'properties': return <PropertiesPage />;
    case 'property-detail': return <PropertyDetailPage />;
    case 'add-property': return <AddPropertyPage />;
    case 'followups': return <FollowUpsPage />;
    case 'attendance': return <AttendancePage />;
    case 'social': return <SocialMediaPage />;
    case 'add-post': return <AddPostPage />;
    case 'team': return <TeamPage />;
    case 'settings': return <SettingsPage />;
    case 'reports': return <ReportsPage />;
    case 'notifications': return <NotificationsPage />;
    case 'privacy': return <PrivacyPolicyPage />;
    case 'terms': return <TermsOfServicePage />;
    default: return <NotFoundPage />;
  }
}

// ── Main App ──
export default function App() {
  const { isAuthenticated, currentPage, logout, toast } = useStore();

  const checkSessionTimeout = useCallback(() => {
    if (isAuthenticated && isSessionExpired()) {
      logout();
      toast('Session expired. Please log in again.', 'info');
    }
  }, [isAuthenticated, logout, toast]);

  const handleActivity = useCallback(() => {
    if (isAuthenticated) updateActivity();
  }, [isAuthenticated]);

  // Clear any corrupt stored data on first load
  useEffect(() => {
    try {
      const raw = localStorage.getItem('estateflow-crm-store');
      if (raw) {
        const parsed = JSON.parse(raw);
        // If stored version doesn't match or data is corrupt, clear it
        if (!parsed?.version || parsed.version < 5) {
          localStorage.removeItem('estateflow-crm-store');
          window.location.reload();
          return;
        }
      }
    } catch {
      localStorage.removeItem('estateflow-crm-store');
    }
  }, []);

  useEffect(() => {
    const sessionInterval = setInterval(checkSessionTimeout, 60000);
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;
    events.forEach(e => document.addEventListener(e, handleActivity, { passive: true }));

    return () => {
      clearInterval(sessionInterval);
      events.forEach(e => document.removeEventListener(e, handleActivity));
    };
  }, [isAuthenticated, checkSessionTimeout, handleActivity]);

  if (!isAuthenticated || currentPage === 'login') {
    return (
      <ErrorBoundary>
        <LoginPage />
        <Toast />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="max-w-7xl mx-auto px-4 py-4 pb-24" role="main">
          <AppContent />
        </main>
        <BottomNav />
        <Toast />
      </div>
    </ErrorBoundary>
  );
}
