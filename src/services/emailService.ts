// Email Service Adapter - Resend or SMTP

import type { Lead, Property } from '@/types';

const DRY_RUN = true;

export const emailService = {
  async sendEmail(
    to: string,
    subject: string,
    _html: string
  ): Promise<{ success: boolean; message: string }> {
    if (DRY_RUN) {
      console.log(`[DRY-RUN] Email to ${to}: ${subject}`);
      return { success: true, message: '[Dry-run] Email simulated' };
    }
    // TODO: Resend API or SMTP
    throw new Error('Email not configured');
  },

  async sendPropertyEmail(lead: Lead, property: Property): Promise<{ success: boolean; message: string }> {
    const subject = `Property Details: ${property.title} in ${property.location}`;
    const html = `
      <h2>${property.title}</h2>
      <p>Location: ${property.location}</p>
      <p>Price: ₹${property.price.toLocaleString('en-IN')}</p>
      <p>Size: ${property.size} ${property.size_unit}</p>
      <p>Bedrooms: ${property.bedrooms} | Bathrooms: ${property.bathrooms}</p>
      <p>${property.description}</p>
      <a href="https://estateflow.app/p/${property.id}">View Full Details</a>
    `;
    return this.sendEmail(lead.email, subject, html);
  },

  async sendFollowUpEmail(lead: Lead, message: string): Promise<{ success: boolean; message: string }> {
    return this.sendEmail(lead.email, 'Following up on your property search', `<p>${message}</p>`);
  },
};
