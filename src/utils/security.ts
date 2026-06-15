/**
 * Security Utilities for EstateFlow CRM
 * Provides input validation, sanitization, and security helpers
 */

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize string input to prevent XSS attacks
 * Removes or escapes potentially dangerous characters
 */
export function sanitizeString(input: string | undefined | null): string {
  if (!input) return '';
  return input
    .toString()
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Escape special HTML characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Remove potential script injections
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    // Limit length to prevent DoS
    .slice(0, 10000);
}

/**
 * Sanitize HTML for display (more permissive, for rich text)
 */
export function sanitizeHTML(input: string): string {
  if (!input) return '';
  // Remove script tags and event handlers
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Sanitize phone number - only allow digits, +, -, spaces, parentheses
 */
export function sanitizePhone(input: string): string {
  if (!input) return '';
  return input.replace(/[^\d+\-\s()]/g, '').slice(0, 20);
}

/**
 * Sanitize email - basic cleaning
 */
export function sanitizeEmail(input: string): string {
  if (!input) return '';
  return input.toLowerCase().trim().slice(0, 254);
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input: any, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  const num = Number(input);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, Math.floor(num)));
}

// ============================================
// INPUT VALIDATION
// ============================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Indian format primarily)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || phone.length < 10 || phone.length > 15) return false;
  // Allow Indian format: +91 followed by 10 digits, or just 10 digits
  const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$|^\+?[\d\s\-()]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate that a string is not empty after trimming
 */
export function isNotEmpty(value: string | undefined | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

/**
 * Validate string length
 */
export function isValidLength(value: string, min: number, max: number): boolean {
  if (!value) return min === 0;
  const len = value.trim().length;
  return len >= min && len <= max;
}

/**
 * Validate that value is one of allowed options
 */
export function isValidOption<T>(value: T, allowedValues: readonly T[]): boolean {
  return allowedValues.includes(value);
}

/**
 * Validate budget range
 */
export function isValidBudget(min: number, max: number): boolean {
  return min >= 0 && max >= min && max <= 100000000000; // 1000 Cr max
}

// ============================================
// RATE LIMITING (Client-side)
// ============================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple client-side rate limiter
 * Returns true if action is allowed, false if rate limited
 */
export function checkRateLimit(
  action: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const key = action;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Get remaining requests for an action
 */
export function getRateLimitRemaining(action: string, maxRequests: number = 10): number {
  const record = rateLimitMap.get(action);
  if (!record || Date.now() > record.resetTime) return maxRequests;
  return Math.max(0, maxRequests - record.count);
}

// ============================================
// SECURE DATA HANDLING
// ============================================

/**
 * Mask sensitive data for display
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return phone;
  const visible = 4;
  return phone.slice(0, 3) + '*'.repeat(phone.length - visible - 3) + phone.slice(-visible);
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return email;
  return local[0] + '*'.repeat(Math.min(local.length - 2, 5)) + local.slice(-1) + '@' + domain;
}

/**
 * Generate secure random ID
 */
export function generateSecureId(prefix: string = ''): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const hex = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  return prefix ? `${prefix}-${hex.slice(0, 16)}` : hex.slice(0, 16);
}

// ============================================
// AUTHORIZATION HELPERS
// ============================================

import type { UserRole, User } from '@/types';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 110,
  admin: 100,
  sales_manager: 80,
  sales_agent: 50,
  field_executive: 40,
  social_media_manager: 30,
};

/**
 * Check if user has required role level or higher
 */
export function hasRoleLevel(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can perform action
 */
export function canPerformAction(user: User | null, action: string): boolean {
  if (!user) return false;

  const permissions: Record<string, UserRole[]> = {
    // Lead actions
    'lead:create': ['owner', 'admin', 'sales_manager', 'sales_agent'],
    'lead:view': ['owner', 'admin', 'sales_manager', 'sales_agent', 'field_executive'],
    'lead:edit': ['owner', 'admin', 'sales_manager', 'sales_agent'],
    'lead:delete': ['owner', 'admin', 'sales_manager'],
    'lead:assign': ['owner', 'admin', 'sales_manager'],
    
    // Property actions
    'property:create': ['owner', 'admin', 'sales_manager'],
    'property:view': ['owner', 'admin', 'sales_manager', 'sales_agent', 'field_executive'],
    'property:edit': ['owner', 'admin', 'sales_manager'],
    'property:delete': ['owner', 'admin'],
    
    // Team actions
    'team:view': ['owner', 'admin', 'sales_manager', 'sales_agent', 'field_executive', 'social_media_manager'],
    'team:add': ['owner', 'admin'],
    'team:edit': ['owner', 'admin'],
    'team:delete': ['owner', 'admin'],
    
    // Settings
    'settings:integrations': ['owner', 'admin'],
    'settings:webhook': ['owner', 'admin'],
    
    // Reports
    'reports:view': ['owner', 'admin', 'sales_manager'],
    'reports:export': ['owner', 'admin'],
    
    // Social media
    'social:create': ['owner', 'admin', 'social_media_manager'],
    'social:edit': ['owner', 'admin', 'social_media_manager'],
    'social:delete': ['owner', 'admin', 'social_media_manager'],
    
    // Attendance
    'attendance:checkin': ['owner', 'admin', 'sales_manager', 'sales_agent', 'field_executive', 'social_media_manager'],
    'attendance:view_all': ['owner', 'admin', 'sales_manager'],
    
    // Compliance & Billing
    'compliance:view': ['owner', 'admin'],
    'billing:view': ['owner', 'admin'],
    'audit:view': ['owner', 'admin'],
  };

  const allowedRoles = permissions[action];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(user.role);
}

/**
 * Check if user can access specific lead
 */
export function canAccessLead(user: User | null, leadAgentId: string): boolean {
  if (!user) return false;
  // Admins and managers can access all leads
  if (user.role === 'admin' || user.role === 'sales_manager') return true;
  // Agents can only access their assigned leads
  return user.id === leadAgentId;
}

// ============================================
// SECURE LOGGING (No sensitive data)
// ============================================

/**
 * Safe log that removes sensitive data
 */
export function secureLog(message: string, data?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'production') return;
  
  const sanitizedData = data ? { ...data } : {};
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
  
  const removeSensitive = (obj: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.some(f => key.toLowerCase().includes(f))) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        result[key] = removeSensitive(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  };
  
  console.log(`[EstateFlow] ${message}`, removeSensitive(sanitizedData));
}

// ============================================
// SESSION SECURITY
// ============================================

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
let lastActivityTime = Date.now();

/**
 * Update last activity timestamp
 */
export function updateActivity(): void {
  lastActivityTime = Date.now();
}

/**
 * Check if session has timed out
 */
export function isSessionExpired(): boolean {
  return Date.now() - lastActivityTime > SESSION_TIMEOUT_MS;
}

/**
 * Get remaining session time in ms
 */
export function getSessionTimeRemaining(): number {
  return Math.max(0, SESSION_TIMEOUT_MS - (Date.now() - lastActivityTime));
}
