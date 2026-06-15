import { v4 as uuid } from 'uuid';
import type { Organization, User, Lead, Property, CallLog, FollowUp, Attendance, SocialPost, Activity, Notification, MessageTemplate, SiteVisit, BillingUsage, IntegrationSettings } from '@/types';
import { CONFIG } from '@/config';

const ORG_ID = 'org-001';
const ADMIN_ID = 'user-admin';
const AGENT1_ID = 'user-agent1';
const AGENT2_ID = 'user-agent2';
const MANAGER_ID = 'user-manager';
const FIELD_ID = 'user-field1';
const SOCIAL_ID = 'user-social1';

// ── Organization ──
export const seedOrganization: Organization = {
  id: ORG_ID, name: CONFIG.companyName, slug: CONFIG.companySlug,
  logo_url: '', plan: CONFIG.plan, max_users: CONFIG.maxUsers, max_leads: CONFIG.maxLeads,
  created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
};

// ── Users ──
const demoUsers: User[] = [
  { id: ADMIN_ID, organization_id: ORG_ID, email: 'admin@estateflow.com', full_name: 'Vikram Mehta', phone: '+919800000001', role: 'owner', is_active: true, avatar_url: '', max_leads: 0, daily_call_target: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: MANAGER_ID, organization_id: ORG_ID, email: 'manager@estateflow.com', full_name: 'Priya Sharma', phone: '+919800000002', role: 'sales_manager', is_active: true, avatar_url: '', max_leads: 200, daily_call_target: 10, created_at: '2024-01-05T00:00:00Z', updated_at: '2024-01-05T00:00:00Z' },
  { id: AGENT1_ID, organization_id: ORG_ID, email: 'agent1@estateflow.com', full_name: 'Rahul Verma', phone: '+919800000003', role: 'sales_agent', is_active: true, avatar_url: '', max_leads: 100, daily_call_target: 30, created_at: '2024-01-10T00:00:00Z', updated_at: '2024-01-10T00:00:00Z' },
  { id: AGENT2_ID, organization_id: ORG_ID, email: 'agent2@estateflow.com', full_name: 'Anita Desai', phone: '+919800000004', role: 'sales_agent', is_active: true, avatar_url: '', max_leads: 100, daily_call_target: 30, created_at: '2024-01-10T00:00:00Z', updated_at: '2024-01-10T00:00:00Z' },
  { id: FIELD_ID, organization_id: ORG_ID, email: 'field1@estateflow.com', full_name: 'Suresh Kumar', phone: '+919800000005', role: 'field_executive', is_active: true, avatar_url: '', max_leads: 50, daily_call_target: 5, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },
  { id: SOCIAL_ID, organization_id: ORG_ID, email: 'social@estateflow.com', full_name: 'Meera Patel', phone: '+919800000006', role: 'social_media_manager', is_active: true, avatar_url: '', max_leads: 0, daily_call_target: 0, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },
];

