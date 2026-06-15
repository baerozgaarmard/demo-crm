// Message Service Adapter - WhatsApp/SMS
// Supports Twilio WhatsApp/SMS and WhatsApp Cloud API

import type { Lead, Property } from '@/types';
import { sanitizeString, checkRateLimit, secureLog, isValidPhone } from '@/utils/security';

const DRY_RUN = true;

export const followUpTemplates = [
  { id: 'fu-1', name: 'Check Interest', text: 'Hi {{leadName}}, just checking if you had a chance to review the property details I shared.' },
  { id: 'fu-2', name: 'Quick Call', text: 'Hi {{leadName}}, are you available for a quick call today to discuss properties in {{preferredLocation}}?' },
  { id: 'fu-3', name: 'New Options', text: 'Hi {{leadName}}, we have a few new options matching your budget. Should I share them?' },
  { id: 'fu-4', name: 'Site Visit', text: 'Hi {{leadName}}, would you like to schedule a site visit for the properties we discussed? We have slots available this weekend.' },
  { id: 'fu-5', name: 'Price Update', text: 'Hi {{leadName}}, great news! There is a special offer on properties in {{preferredLocation}}. Would you like to know more?' },
];

/**
 * Safely fill template with sanitized data
 */
function fillTemplate(template: string, lead: Lead, property?: Property): string {
  if (!template || !lead) return '';
  
  let text = template;
  
  // Sanitize all values before inserting
  const leadName = sanitizeString(lead.full_name?.split(' ')[0] || 'there');
  const location = sanitizeString(lead.preferred_location || (lead.preferred_locations || [])[0] || 'your area');
  
  text = text.replace(/\{\{leadName\}\}/g, leadName);
  text = text.replace(/\{\{preferredLocation\}\}/g, location);
  
  if (property) {
    text = text.replace(/\{\{propertyTitle\}\}/g, sanitizeString(property.title || ''));
    text = text.replace(/\{\{location\}\}/g, sanitizeString(property.location || ''));
    text = text.replace(/\{\{price\}\}/g, formatPrice(property.price || 0));
    // Generate secure share link - in production, use signed URLs
    text = text.replace(/\{\{shareLink\}\}/g, `https://estateflow.app/p/${encodeURIComponent(property.id)}`);
  }
  
  return text;
}

/**
 * Format price in Indian format
 */
function formatPrice(price: number): string {
  // Validate input
  if (typeof price !== 'number' || isNaN(price) || price < 0) return '₹0';
  
  // Cap at reasonable maximum
  const safePrice = Math.min(price, 100000000000); // 1000 Cr max
  
  if (safePrice >= 10000000) return `₹${(safePrice / 10000000).toFixed(1)} Cr`;
  if (safePrice >= 100000) return `₹${(safePrice / 100000).toFixed(1)} L`;
  return `₹${safePrice.toLocaleString('en-IN')}`;
}

export const messageService = {
  /**
   * Send WhatsApp message to lead
   */
  async sendWhatsApp(
    lead: Lead, 
    template: string, 
    property?: Property
  ): Promise<{ success: boolean; message: string }> {
    // Rate limiting
    if (!checkRateLimit('sendWhatsApp', 50, 60000)) {
      return { success: false, message: 'Too many messages sent. Please wait.' };
    }

    // Validate phone
    if (!lead?.phone || !isValidPhone(lead.phone)) {
      return { success: false, message: 'Invalid phone number' };
    }

    const text = fillTemplate(template, lead, property);
    
    if (!text) {
      return { success: false, message: 'Failed to generate message' };
    }

    if (DRY_RUN) {
      secureLog('WhatsApp message sent (dry-run)', {
        leadId: lead.id,
        propertyId: property?.id,
      });
      console.log(`[DRY-RUN] WhatsApp message sent`);
      return { success: true, message: '[Dry-run] WhatsApp message simulated' };
    }

    // TODO: Production implementation
    // SECURITY: Make API calls server-side only
    // POST /api/messages/whatsapp
    throw new Error('WhatsApp not configured');
  },

  /**
   * Send SMS to lead
   */
  async sendSMS(
    lead: Lead, 
    template: string, 
    property?: Property
  ): Promise<{ success: boolean; message: string }> {
    // Rate limiting
    if (!checkRateLimit('sendSMS', 30, 60000)) {
      return { success: false, message: 'Too many SMS sent. Please wait.' };
    }

    // Validate phone
    if (!lead?.phone || !isValidPhone(lead.phone)) {
      return { success: false, message: 'Invalid phone number' };
    }

    // Text would be used in production
    fillTemplate(template, lead, property);
    
    if (DRY_RUN) {
      secureLog('SMS sent (dry-run)', { leadId: lead.id });
      console.log(`[DRY-RUN] SMS sent`);
      return { success: true, message: '[Dry-run] SMS simulated' };
    }

    throw new Error('SMS not configured');
  },

  /**
   * Share property details via WhatsApp
   */
  async sharePropertyViaWhatsApp(
    lead: Lead, 
    property: Property
  ): Promise<{ success: boolean; message: string }> {
    if (!property?.id) {
      return { success: false, message: 'Invalid property' };
    }

    const template = `Hi {{leadName}}, sharing details of {{propertyTitle}} in {{location}}. Price: {{price}}. Photos and details: {{shareLink}}`;
    return this.sendWhatsApp(lead, template, property);
  },

  /**
   * Get filled template (for preview)
   */
  getFilledTemplate(template: string, lead: Lead, property?: Property): string {
    return fillTemplate(template, lead, property);
  },

  formatPrice,
};
