import { useState } from 'react';
import { Building2, ChevronRight, Lock, Mail, Shield, FileText } from 'lucide-react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CONFIG } from '@/config';

const IS_DEMO = CONFIG.mode === 'demo';

export function LoginPage() {
  const { login, toast, users } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showQuickLogin, setShowQuickLogin] = useState(IS_DEMO);
  const [honeypot, setHoneypot] = useState('');  // spam trap

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Honeypot: if filled, it's a bot
    if (honeypot) return;

    if (!email) {
      toast('Please enter your email', 'error');
      return;
    }
    if (!password) {
      toast('Please enter your password', 'error');
      return;
    }
    const success = login(email, password);
    if (!success) {
      // don't reveal whether email exists
    }
  };

  const quickLogin = (userEmail: string) => {
    login(userEmail, 'demo');
  };

  const roleLabels: Record<string, string> = {
    admin: '👑 Admin',
    sales_manager: '📊 Sales Manager',
    sales_agent: '📞 Sales Agent',
    field_executive: '🏗️ Field Executive',
    social_media_manager: '📱 Social Media',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg" aria-hidden="true">
            <Building2 size={40} className="text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-white">{CONFIG.appName}</h1>
          <p className="text-primary-200 mt-1 text-sm">{CONFIG.tagline}</p>
        </div>

        {/* Login Form */}
        <Card className="w-full max-w-sm" padding="lg">
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-sm text-gray-500">Sign in to your account</p>
            </div>

            {/* Honeypot — invisible to humans, bots fill it */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="website-url">Website</label>
              <input id="website-url" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
            </div>

            <div>
              <label htmlFor="login-email" className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-1">
                <Mail size={14} className="text-gray-400" /> Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                maxLength={254}
                required
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-1">
                <Lock size={14} className="text-gray-400" /> Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                maxLength={128}
                required
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px]"
              />
              {IS_DEMO && <p className="text-[10px] text-gray-400 mt-1">Demo password: <code className="bg-gray-100 px-1 rounded">{CONFIG.adminPassword}</code></p>}
            </div>

            <Button type="submit" className="w-full" aria-label="Sign in to your account">
              Sign In
            </Button>
          </form>
        </Card>

        {/* Quick Login — only shown in demo/dev mode */}
        {IS_DEMO && (
          <div className="w-full max-w-sm mt-6">
            <button
              onClick={() => setShowQuickLogin(!showQuickLogin)}
              className="text-primary-200 text-sm font-medium w-full text-center mb-3 hover:text-white"
              aria-expanded={showQuickLogin}
              aria-controls="demo-accounts"
            >
              {showQuickLogin ? 'Hide' : 'Show'} Demo Accounts
            </button>

            {showQuickLogin && (
              <div id="demo-accounts" className="space-y-2" role="list" aria-label="Demo login accounts">
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => quickLogin(user.email)}
                    role="listitem"
                    className="w-full flex items-center justify-between bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl px-4 py-3 transition-colors"
                    aria-label={`Sign in as ${user.full_name}, ${roleLabels[user.role]}`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium">{user.full_name}</p>
                      <p className="text-xs text-primary-200">{roleLabels[user.role]}</p>
                    </div>
                    <ChevronRight size={18} className="text-primary-300" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with legal links */}
      <footer className="text-center pb-6 space-y-2">
        <p className="text-primary-300 text-xs">{CONFIG.appName} CRM v1.0 · Cloud-based Real Estate CRM</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => useStore.getState().navigate('privacy')} className="text-primary-300 hover:text-white text-xs flex items-center gap-1">
            <Shield size={10} /> Privacy Policy
          </button>
          <button onClick={() => useStore.getState().navigate('terms')} className="text-primary-300 hover:text-white text-xs flex items-center gap-1">
            <FileText size={10} /> Terms of Service
          </button>
        </div>
      </footer>
    </div>
  );
}
