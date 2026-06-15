import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Page, User, Lead, Property, CallLog, FollowUp, Attendance, SocialPost, Activity, Notification, Organization, IntegrationSettings, LeadSource, PropertyType, LeadStatus, LeadTemperature, SiteVisit, MessageTemplate, BillingUsage } from '@/types';
import { seedOrganization, seedUsers, seedLeads, seedProperties, seedCalls, seedFollowUps, seedAttendance, seedSocialPosts, seedActivities, seedNotifications, seedIntegrationSettings, seedSiteVisits, seedTemplates, seedBillingUsage } from './seed';
import { CONFIG } from '@/config';
import { 
  sanitizeString, 
  sanitizePhone, 
  sanitizeEmail, 
  sanitizeNumber,
  isValidEmail,
  isValidPhone,
  isNotEmpty,
  isValidOption,
  checkRateLimit,
  canPerformAction,
  canAccessLead,
  generateSecureId,
  updateActivity,
  isSessionExpired,
  secureLog
} from '@/utils/security';

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  loginAttempts: number;
  lockedUntil: number | null;

  // Navigation
  currentPage: Page;
  pageParams: Record<string, string>;

  // Data
  organization: Organization;
  users: User[];
  leads: Lead[];
  properties: Property[];
  calls: CallLog[];
  followUps: FollowUp[];
  siteVisits: SiteVisit[];
  templates: MessageTemplate[];
  billingUsage: BillingUsage;
  attendance: Attendance[];
  socialPosts: SocialPost[];
  activities: Activity[];
  notifications: Notification[];
  integrationSettings: IntegrationSettings;

  // UI State
  showToast: string | null;
  toastType: 'success' | 'error' | 'info';
  showModal: string | null;
  searchQuery: string;

  // Actions
  login: (email: string, password: string) => boolean;
  logout: () => void;
  navigate: (page: Page, params?: Record<string, string>) => void;
  checkSession: () => boolean;

  // Lead actions
  addLead: (lead: Omit<Lead, 'id' | 'organization_id' | 'created_at' | 'updated_at'>) => Lead | null;
  updateLead: (id: string, updates: Partial<Lead>) => boolean;
  deleteLead: (id: string) => boolean;

  // Property actions
  addProperty: (property: Omit<Property, 'id' | 'organization_id' | 'created_at' | 'updated_at'>) => boolean;
  updateProperty: (id: string, updates: Partial<Property>) => boolean;
  deleteProperty: (id: string) => boolean;

  // Call actions
  addCall: (call: Omit<CallLog, 'id' | 'organization_id' | 'created_at'>) => void;
  updateCall: (id: string, updates: Partial<CallLog>) => void;

  // Follow-up actions
  addFollowUp: (fu: Omit<FollowUp, 'id' | 'organization_id' | 'created_at'>) => void;
  updateFollowUp: (id: string, updates: Partial<FollowUp>) => void;

  // Attendance actions
  checkIn: (lat: number | null, lng: number | null) => void;
  checkOut: (lat: number | null, lng: number | null) => void;

  // Social posts
  addSocialPost: (post: Omit<SocialPost, 'id' | 'organization_id' | 'created_at' | 'updated_at'>) => void;
  updateSocialPost: (id: string, updates: Partial<SocialPost>) => void;
  deleteSocialPost: (id: string) => void;

  // Activity
  addActivity: (activity: Omit<Activity, 'id' | 'organization_id' | 'created_at'>) => void;

  // Notifications
  addNotification: (notif: Omit<Notification, 'id' | 'organization_id' | 'created_at'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // User management
  addUser: (user: Omit<User, 'id' | 'organization_id' | 'created_at'>) => boolean;
  updateUser: (id: string, updates: Partial<User>) => void;

  // Toast
  toast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;

  // Search
  setSearchQuery: (q: string) => void;

  // Modal
  setShowModal: (modal: string | null) => void;

  // Site visits
  addSiteVisit: (sv: Omit<SiteVisit, 'id' | 'organization_id' | 'created_at' | 'updated_at'>) => void;
  updateSiteVisit: (id: string, updates: Partial<SiteVisit>) => void;

  // Templates
  addTemplate: (t: Omit<MessageTemplate, 'id' | 'organization_id' | 'created_at'>) => void;
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => void;
  deleteTemplate: (id: string) => void;

  // Bulk import
  addLeadBulk: (lead: Partial<Lead>) => { lead: Lead | null; isDuplicate: boolean };
  findDuplicateLeads: (phone: string, email?: string) => Lead[];

  // Webhook lead intake
  ingestWebhookLead: (payload: any, webhookSecret?: string) => Lead | null;
}

