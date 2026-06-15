// ═══════════════════════════════════════════════════════
// EstateFlow CRM — Commercial SaaS Type System v2
// All new fields optional for backward compatibility
// ═══════════════════════════════════════════════════════

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  logo_url?: string;
  plan?: 'trial' | 'starter' | 'growth' | 'enterprise';
  max_users?: number;
  max_leads?: number;
  created_at: string;
  updated_at?: string;
}

export type BillingPlan = 'trial' | 'starter' | 'growth' | 'enterprise';

export interface BillingUsage {
  id: string;
  organization_id: string;
  period: string;
  call_minutes: number;
  whatsapp_messages: number;
  sms_messages: number;
  storage_mb: number;
  active_users: number;
  leads_created: number;
  updated_at: string;
}

export type UserRole = 'owner' | 'admin' | 'sales_manager' | 'sales_agent' | 'field_executive' | 'social_media_manager';

export interface User {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  max_leads?: number;
  daily_call_target?: number;
  created_at: string;
  updated_at?: string;
}

export type LeadSource =
  | '99acres' | 'MagicBricks' | 'Housing.com' | 'NoBroker'
  | 'Facebook Ads' | 'Instagram Ads' | 'Google Ads'
  | 'Website' | 'Walk-in' | 'Referral' | 'Channel Partner'
  | 'Builder Event' | 'WhatsApp' | 'Just Dial' | 'CSV Import'
  | 'Zapier' | 'Manual' | 'Other';

export type PropertyType = 'Apartment' | 'Villa' | 'Plot' | 'Penthouse' | 'Row House' | 'Studio' | 'Commercial' | 'Office' | 'Shop' | 'Warehouse' | 'Farmhouse' | 'Rental';

export type LeadStatus =
  | 'New' | 'Contacted' | 'Interested' | 'Site Visit Scheduled'
  | 'Site Visit Done' | 'Negotiation' | 'Booking' | 'Won'
  | 'Lost' | 'Not Responding' | 'Junk' | 'On Hold';

export type LeadTemperature = 'Cold' | 'Warm' | 'Hot';

export type LostReason =
  | 'Budget Mismatch' | 'Location Mismatch' | 'Bought Elsewhere'
  | 'Not Ready' | 'Financing Issue' | 'Junk Lead' | 'DND' | 'Other';

