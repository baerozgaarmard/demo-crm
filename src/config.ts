// ═══════════════════════════════════════════════════════
// EstateFlow CRM — Client Configuration
// ═══════════════════════════════════════════════════════
// 
// CHANGE THESE VALUES FOR EACH CLIENT before building.
// This is the ONLY file you need to edit per client.
//
// After changing, run: npm run build
// Then deploy the dist/index.html file.
// ═══════════════════════════════════════════════════════

export const CONFIG = {

  // ── App Mode ──
  // 'demo'  = shows demo accounts on login, loads fake data
  // 'client' = clean login, only admin account, no fake data
  mode: 'demo' as 'demo' | 'client',

  // ── Client Details ──
  companyName: 'Skyline Realty Group',
  companySlug: 'skyline-realty',
  plan: 'growth' as 'trial' | 'starter' | 'growth' | 'enterprise',

  // ── Admin Account (created on first setup) ──
  adminName: 'Admin',
  adminEmail: 'admin@estateflow.com',
  adminPhone: '+919999999999',
  adminPassword: 'demo',  // Change for each client!

  // ── Branding ──
  appName: 'EstateFlow',
  tagline: 'Real Estate CRM',
  primaryColor: '#4f46e5', // Indigo

  // ── Default Settings ──
  maxUsers: 25,
  maxLeads: 10000,
  leadAssignmentMode: 'round_robin' as 'round_robin' | 'least_busy' | 'manual' | 'weighted',
  autoCallOnNewLead: true,
  speedToLeadTargetSeconds: 120,
  dataRetentionDays: 365,
  requireConsent: true,
};