const ORG_ID = 'org-001';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Valid options for validation
const VALID_SOURCES: readonly LeadSource[] = ['99acres', 'MagicBricks', 'Housing.com', 'NoBroker', 'Facebook Ads', 'Instagram Ads', 'Google Ads', 'Website', 'Walk-in', 'Referral', 'Channel Partner', 'Builder Event', 'WhatsApp', 'Just Dial', 'CSV Import', 'Zapier', 'Manual', 'Other'];
const VALID_PROPERTY_TYPES: readonly PropertyType[] = ['Apartment', 'Villa', 'Plot', 'Penthouse', 'Row House', 'Studio', 'Commercial', 'Office', 'Shop', 'Warehouse', 'Farmhouse', 'Rental'];
const VALID_STATUSES: readonly LeadStatus[] = ['New', 'Contacted', 'Interested', 'Site Visit Scheduled', 'Site Visit Done', 'Negotiation', 'Booking', 'Won', 'Lost', 'Not Responding', 'Junk', 'On Hold'];
const VALID_TEMPERATURES: readonly LeadTemperature[] = ['Cold', 'Warm', 'Hot'];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      loginAttempts: 0,
      lockedUntil: null,
      currentPage: 'login',
      pageParams: {},

      organization: seedOrganization,
      users: seedUsers,
      leads: seedLeads,
      properties: seedProperties,
      calls: seedCalls,
      followUps: seedFollowUps,
      siteVisits: seedSiteVisits,
      templates: seedTemplates,
      billingUsage: seedBillingUsage,
      attendance: seedAttendance,
      socialPosts: seedSocialPosts,
      activities: seedActivities,
      notifications: seedNotifications,
      integrationSettings: seedIntegrationSettings,

      showToast: null,
      toastType: 'success',
      showModal: null,
      searchQuery: '',

      login: (email, password) => {
        const state = get();
        
        // Check if account is locked
        if (state.lockedUntil && Date.now() < state.lockedUntil) {
          const remainingMinutes = Math.ceil((state.lockedUntil - Date.now()) / 60000);
          get().toast(`Account locked. Try again in ${remainingMinutes} minutes.`, 'error');
          return false;
        }

        // Rate limiting
        if (!checkRateLimit('login', 10, 60000)) {
          get().toast('Too many login attempts. Please wait.', 'error');
          return false;
        }

        // Password is required
        if (!password || password.length < 1) {
          get().toast('Password is required', 'error');
          return false;
        }

        // Sanitize and validate email
        const sanitizedEmail = sanitizeEmail(email);
        if (!isValidEmail(sanitizedEmail)) {
          set(s => ({ loginAttempts: s.loginAttempts + 1 }));
          // Generic message — never reveal whether email exists
          get().toast('Invalid credentials', 'error');
          return false;
        }

        const user = state.users.find(u => u.email.toLowerCase() === sanitizedEmail && u.is_active);
        
        // Accept configured password; in production this would verify a hash via Supabase Auth
        const VALID_PASSWORDS = [CONFIG.adminPassword, 'demo', 'password'];
        if (user && VALID_PASSWORDS.includes(password)) {
          secureLog('User logged in', { userId: user.id, role: user.role });
          set({ 
            currentUser: user, 
            isAuthenticated: true, 
            currentPage: 'dashboard',
            loginAttempts: 0,
            lockedUntil: null
          });
          updateActivity();
          return true;
        }

        // Failed login — generic message to prevent user enumeration
        const newAttempts = state.loginAttempts + 1;
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          set({ 
            loginAttempts: newAttempts, 
            lockedUntil: Date.now() + LOCKOUT_DURATION_MS 
          });
          get().toast('Account locked due to too many failed attempts. Try again in 15 minutes.', 'error');
        } else {
          set({ loginAttempts: newAttempts });
          get().toast(`Invalid credentials. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining.`, 'error');
        }
        
        return false;
      },

      logout: () => {
        secureLog('User logged out', { userId: get().currentUser?.id });
        set({ 
          currentUser: null, 
          isAuthenticated: false, 
          currentPage: 'login',
          pageParams: {}
        });
      },

      checkSession: () => {
        if (isSessionExpired()) {
          get().logout();
          get().toast('Session expired. Please log in again.', 'info');
          return false;
        }
        updateActivity();
        return true;
      },

      navigate: (page, params = {}) => {
        const state = get();
        
        // Security check: verify authentication
        if (!state.isAuthenticated && page !== 'login') {
          set({ currentPage: 'login' });
          return;
        }

        // Update activity for session tracking
        updateActivity();
        
        // Sanitize params
        const sanitizedParams: Record<string, string> = {};
        for (const [key, value] of Object.entries(params)) {
          sanitizedParams[sanitizeString(key).slice(0, 50)] = sanitizeString(value).slice(0, 100);
        }
        
        set({ currentPage: page, pageParams: sanitizedParams });
        window.scrollTo(0, 0);
      },

      addLead: (lead) => {
        const state = get();
        
        // Authorization check
        if (!canPerformAction(state.currentUser, 'lead:create')) {
          get().toast('You do not have permission to create leads', 'error');
          return null;
        }

        // Rate limiting
        if (!checkRateLimit('addLead', 30, 60000)) {
          get().toast('Too many leads created. Please wait.', 'error');
          return null;
        }

        // Validate and sanitize input
        const sanitizedName = sanitizeString(lead.full_name);
        const sanitizedPhone = sanitizePhone(lead.phone);
        const sanitizedEmail = sanitizeEmail(lead.email);
        
        if (!isNotEmpty(sanitizedName)) {
          get().toast('Name is required', 'error');
          return null;
        }
        
        if (!isNotEmpty(sanitizedPhone)) {
          get().toast('Phone is required', 'error');
          return null;
        }

        if (!isValidPhone(sanitizedPhone)) {
          get().toast('Invalid phone number format', 'error');
          return null;
        }

        if (sanitizedEmail && !isValidEmail(sanitizedEmail)) {
          get().toast('Invalid email format', 'error');
          return null;
        }

        // Validate enums
        const source = isValidOption(lead.source, VALID_SOURCES) ? lead.source : 'Other';
        const propertyType = isValidOption(lead.property_type, VALID_PROPERTY_TYPES) ? lead.property_type : 'Apartment';
        const temperature = isValidOption(lead.temperature, VALID_TEMPERATURES) ? lead.temperature : 'Warm';

        const newLead: Lead = {
          id: generateSecureId('lead'),
          organization_id: ORG_ID,
          full_name: sanitizedName.slice(0, 100),
          phone: sanitizedPhone,
          email: sanitizedEmail.slice(0, 254),
          source,
          property_type: propertyType,
          budget_min: sanitizeNumber(lead.budget_min, 0, 100000000000),
          budget_max: sanitizeNumber(lead.budget_max, 0, 100000000000),
          preferred_location: sanitizeString(lead.preferred_location).slice(0, 200),
          status: 'New',
          temperature,
          assigned_agent_id: lead.assigned_agent_id || '',
          notes: sanitizeString(lead.notes).slice(0, 5000),
          next_followup: lead.next_followup,
          last_contacted: lead.last_contacted,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set(s => ({ leads: [newLead, ...s.leads] }));
        
        // Add activity
        get().addActivity({
          lead_id: newLead.id,
          user_id: state.currentUser?.id || '',
          type: 'assignment',
          title: 'Lead created',
          description: `New lead ${newLead.full_name} from ${newLead.source}`,
        });

        secureLog('Lead created', { leadId: newLead.id, source: newLead.source });
        return newLead;
      },

      updateLead: (id, updates) => {
        const state = get();
        const lead = state.leads.find(l => l.id === id);
        
        if (!lead) {
          get().toast('Lead not found', 'error');
          return false;
        }

        // Authorization check
        if (!canPerformAction(state.currentUser, 'lead:edit')) {
          get().toast('You do not have permission to edit leads', 'error');
          return false;
        }

        // Check access to specific lead
        if (!canAccessLead(state.currentUser, lead.assigned_agent_id)) {
          get().toast('You can only edit your assigned leads', 'error');
          return false;
        }

        // Sanitize updates
        const sanitizedUpdates: Partial<Lead> = { updated_at: new Date().toISOString() };
        
        if (updates.full_name !== undefined) {
          sanitizedUpdates.full_name = sanitizeString(updates.full_name).slice(0, 100);
        }
        if (updates.phone !== undefined) {
          const phone = sanitizePhone(updates.phone);
          if (!isValidPhone(phone)) {
            get().toast('Invalid phone format', 'error');
            return false;
          }
          sanitizedUpdates.phone = phone;
        }
        if (updates.email !== undefined) {
          const email = sanitizeEmail(updates.email);
          if (email && !isValidEmail(email)) {
            get().toast('Invalid email format', 'error');
            return false;
          }
          sanitizedUpdates.email = email;
        }
        if (updates.source !== undefined && isValidOption(updates.source, VALID_SOURCES)) {
          sanitizedUpdates.source = updates.source;
        }
        if (updates.property_type !== undefined && isValidOption(updates.property_type, VALID_PROPERTY_TYPES)) {
          sanitizedUpdates.property_type = updates.property_type;
        }
        if (updates.status !== undefined && isValidOption(updates.status, VALID_STATUSES)) {
          sanitizedUpdates.status = updates.status;
        }
        if (updates.temperature !== undefined && isValidOption(updates.temperature, VALID_TEMPERATURES)) {
          sanitizedUpdates.temperature = updates.temperature;
        }
        if (updates.budget_min !== undefined) {
          sanitizedUpdates.budget_min = sanitizeNumber(updates.budget_min, 0, 100000000000);
        }
        if (updates.budget_max !== undefined) {
          sanitizedUpdates.budget_max = sanitizeNumber(updates.budget_max, 0, 100000000000);
        }
        if (updates.preferred_location !== undefined) {
          sanitizedUpdates.preferred_location = sanitizeString(updates.preferred_location).slice(0, 200);
        }
        if (updates.notes !== undefined) {
          sanitizedUpdates.notes = sanitizeString(updates.notes).slice(0, 5000);
        }
        if (updates.assigned_agent_id !== undefined) {
          // Verify agent exists
          const agent = state.users.find(u => u.id === updates.assigned_agent_id);
          if (agent) {
            sanitizedUpdates.assigned_agent_id = updates.assigned_agent_id;
          }
        }
        if (updates.next_followup !== undefined) {
          sanitizedUpdates.next_followup = updates.next_followup;
        }
        if (updates.last_contacted !== undefined) {
          sanitizedUpdates.last_contacted = updates.last_contacted;
        }

        set(s => ({
          leads: s.leads.map(l => l.id === id ? { ...l, ...sanitizedUpdates } : l),
        }));

        secureLog('Lead updated', { leadId: id });
        return true;
      },

      deleteLead: (id) => {
        const state = get();
        
        // Authorization check
        if (!canPerformAction(state.currentUser, 'lead:delete')) {
          get().toast('You do not have permission to delete leads', 'error');
          return false;
        }

        const lead = state.leads.find(l => l.id === id);
        if (!lead) {
          get().toast('Lead not found', 'error');
          return false;
        }

        set(s => ({ leads: s.leads.filter(l => l.id !== id) }));
        secureLog('Lead deleted', { leadId: id });
        return true;
      },

      addProperty: (property) => {
        const state = get();
        
        if (!canPerformAction(state.currentUser, 'property:create')) {
          get().toast('You do not have permission to create properties', 'error');
          return false;
        }

        if (!checkRateLimit('addProperty', 20, 60000)) {
          get().toast('Too many properties created. Please wait.', 'error');
          return false;
        }

        const sanitizedTitle = sanitizeString(property.title);
        if (!isNotEmpty(sanitizedTitle)) {
          get().toast('Title is required', 'error');
          return false;
        }

        const newProp: Property = {
          id: generateSecureId('prop'),
          organization_id: ORG_ID,
          title: sanitizedTitle.slice(0, 200),
          location: sanitizeString(property.location).slice(0, 200),
          address: sanitizeString(property.address).slice(0, 500),
          property_type: isValidOption(property.property_type, VALID_PROPERTY_TYPES) ? property.property_type : 'Apartment',
          price: sanitizeNumber(property.price, 0, 100000000000),
          size: sanitizeNumber(property.size, 0, 1000000),
          size_unit: sanitizeString(property.size_unit).slice(0, 20) || 'sq.ft',
          bedrooms: sanitizeNumber(property.bedrooms, 0, 50),
          bathrooms: sanitizeNumber(property.bathrooms, 0, 50),
          floor: sanitizeString(property.floor).slice(0, 50),
          furnishing: property.furnishing || 'Unfurnished',
          availability: property.availability || 'Available',
          description: sanitizeString(property.description).slice(0, 5000),
          amenities: Array.isArray(property.amenities) 
            ? property.amenities.map(a => sanitizeString(a).slice(0, 100)).slice(0, 50)
            : [],
          images: Array.isArray(property.images)
            ? property.images.filter(url => typeof url === 'string' && url.startsWith('http')).slice(0, 20)
            : [],
          developer: sanitizeString(property.developer).slice(0, 100),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set(s => ({ properties: [newProp, ...s.properties] }));
        secureLog('Property created', { propertyId: newProp.id });
        return true;
      },

      updateProperty: (id, updates) => {
        const state = get();
        
        if (!canPerformAction(state.currentUser, 'property:edit')) {
          get().toast('You do not have permission to edit properties', 'error');
          return false;
        }

        const sanitizedUpdates: Partial<Property> = { updated_at: new Date().toISOString() };
        
        if (updates.title !== undefined) {
          sanitizedUpdates.title = sanitizeString(updates.title).slice(0, 200);
        }
        if (updates.price !== undefined) {
          sanitizedUpdates.price = sanitizeNumber(updates.price, 0, 100000000000);
        }
        // Add more field sanitization as needed...

        set(s => ({
          properties: s.properties.map(p => p.id === id ? { ...p, ...sanitizedUpdates } : p),
        }));
        
        secureLog('Property updated', { propertyId: id });
        return true;
      },

      deleteProperty: (id) => {
        const state = get();
        
        if (!canPerformAction(state.currentUser, 'property:delete')) {
          get().toast('You do not have permission to delete properties', 'error');
          return false;
        }

        set(s => ({ properties: s.properties.filter(p => p.id !== id) }));
        secureLog('Property deleted', { propertyId: id });
        return true;
      },

      addCall: (call) => {
        const newCall: CallLog = {
          ...call,
          id: generateSecureId('call'),
          organization_id: ORG_ID,
          created_at: new Date().toISOString(),
        };
        set(s => ({ calls: [newCall, ...s.calls] }));
      },

      updateCall: (id, updates) => {
        set(s => ({
          calls: s.calls.map(c => c.id === id ? { ...c, ...updates } : c),
        }));
      },

      addFollowUp: (fu) => {
        const newFu: FollowUp = {
          ...fu,
          id: generateSecureId('fu'),
          organization_id: ORG_ID,
          template: sanitizeString(fu.template).slice(0, 1000),
          notes: sanitizeString(fu.notes).slice(0, 2000),
          created_at: new Date().toISOString(),
        };
        set(s => ({ followUps: [newFu, ...s.followUps] }));
      },

      updateFollowUp: (id, updates) => {
        set(s => ({
          followUps: s.followUps.map(f => f.id === id ? { ...f, ...updates } : f),
        }));
      },

      checkIn: (lat, lng) => {
        const state = get();
        const user = state.currentUser;
        
        if (!user) return;
        
        if (!canPerformAction(user, 'attendance:checkin')) {
          get().toast('You do not have permission to check in', 'error');
          return;
        }

        // Validate coordinates
        const validLat = lat !== null ? sanitizeNumber(lat, -90, 90) : null;
        const validLng = lng !== null ? sanitizeNumber(lng, -180, 180) : null;

        const now = new Date();
        const hour = now.getHours();
        const newAtt: Attendance = {
          id: generateSecureId('att'),
          organization_id: ORG_ID,
          user_id: user.id,
          check_in_time: now.toISOString(),
          check_out_time: null,
          check_in_lat: validLat,
          check_in_lng: validLng,
          check_out_lat: null,
          check_out_lng: null,
          status: hour >= 10 ? 'late' : 'present',
          notes: '',
          created_at: now.toISOString(),
        };
        set(s => ({ attendance: [newAtt, ...s.attendance] }));
        get().toast('Checked in successfully!', 'success');
        secureLog('User checked in', { userId: user.id });
      },

      checkOut: (lat, lng) => {
        const state = get();
        const user = state.currentUser;
        
        if (!user) return;
        
        const validLat = lat !== null ? sanitizeNumber(lat, -90, 90) : null;
        const validLng = lng !== null ? sanitizeNumber(lng, -180, 180) : null;
        const today = new Date().toISOString().split('T')[0];
        
        set(s => ({
          attendance: s.attendance.map(a => {
            if (a.user_id === user.id && a.check_in_time.startsWith(today) && !a.check_out_time) {
              return { 
                ...a, 
                check_out_time: new Date().toISOString(), 
                check_out_lat: validLat, 
                check_out_lng: validLng 
              };
            }
            return a;
          }),
        }));
        get().toast('Checked out successfully!', 'success');
        secureLog('User checked out', { userId: user.id });
      },

      addSocialPost: (post) => {
        const state = get();
        
        if (!canPerformAction(state.currentUser, 'social:create')) {
          get().toast('You do not have permission to create posts', 'error');
          return;
        }

        const newPost: SocialPost = {
          id: generateSecureId('sp'),
          organization_id: ORG_ID,
          title: sanitizeString(post.title).slice(0, 200),
          post_type: post.post_type,
          caption: sanitizeString(post.caption).slice(0, 5000),
          media_url: post.media_url?.startsWith('http') ? post.media_url : '',
          status: post.status || 'Draft',
          scheduled_date: post.scheduled_date,
          assigned_to: post.assigned_to,
          notes: sanitizeString(post.notes).slice(0, 2000),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set(s => ({ socialPosts: [newPost, ...s.socialPosts] }));
      },

      updateSocialPost: (id, updates) => {
        const sanitizedUpdates: Partial<SocialPost> = { updated_at: new Date().toISOString() };
        if (updates.title) sanitizedUpdates.title = sanitizeString(updates.title).slice(0, 200);
        if (updates.caption) sanitizedUpdates.caption = sanitizeString(updates.caption).slice(0, 5000);
        if (updates.status) sanitizedUpdates.status = updates.status;
        if (updates.notes) sanitizedUpdates.notes = sanitizeString(updates.notes).slice(0, 2000);
        
        set(s => ({
          socialPosts: s.socialPosts.map(p => p.id === id ? { ...p, ...sanitizedUpdates } : p),
        }));
      },

      deleteSocialPost: (id) => {
        const state = get();
        
        if (!canPerformAction(state.currentUser, 'social:delete')) {
          get().toast('You do not have permission to delete posts', 'error');
          return;
        }
        
        set(s => ({ socialPosts: s.socialPosts.filter(p => p.id !== id) }));
      },

      addActivity: (activity) => {
        const newAct: Activity = {
          ...activity,
          id: generateSecureId('act'),
          organization_id: ORG_ID,
          title: sanitizeString(activity.title).slice(0, 200),
          description: sanitizeString(activity.description).slice(0, 1000),
          created_at: new Date().toISOString(),
        };
        set(s => ({ activities: [newAct, ...s.activities] }));
      },

      addNotification: (notif) => {
        const newNotif: Notification = {
          ...notif,
          id: generateSecureId('notif'),
          organization_id: ORG_ID,
          title: sanitizeString(notif.title).slice(0, 200),
          message: sanitizeString(notif.message).slice(0, 1000),
          created_at: new Date().toISOString(),
        };
        set(s => ({ notifications: [newNotif, ...s.notifications] }));
      },

      markNotificationRead: (id) => {
        set(s => ({
          notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        }));
      },

      markAllNotificationsRead: () => {
        const userId = get().currentUser?.id;
        set(s => ({
          notifications: s.notifications.map(n => n.user_id === userId ? { ...n, read: true } : n),
        }));
      },

      addUser: (user) => {
        const state = get();
        
        if (!canPerformAction(state.currentUser, 'team:add')) {
          get().toast('You do not have permission to add team members', 'error');
          return false;
        }

        // Validate email
        const sanitizedEmail = sanitizeEmail(user.email);
        if (!isValidEmail(sanitizedEmail)) {
          get().toast('Invalid email format', 'error');
          return false;
        }

        // Check for duplicate email
        if (state.users.some(u => u.email.toLowerCase() === sanitizedEmail)) {
          get().toast('A user with this email already exists', 'error');
          return false;
        }

        const sanitizedPhone = sanitizePhone(user.phone);
        if (sanitizedPhone && !isValidPhone(sanitizedPhone)) {
          get().toast('Invalid phone format', 'error');
          return false;
        }

        const newUser: User = {
          id: generateSecureId('user'),
          organization_id: ORG_ID,
          email: sanitizedEmail,
          full_name: sanitizeString(user.full_name).slice(0, 100),
          phone: sanitizedPhone,
          role: user.role,
          is_active: user.is_active !== false,
          created_at: new Date().toISOString(),
        };
        set(s => ({ users: [...s.users, newUser] }));
        secureLog('User created', { userId: newUser.id, role: newUser.role });
        return true;
      },

      updateUser: (id, updates) => {
        const state = get();
        
        if (!canPerformAction(state.currentUser, 'team:edit')) {
          get().toast('You do not have permission to edit users', 'error');
          return;
        }

        set(s => ({
          users: s.users.map(u => u.id === id ? { ...u, ...updates } : u),
        }));
      },

      toast: (message, type = 'success') => {
        // Sanitize toast message
        const sanitizedMessage = sanitizeString(message).slice(0, 500);
        set({ showToast: sanitizedMessage, toastType: type });
        setTimeout(() => set({ showToast: null }), 3000);
      },

      clearToast: () => set({ showToast: null }),

      setSearchQuery: (q) => {
        // Sanitize search query
        set({ searchQuery: sanitizeString(q).slice(0, 200) });
      },

      setShowModal: (modal) => set({ showModal: modal }),

      addSiteVisit: (sv) => {
        const newSv: SiteVisit = { ...sv, id: generateSecureId('sv'), organization_id: 'org-001', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        set(s => ({ siteVisits: [newSv, ...s.siteVisits] }));
        get().addActivity({ lead_id: sv.lead_id, user_id: get().currentUser?.id || '', type: 'site_visit_scheduled', title: 'Site visit scheduled', description: `Visit on ${sv.scheduled_date} at ${sv.scheduled_time}` });
        get().updateLead(sv.lead_id, { status: 'Site Visit Scheduled' });
      },

      updateSiteVisit: (id, updates) => {
        set(s => ({ siteVisits: s.siteVisits.map(sv => sv.id === id ? { ...sv, ...updates, updated_at: new Date().toISOString() } : sv) }));
        if (updates.status === 'completed') {
          const sv = get().siteVisits.find(s => s.id === id);
          if (sv) {
            get().addActivity({ lead_id: sv.lead_id, user_id: get().currentUser?.id || '', type: 'site_visit_completed', title: 'Site visit completed', description: updates.feedback || 'Visit completed' });
            get().updateLead(sv.lead_id, { status: 'Site Visit Done' });
          }
        }
        if (updates.status === 'cancelled' || updates.status === 'no_show') {
          const sv = get().siteVisits.find(s => s.id === id);
          if (sv) get().addActivity({ lead_id: sv.lead_id, user_id: get().currentUser?.id || '', type: 'site_visit_cancelled', title: `Site visit ${updates.status === 'no_show' ? 'no-show' : 'cancelled'}`, description: '' });
        }
      },

      addTemplate: (t) => {
        const newT: MessageTemplate = { ...t, id: generateSecureId('tpl'), organization_id: 'org-001', created_at: new Date().toISOString() };
        set(s => ({ templates: [newT, ...s.templates] }));
      },

      updateTemplate: (id, updates) => {
        set(s => ({ templates: s.templates.map(t => t.id === id ? { ...t, ...updates } : t) }));
      },

      deleteTemplate: (id) => {
        set(s => ({ templates: s.templates.filter(t => t.id !== id) }));
      },

      findDuplicateLeads: (phone, email) => {
        const state = get();
        const normalizedPhone = phone.replace(/[\s\-()]/g, '').slice(-10);
        return state.leads.filter(l => {
          const existingPhone = l.phone.replace(/[\s\-()]/g, '').slice(-10);
          if (normalizedPhone && existingPhone === normalizedPhone) return true;
          if (email && l.email && l.email.toLowerCase() === email.toLowerCase()) return true;
          return false;
        });
      },

      addLeadBulk: (lead) => {
        const state = get();
        const phone = sanitizePhone(lead.phone || '');
        const email = sanitizeEmail(lead.email || '');

        // Duplicate detection
        const duplicates = get().findDuplicateLeads(phone, email);
        if (duplicates.length > 0) {
          return { lead: null, isDuplicate: true };
        }

        // Round-robin assignment
        const agents = state.users.filter(u => u.role === 'sales_agent' && u.is_active);
        const agentCounts = agents.map(a => ({
          agent: a,
          count: state.leads.filter(l => l.assigned_agent_id === a.id).length,
        }));
        agentCounts.sort((a, b) => a.count - b.count);
        const assignedAgent = agentCounts[0]?.agent;

        const newLead: Lead = {
          id: generateSecureId('lead'),
          organization_id: 'org-001',
          full_name: sanitizeString(lead.full_name || 'Unknown').slice(0, 100),
          phone,
          email,
          source: (lead.source as LeadSource) || 'CSV Import',
          property_type: (lead.property_type as PropertyType) || 'Apartment',
          budget_min: sanitizeNumber(lead.budget_min, 0, 100000000000),
          budget_max: sanitizeNumber(lead.budget_max, 0, 100000000000),
          preferred_location: sanitizeString(lead.preferred_location || '').slice(0, 200),
          status: 'New',
          temperature: (lead.temperature as LeadTemperature) || 'Warm',
          assigned_agent_id: assignedAgent?.id || '',
          notes: sanitizeString(lead.notes || '').slice(0, 5000),
          next_followup: null,
          last_contacted: null,
          consent_given: true,
          consent_timestamp: new Date().toISOString(),
          tags: lead.tags || [],
          score: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set(s => ({ leads: [newLead, ...s.leads] }));
        return { lead: newLead, isDuplicate: false };
      },

      ingestWebhookLead: (payload, webhookSecret) => {
        const state = get();
        
        // Verify webhook secret in production
        if (webhookSecret && webhookSecret !== state.integrationSettings.webhook_secret) {
          secureLog('Invalid webhook secret attempted');
          return null;
        }

        // Rate limiting for webhook
        if (!checkRateLimit('webhook', 100, 60000)) {
          secureLog('Webhook rate limited');
          return null;
        }

        // Validate required fields
        if (!payload || typeof payload !== 'object') {
          secureLog('Invalid webhook payload');
          return null;
        }

        const agents = state.users.filter(u => u.role === 'sales_agent' && u.is_active);
        if (agents.length === 0) {
          secureLog('No active agents for lead assignment');
          return null;
        }

        // Round-robin assignment
        const agentLeadCounts = agents.map(a => ({
          agent: a,
          count: state.leads.filter(l => l.assigned_agent_id === a.id).length,
        }));
        agentLeadCounts.sort((a, b) => a.count - b.count);
        const assignedAgent = agentLeadCounts[0]?.agent;

        // Create lead with sanitized data
        const newLead: Lead = {
          id: generateSecureId('lead'),
          organization_id: ORG_ID,
          full_name: sanitizeString(payload.fullName || 'Unknown').slice(0, 100),
          phone: sanitizePhone(payload.phone || ''),
          email: sanitizeEmail(payload.email || ''),
          source: isValidOption(payload.source, VALID_SOURCES) ? payload.source : 'Other',
          property_type: isValidOption(payload.propertyType, VALID_PROPERTY_TYPES) ? payload.propertyType : 'Apartment',
          budget_min: sanitizeNumber(payload.budgetMin, 0, 100000000000),
          budget_max: sanitizeNumber(payload.budgetMax, 0, 100000000000),
          preferred_location: sanitizeString(payload.preferredLocation || '').slice(0, 200),
          status: 'New',
          temperature: 'Warm',
          assigned_agent_id: assignedAgent?.id || '',
          notes: sanitizeString(payload.notes || '').slice(0, 5000),
          next_followup: null,
          last_contacted: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set(s => ({ leads: [newLead, ...s.leads] }));

        // Notify agent
        state.addNotification({
          user_id: assignedAgent?.id || '',
          title: 'New Lead Assigned',
          message: `${newLead.full_name} from ${newLead.source} has been assigned to you`,
          type: 'lead_assigned',
          read: false,
        });

        // Simulate bridge call
        const callLog: Omit<CallLog, 'id' | 'organization_id' | 'created_at'> = {
          lead_id: newLead.id,
          agent_id: assignedAgent?.id || '',
          call_sid: `CA_DRY_${generateSecureId('')}`,
          conference_sid: `CF_DRY_${generateSecureId('')}`,
          status: 'completed',
          duration: Math.floor(Math.random() * 300) + 60,
          recording_url: '',
          started_at: new Date().toISOString(),
          ended_at: new Date(Date.now() + 180000).toISOString(),
          outcome: 'connected',
        };
        state.addCall(callLog);

        state.addActivity({
          lead_id: newLead.id,
          user_id: assignedAgent?.id || '',
          type: 'call',
          title: 'Bridge call initiated (dry-run)',
          description: `Auto-bridge call triggered for new lead ${newLead.full_name}`,
        });

        secureLog('Webhook lead ingested', { leadId: newLead.id, source: newLead.source });
        return newLead;
      },
    }),
    {
      name: 'estateflow-crm-store',
      version: 5,
      migrate: () => {
        // Any old version gets wiped — fresh seed data
        return {} as any;
      },
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        loginAttempts: state.loginAttempts,
        lockedUntil: state.lockedUntil,
        currentPage: state.isAuthenticated ? state.currentPage : 'login',
        pageParams: state.pageParams,
        leads: state.leads,
        properties: state.properties,
        calls: state.calls,
        followUps: state.followUps,
        siteVisits: state.siteVisits,
        templates: state.templates,
        billingUsage: state.billingUsage,
        attendance: state.attendance,
        socialPosts: state.socialPosts,
        activities: state.activities,
        notifications: state.notifications,
        integrationSettings: state.integrationSettings,
        users: state.users,
      }),
    }
  )
);