const clientUsers: User[] = [
  { id: ADMIN_ID, organization_id: ORG_ID, email: CONFIG.adminEmail, full_name: CONFIG.adminName, phone: CONFIG.adminPhone, role: 'owner', is_active: true, avatar_url: '', max_leads: 0, daily_call_target: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const seedUsers: User[] = CONFIG.mode === 'demo' ? demoUsers : clientUsers;

// ── Demo Data (only in demo mode) ──
const now = new Date();
const today = now.toISOString().split('T')[0];
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

const sources: Lead['source'][] = ['99acres', 'MagicBricks', 'Housing.com', 'Facebook Ads', 'Instagram Ads', 'Website', 'Referral', 'Walk-in', 'Channel Partner', 'Google Ads'];
const statuses: Lead['status'][] = ['New', 'Contacted', 'Interested', 'Site Visit Scheduled', 'Site Visit Done', 'Negotiation', 'Booking', 'Won', 'Lost', 'Not Responding', 'Junk', 'On Hold'];
const temps: Lead['temperature'][] = ['Cold', 'Warm', 'Hot'];
const ptypes: Lead['property_type'][] = ['Apartment', 'Villa', 'Plot', 'Penthouse', 'Row House', 'Commercial', 'Rental'];
const locations = ['Gurgaon', 'Noida', 'Dwarka', 'South Delhi', 'Whitefield Bangalore', 'Bandra Mumbai', 'Andheri Mumbai', 'Powai Mumbai', 'Indiranagar Bangalore', 'HSR Layout Bangalore'];
const names = ['Amit Khanna', 'Sonia Gill', 'Rajesh Nair', 'Kavita Reddy', 'Manish Tiwari', 'Deepa Joshi', 'Arjun Singh', 'Neha Kapoor', 'Vivek Malhotra', 'Pooja Agarwal', 'Sanjay Gupta', 'Ritu Bansal', 'Karan Bhatia', 'Isha Pandey', 'Rohit Saxena', 'Swati Dubey', 'Nitin Chawla', 'Divya Menon', 'Aakash Jain', 'Pallavi Das'];

const demoLeads: Lead[] = names.map((name, i) => ({
  id: `lead-${String(i + 1).padStart(3, '0')}`,
  organization_id: ORG_ID, full_name: name, phone: `+91${9000000000 + i}`, phone_alt: '',
  email: `${name.split(' ')[0].toLowerCase()}@email.com`,
  source: sources[i % sources.length], source_campaign: i % 3 === 0 ? 'Summer Launch 2024' : '',
  property_type: ptypes[i % ptypes.length],
  budget_min: (50 + i * 5) * 100000, budget_max: (80 + i * 8) * 100000,
  preferred_location: locations[i % locations.length],
  preferred_locations: [locations[i % locations.length]],
  possession_timeline: ['Immediate', 'Within 6 months', 'Within 1 year', '1-2 years'][i % 4],
  status: statuses[i % statuses.length], temperature: temps[i % temps.length],
  assigned_agent_id: i % 2 === 0 ? AGENT1_ID : AGENT2_ID,
  notes: `Looking for ${ptypes[i % ptypes.length]} in ${locations[i % locations.length]}`,
  next_followup: i < 8 ? `${today}T${10 + (i % 8)}:00:00Z` : null,
  last_contacted: i < 15 ? daysAgo(i) : null,
  lost_reason: null, lost_notes: '',
  consent_given: true, consent_timestamp: daysAgo(20 - i), dnd_flag: i === 19, opt_out: false,
  is_duplicate: false, duplicate_of: null,
  first_response_seconds: i < 12 ? 30 + i * 15 : null, score: Math.max(0, 100 - i * 4), tags: [],
  created_at: daysAgo(20 - i), updated_at: daysAgo(Math.max(0, 10 - i)),
}));

export const seedLeads: Lead[] = CONFIG.mode === 'demo' ? demoLeads : [];

// ── Properties ──
const propertyTitles = ['Emerald Heights 3BHK', 'Sapphire Residency 2BHK', 'Golden Palm Villa', 'Crystal Tower Penthouse', 'Green Valley Plot', 'Metro Square Office', 'Sunrise Apartments 1BHK', 'Royal Orchid 4BHK', 'Silver Oaks Villa', 'City Center Shop'];

const demoProperties: Property[] = propertyTitles.map((title, i) => ({
  id: `prop-${String(i + 1).padStart(3, '0')}`, organization_id: ORG_ID, title,
  project_name: ['Emerald Heights', 'Sapphire Residency', 'Golden Palm Estate', 'Crystal Towers', 'Green Valley'][i % 5],
  location: locations[i % locations.length],
  address: `${100 + i * 10}, Sector ${i + 10}, ${locations[i % locations.length]}`,
  property_type: ptypes[i % ptypes.length], price: (40 + i * 15) * 100000, price_per_sqft: 8000 + i * 500,
  size: 800 + i * 200, size_unit: 'sq.ft', bedrooms: (i % 4) + 1, bathrooms: (i % 3) + 1,
  floor: `${i + 1}`, total_floors: i + 10,
  furnishing: (['Unfurnished', 'Semi-Furnished', 'Fully Furnished'] as const)[i % 3],
  availability: (['Available', 'Available', 'Available', 'Hold', 'Sold'] as const)[i % 5],
  possession_date: i < 5 ? 'Ready to Move' : `Dec 202${5 + (i % 3)}`,
  rera_id: `RERA${String(i + 1001).padStart(6, '0')}`,
  description: `Beautiful ${title} in ${locations[i % locations.length]}. Modern amenities, great connectivity. RERA registered.`,
  amenities: ['Parking', 'Gym', 'Swimming Pool', 'Club House', 'Security', 'Power Backup', 'Lift', 'Garden', 'Play Area'].slice(0, 3 + (i % 6)),
  images: [], brochure_url: '', video_url: '',
  developer: ['DLF', 'Godrej Properties', 'Sobha Ltd', 'Prestige Group', 'Brigade Group'][i % 5],
  share_link: `https://estateflow.app/p/prop-${String(i + 1).padStart(3, '0')}`,
  created_at: daysAgo(30 - i), updated_at: daysAgo(15 - i),
}));

export const seedProperties: Property[] = CONFIG.mode === 'demo' ? demoProperties : [];

// ── Calls ──
const demoCalls: CallLog[] = Array.from({ length: 12 }, (_, i) => ({
  id: `call-${String(i + 1).padStart(3, '0')}`, organization_id: ORG_ID,
  lead_id: demoLeads[i % demoLeads.length].id, agent_id: i % 2 === 0 ? AGENT1_ID : AGENT2_ID,
  direction: 'outbound_bridge' as const,
  call_sid: `CA${uuid().replace(/-/g, '').slice(0, 32)}`, conference_sid: `CF${uuid().replace(/-/g, '').slice(0, 32)}`,
  status: (['completed', 'completed', 'completed', 'no_answer', 'completed'] as const)[i % 5],
  duration: [180, 240, 120, 0, 300][i % 5], recording_url: '',
  started_at: hoursAgo(48 - i * 3), ended_at: hoursAgo(48 - i * 3 - 0.05),
  outcome: (['interested', 'callback', 'connected', null, 'not_interested'] as const)[i % 5],
  notes: '', cost_units: [3, 4, 2, 0, 5][i % 5], created_at: hoursAgo(48 - i * 3),
}));
export const seedCalls: CallLog[] = CONFIG.mode === 'demo' ? demoCalls : [];

// ── Follow-ups ──
const demoFollowUps: FollowUp[] = Array.from({ length: 15 }, (_, i) => ({
  id: `fu-${String(i + 1).padStart(3, '0')}`, organization_id: ORG_ID,
  lead_id: demoLeads[i % demoLeads.length].id, agent_id: i % 2 === 0 ? AGENT1_ID : AGENT2_ID,
  channel: (['call', 'whatsapp', 'email', 'sms', 'site_visit'] as const)[i % 5],
  type: (['call', 'whatsapp', 'email', 'sms', 'site_visit'] as const)[i % 5],
  due_date: i < 8 ? today : new Date(now.getTime() + (i - 7) * 86400000).toISOString().split('T')[0],
  due_time: `${9 + (i % 9)}:00`,
  status: i < 5 ? 'pending' as const : (['completed', 'pending', 'snoozed'] as const)[i % 3],
  priority: (['high', 'medium', 'low', 'urgent'] as const)[i % 4],
  template_id: '', template: ['Follow up on property interest', 'Share new options', 'Schedule site visit'][i % 3],
  message: ['Follow up on property interest', 'Share new options', 'Schedule site visit'][i % 3],
  notes: '', completed_at: i >= 5 && i % 3 === 0 ? daysAgo(1) : null, snoozed_until: null,
  created_at: daysAgo(10 - Math.min(i, 9)),
}));
export const seedFollowUps: FollowUp[] = CONFIG.mode === 'demo' ? demoFollowUps : [];

// ── Site Visits ──
const demoSiteVisits: SiteVisit[] = [
  { id: 'sv-001', organization_id: ORG_ID, lead_id: 'lead-003', property_id: 'prop-001', agent_id: AGENT1_ID, field_executive_id: FIELD_ID, scheduled_date: today, scheduled_time: '11:00', status: 'scheduled', pickup_location: 'Sector 14 Metro', transport_arranged: true, visit_notes: '', feedback: '', interest_level: null, completed_at: null, created_at: daysAgo(1), updated_at: daysAgo(1) },
  { id: 'sv-002', organization_id: ORG_ID, lead_id: 'lead-005', property_id: 'prop-003', agent_id: AGENT2_ID, field_executive_id: FIELD_ID, scheduled_date: today, scheduled_time: '15:00', status: 'confirmed', pickup_location: '', transport_arranged: false, visit_notes: 'Client will drive', feedback: '', interest_level: null, completed_at: null, created_at: daysAgo(2), updated_at: daysAgo(1) },
  { id: 'sv-003', organization_id: ORG_ID, lead_id: 'lead-001', property_id: 'prop-002', agent_id: AGENT1_ID, field_executive_id: FIELD_ID, scheduled_date: daysAgo(2).split('T')[0], scheduled_time: '10:00', status: 'completed', pickup_location: '', transport_arranged: false, visit_notes: '', feedback: 'Client liked the 2BHK layout.', interest_level: 'Hot', completed_at: daysAgo(2), created_at: daysAgo(5), updated_at: daysAgo(2) },
];
export const seedSiteVisits: SiteVisit[] = CONFIG.mode === 'demo' ? demoSiteVisits : [];

// ── Templates (always included — these are useful) ──
export const seedTemplates: MessageTemplate[] = [
  { id: 'tpl-001', organization_id: ORG_ID, name: 'New Lead Greeting', channel: 'whatsapp', category: 'greeting', body: `Hi {{name}}, thank you for your interest! I am {{agent_name}} from ${CONFIG.companyName}. When would be a good time to discuss?`, variables: ['name', 'agent_name'], is_default: true, usage_count: 0, created_at: daysAgo(30) },
  { id: 'tpl-002', organization_id: ORG_ID, name: 'Property Share', channel: 'whatsapp', category: 'property_share', body: 'Hi {{name}}, sharing details of *{{property_title}}* in {{location}}.\n\n🏠 {{bedrooms}} BHK | {{size}} sq.ft\n💰 {{price}}\n📍 {{address}}\n\nDetails: {{share_link}}\n\nShall I schedule a site visit?', variables: ['name', 'property_title', 'location', 'bedrooms', 'size', 'price', 'address', 'share_link'], is_default: true, usage_count: 0, created_at: daysAgo(30) },
  { id: 'tpl-003', organization_id: ORG_ID, name: 'Follow-up Check', channel: 'whatsapp', category: 'followup', body: 'Hi {{name}}, just checking if you reviewed the property details. Would you like to visit the site this weekend?', variables: ['name'], is_default: true, usage_count: 0, created_at: daysAgo(30) },
  { id: 'tpl-004', organization_id: ORG_ID, name: 'Site Visit Confirmation', channel: 'whatsapp', category: 'site_visit', body: 'Hi {{name}}, confirming your site visit:\n\n📅 {{visit_date}} at {{visit_time}}\n🏠 {{property_title}}\n📍 {{address}}\n\nSee you soon!', variables: ['name', 'visit_date', 'visit_time', 'property_title', 'address'], is_default: true, usage_count: 0, created_at: daysAgo(30) },
  { id: 'tpl-005', organization_id: ORG_ID, name: 'Post Visit Follow-up', channel: 'whatsapp', category: 'post_visit', body: 'Hi {{name}}, great meeting you at {{property_title}}! 🙏\n\nShall I send the payment plan and floor plan?', variables: ['name', 'property_title'], is_default: true, usage_count: 0, created_at: daysAgo(30) },
  { id: 'tpl-006', organization_id: ORG_ID, name: 'Quick Call Request', channel: 'sms', category: 'followup', body: `Hi {{name}}, this is {{agent_name}} from ${CONFIG.companyName}. New options in {{location}}. Can I call you for 2 minutes?`, variables: ['name', 'agent_name', 'location'], is_default: true, usage_count: 0, created_at: daysAgo(30) },
];

// ── Attendance ──
const demoAttendance: Attendance[] = (CONFIG.mode === 'demo' ? demoUsers : clientUsers).filter(u => u.role !== 'owner').map((user, i) => ({
  id: `att-${String(i + 1).padStart(3, '0')}`, organization_id: ORG_ID, user_id: user.id, date: today,
  check_in_time: `${today}T09:${String(i * 5).padStart(2, '0')}:00Z`,
  check_out_time: i < 2 ? null : `${today}T18:00:00Z`,
  check_in_lat: 28.4595 + i * 0.001, check_in_lng: 77.0266 + i * 0.001,
  check_out_lat: i < 2 ? null : 28.4595, check_out_lng: i < 2 ? null : 77.0266,
  status: (i > 3 ? 'late' : 'present') as Attendance['status'], total_hours: i < 2 ? 0 : 9, notes: '',
  created_at: `${today}T09:${String(i * 5).padStart(2, '0')}:00Z`,
}));
export const seedAttendance: Attendance[] = CONFIG.mode === 'demo' ? demoAttendance : [];

// ── Social Posts ──
const demoSocialPosts: SocialPost[] = [
  { id: 'sp-001', organization_id: ORG_ID, title: 'New Project Launch', post_type: 'Instagram Post', caption: '🏠 Exciting new launch! Premium 3BHK apartments starting ₹85L*', media_url: '', status: 'Published', scheduled_date: daysAgo(2), assigned_to: SOCIAL_ID, approved_by: MANAGER_ID, notes: '', created_at: daysAgo(5), updated_at: daysAgo(2) },
  { id: 'sp-002', organization_id: ORG_ID, title: 'Property Tour Reel', post_type: 'Instagram Reel', caption: '🎬 Virtual tour of our villa project', media_url: '', status: 'Scheduled', scheduled_date: daysAgo(-1), assigned_to: SOCIAL_ID, approved_by: '', notes: '', created_at: daysAgo(3), updated_at: daysAgo(1) },
  { id: 'sp-003', organization_id: ORG_ID, title: 'Client Testimonial', post_type: 'Facebook Post', caption: '⭐ Happy client story!', media_url: '', status: 'Draft', scheduled_date: null, assigned_to: SOCIAL_ID, approved_by: '', notes: '', created_at: daysAgo(1), updated_at: daysAgo(1) },
];
export const seedSocialPosts: SocialPost[] = CONFIG.mode === 'demo' ? demoSocialPosts : [];

// ── Activities ──
const demoActivities: Activity[] = CONFIG.mode === 'demo' ? demoLeads.slice(0, 10).flatMap((lead, i) => [
  { id: `act-${i}-1`, organization_id: ORG_ID, lead_id: lead.id, user_id: lead.assigned_agent_id, type: 'lead_created' as const, title: 'Lead created', description: `New lead from ${lead.source}`, metadata: {}, created_at: lead.created_at },
  { id: `act-${i}-2`, organization_id: ORG_ID, lead_id: lead.id, user_id: lead.assigned_agent_id, type: 'assignment' as const, title: 'Lead assigned', description: `Assigned to ${i % 2 === 0 ? 'Rahul Verma' : 'Anita Desai'}`, metadata: {}, created_at: lead.created_at },
  ...(i < 5 ? [{ id: `act-${i}-3`, organization_id: ORG_ID, lead_id: lead.id, user_id: lead.assigned_agent_id, type: 'call' as const, title: 'Call made', description: `Called ${lead.full_name}`, metadata: {}, created_at: hoursAgo(48 - i * 5) }] : []),
]) : [];
export const seedActivities: Activity[] = demoActivities;

// ── Notifications ──
const demoNotifications: Notification[] = [
  { id: 'notif-001', organization_id: ORG_ID, user_id: AGENT1_ID, type: 'lead_assigned', title: 'New Lead Assigned', message: 'Amit Khanna from 99acres assigned to you', link_to: 'lead-001', read: false, created_at: hoursAgo(1) },
  { id: 'notif-002', organization_id: ORG_ID, user_id: AGENT1_ID, type: 'followup_due', title: 'Follow-up Due', message: 'Follow-up with Rajesh Nair at 11:00 AM', link_to: 'lead-003', read: false, created_at: hoursAgo(3) },
  { id: 'notif-003', organization_id: ORG_ID, user_id: ADMIN_ID, type: 'new_lead', title: 'New Lead', message: 'Pooja Agarwal from Website', link_to: 'lead-010', read: false, created_at: hoursAgo(2) },
];
export const seedNotifications: Notification[] = CONFIG.mode === 'demo' ? demoNotifications : [];

// ── Billing Usage ──
export const seedBillingUsage: BillingUsage = {
  id: 'bu-001', organization_id: ORG_ID,
  period: new Date().toISOString().slice(0, 7),
  call_minutes: CONFIG.mode === 'demo' ? 342 : 0,
  whatsapp_messages: CONFIG.mode === 'demo' ? 856 : 0,
  sms_messages: CONFIG.mode === 'demo' ? 124 : 0,
  storage_mb: CONFIG.mode === 'demo' ? 245 : 0,
  active_users: CONFIG.mode === 'demo' ? 6 : 1,
  leads_created: CONFIG.mode === 'demo' ? 87 : 0,
  updated_at: new Date().toISOString(),
};

// ── Integration Settings ──
export const seedIntegrationSettings: IntegrationSettings = {
  id: 'is-001', organization_id: ORG_ID,
  twilio_account_sid: '', twilio_auth_token: '', twilio_phone_number: '', twilio_phone: '', caller_id: '',
  call_recording_enabled: true,
  whatsapp_provider: 'none', whatsapp_api_key: '', whatsapp_phone_id: '', whatsapp_business_id: '', whatsapp_sender: '',
  sms_provider: 'none', sms_api_key: '', sms_sender_id: '',
  email_provider: 'none', resend_api_key: '', smtp_host: '', smtp_port: 587, smtp_user: '', smtp_pass: '', from_email: '',
  openai_api_key: '',
  webhook_secret: 'whsec-change-this-in-production', webhook_url: '',
  lead_assignment_mode: CONFIG.leadAssignmentMode, auto_call_on_new_lead: CONFIG.autoCallOnNewLead,
  speed_to_lead_target_seconds: CONFIG.speedToLeadTargetSeconds,
  razorpay_key_id: '', razorpay_key_secret: '',
  data_retention_days: CONFIG.dataRetentionDays, require_consent: CONFIG.requireConsent, auto_dnd_check: false,
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
};