export interface Lead {
  id: string;
  organization_id: string;
  full_name: string;
  phone: string;
  phone_alt?: string;
  email: string;
  source: LeadSource;
  source_campaign?: string;
  property_type: PropertyType;
  budget_min: number;
  budget_max: number;
  preferred_location?: string;
  preferred_locations?: string[];
  possession_timeline?: string;
  status: LeadStatus;
  temperature: LeadTemperature;
  assigned_agent_id: string;
  notes: string;
  next_followup: string | null;
  last_contacted: string | null;
  lost_reason?: LostReason | null;
  lost_notes?: string;
  consent_given?: boolean;
  consent_timestamp?: string | null;
  dnd_flag?: boolean;
  opt_out?: boolean;
  is_duplicate?: boolean;
  duplicate_of?: string | null;
  first_response_seconds?: number | null;
  score?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export type AvailabilityStatus = 'Available' | 'Hold' | 'Sold' | 'Rented' | 'Upcoming';
export type FurnishingStatus = 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';

export interface Property {
  id: string;
  organization_id: string;
  title: string;
  project_name?: string;
  location: string;
  address: string;
  property_type: PropertyType;
  price: number;
  price_per_sqft?: number;
  size: number;
  size_unit: string;
  bedrooms: number;
  bathrooms: number;
  floor: string;
  total_floors?: number;
  furnishing: FurnishingStatus;
  availability: AvailabilityStatus;
  possession_date?: string;
  rera_id?: string;
  description: string;
  amenities: string[];
  images: string[];
  brochure_url?: string;
  video_url?: string;
  developer: string;
  share_link?: string;
  created_at: string;
  updated_at: string;
}

export type SiteVisitStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface SiteVisit {
  id: string;
  organization_id: string;
  lead_id: string;
  property_id: string;
  agent_id: string;
  field_executive_id?: string;
  scheduled_date: string;
  scheduled_time: string;
  status: SiteVisitStatus;
  pickup_location?: string;
  transport_arranged?: boolean;
  visit_notes?: string;
  feedback?: string;
  interest_level?: LeadTemperature | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type ActivityType =
  | 'call' | 'call_missed' | 'note' | 'status_change'
  | 'property_share' | 'followup_created' | 'followup_completed'
  | 'message_whatsapp' | 'message_sms' | 'message_email'
  | 'assignment' | 'reassignment'
  | 'site_visit_scheduled' | 'site_visit_completed' | 'site_visit_cancelled'
  | 'lead_created' | 'lead_imported' | 'lead_won' | 'lead_lost'
  | 'consent_given' | 'consent_revoked' | 'duplicate_detected';

export interface Activity {
  id: string;
  organization_id: string;
  lead_id: string;
  user_id: string;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export type CallStatus = 'initiated' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'no_answer' | 'busy' | 'cancelled';
export type CallOutcome = 'interested' | 'not_interested' | 'callback' | 'wrong_number' | 'not_reachable' | 'switched_off' | 'voicemail' | 'connected' | 'junk';
export type CallDirection = 'outbound_bridge' | 'outbound_direct' | 'inbound';

export interface CallLog {
  id: string;
  organization_id: string;
  lead_id: string;
  agent_id: string;
  direction?: CallDirection;
  call_sid: string;
  conference_sid: string;
  status: CallStatus;
  duration: number;
  recording_url: string;
  started_at: string;
  ended_at: string;
  outcome: CallOutcome | null;
  notes?: string;
  cost_units?: number;
  created_at: string;
}

export type FollowUpStatus = 'pending' | 'completed' | 'snoozed' | 'cancelled' | 'overdue';
export type FollowUpChannel = 'call' | 'whatsapp' | 'sms' | 'email' | 'site_visit' | 'in_person';

// Keep backward compat alias
export type FollowUpType = FollowUpChannel;

export interface FollowUp {
  id: string;
  organization_id: string;
  lead_id: string;
  agent_id: string;
  type?: FollowUpChannel; // backward compat
  channel?: FollowUpChannel;
  due_date: string;
  due_time?: string;
  status: FollowUpStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  template_id?: string;
  template?: string; // backward compat
  message?: string;
  notes: string;
  completed_at: string | null;
  snoozed_until?: string | null;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  organization_id: string;
  name: string;
  channel: FollowUpChannel;
  category: 'greeting' | 'followup' | 'property_share' | 'site_visit' | 'post_visit' | 'closing' | 'custom';
  body: string;
  variables: string[];
  is_default: boolean;
  usage_count: number;
  created_at: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'half_day' | 'on_leave' | 'wfh';

export interface Attendance {
  id: string;
  organization_id: string;
  user_id: string;
  date?: string;
  check_in_time: string;
  check_out_time: string | null;
  check_in_lat: number | null;
  check_in_lng: number | null;
  check_out_lat: number | null;
  check_out_lng: number | null;
  status: AttendanceStatus;
  total_hours?: number;
  notes: string;
  created_at: string;
}

export type PostType = 'Instagram Reel' | 'Instagram Post' | 'Facebook Post' | 'LinkedIn Post' | 'YouTube Short' | 'Story';
export type PostStatus = 'Idea' | 'Draft' | 'Approved' | 'Scheduled' | 'Published' | 'Rejected';

export interface SocialPost {
  id: string;
  organization_id: string;
  title: string;
  post_type: PostType;
  caption: string;
  media_url: string;
  status: PostStatus;
  scheduled_date: string | null;
  assigned_to: string;
  approved_by?: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'lead_assigned' | 'lead_reassigned' | 'new_lead'
  | 'missed_call' | 'followup_due' | 'followup_overdue'
  | 'site_visit_scheduled' | 'site_visit_reminder'
  | 'property_shared' | 'lead_won' | 'lead_lost'
  | 'attendance_late' | 'system';

export interface Notification {
  id: string;
  organization_id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link_to?: string;
  read: boolean;
  created_at: string;
}

export interface IntegrationSettings {
  id: string;
  organization_id: string;
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_phone?: string;
  twilio_phone_number?: string;
  caller_id?: string;
  call_recording_enabled?: boolean;
  whatsapp_provider?: string;
  whatsapp_sender?: string;
  whatsapp_api_key?: string;
  whatsapp_phone_id?: string;
  whatsapp_business_id?: string;
  sms_provider?: string;
  sms_api_key?: string;
  sms_sender_id?: string;
  email_provider?: string;
  resend_api_key?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  from_email?: string;
  openai_api_key?: string;
  webhook_secret: string;
  webhook_url?: string;
  lead_assignment_mode: 'round_robin' | 'least_busy' | 'manual' | 'weighted';
  auto_call_on_new_lead?: boolean;
  speed_to_lead_target_seconds?: number;
  razorpay_key_id?: string;
  razorpay_key_secret?: string;
  data_retention_days?: number;
  require_consent?: boolean;
  auto_dnd_check?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface CSVImport {
  id: string;
  organization_id: string;
  user_id: string;
  file_name: string;
  total_rows: number;
  imported_rows: number;
  duplicate_rows: number;
  error_rows: number;
  errors: { row: number; field: string; message: string }[];
  status: ImportStatus;
  created_at: string;
}

export interface DataRequest {
  id: string;
  organization_id: string;
  type: 'export' | 'delete';
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  reason: string;
  processed_by?: string;
  processed_at?: string | null;
  created_at: string;
}

export type Page =
  | 'dashboard' | 'leads' | 'lead-detail' | 'add-lead' | 'import-leads'
  | 'properties' | 'property-detail' | 'add-property'
  | 'followups' | 'site-visits'
  | 'attendance' | 'social' | 'add-post'
  | 'team' | 'settings' | 'reports' | 'notifications'
  | 'templates' | 'compliance' | 'billing' | 'audit-log'
  | 'privacy' | 'terms' | 'login';

export interface DashboardMetrics {
  new_leads_today: number;
  new_leads_this_week: number;
  calls_today: number;
  calls_connected: number;
  followups_due: number;
  followups_overdue: number;
  site_visits_today: number;
  hot_leads: number;
  avg_speed_to_lead_seconds: number;
  won_this_month: number;
  lost_this_month: number;
  conversion_rate: number;
  leads_by_source: { source: string; count: number }[];
  leads_by_status: { status: string; count: number }[];
  agent_performance: {
    agent_id: string;
    agent_name: string;
    leads: number;
    calls: number;
    won: number;
  }[];
}
