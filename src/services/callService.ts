// Call Service Adapter - Twilio Voice Integration
// In production, these would make actual Twilio API calls
// In dry-run mode, they simulate the flow

import type { Lead, User } from '@/types';
import { sanitizeString, checkRateLimit, secureLog } from '@/utils/security';

const DRY_RUN = true; // Set to false when Twilio credentials are configured

interface BridgeCallResult {
  success: boolean;
  callSid: string;
  conferenceSid: string;
  status: string;
  message: string;
}

// Secure random ID generator for call SIDs
function generateCallSid(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return 'CA_' + Array.from(array, b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

function generateConferenceSid(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return 'CF_' + Array.from(array, b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

export const callService = {
  /**
   * Initiate a bridge call: First call the agent, then connect to the lead
   * Flow: System -> Agent -> Lead (conference bridge)
   */
  async initiateBridgeCall(agent: User, lead: Lead): Promise<BridgeCallResult> {
    // Rate limiting
    if (!checkRateLimit('bridgeCall', 20, 60000)) {
      return {
        success: false,
        callSid: '',
        conferenceSid: '',
        status: 'rate_limited',
        message: 'Too many call attempts. Please wait.',
      };
    }

    // Input validation
    if (!agent?.phone || !lead?.phone) {
      return {
        success: false,
        callSid: '',
        conferenceSid: '',
        status: 'invalid_input',
        message: 'Missing phone number for agent or lead',
      };
    }

    if (DRY_RUN) {
      // Sanitize data for logging
      const sanitizedAgentName = sanitizeString(agent.full_name);
      const sanitizedLeadName = sanitizeString(lead.full_name);
      const sanitizedSource = sanitizeString(lead.source);
      
      secureLog('Bridge call initiated (dry-run)', {
        agentId: agent.id,
        leadId: lead.id,
        source: sanitizedSource,
      });

      console.log(`[DRY-RUN] Bridge call: Agent ${sanitizedAgentName} -> Lead ${sanitizedLeadName}`);
      console.log(`[DRY-RUN] Step 1: Calling agent`);
      console.log(`[DRY-RUN] Step 2: Playing message "New real estate lead from ${sanitizedSource}. Press any key to connect."`);
      console.log(`[DRY-RUN] Step 3: Calling lead`);
      console.log(`[DRY-RUN] Step 4: Bridging both calls`);

      return {
        success: true,
        callSid: generateCallSid(),
        conferenceSid: generateConferenceSid(),
        status: 'completed',
        message: '[Dry-run] Bridge call simulated successfully',
      };
    }

    // TODO: Production Twilio implementation
    // SECURITY: In production, make API calls server-side only
    // Never expose Twilio credentials to the client
    // Use a secure backend endpoint: POST /api/calls/bridge
    throw new Error('Production Twilio not configured. Set DRY_RUN=false and provide credentials.');
  },

  /**
   * Make a direct call to a lead
   */
  async directCall(agent: User, lead: Lead): Promise<BridgeCallResult> {
    // Rate limiting
    if (!checkRateLimit('directCall', 30, 60000)) {
      return {
        success: false,
        callSid: '',
        conferenceSid: '',
        status: 'rate_limited',
        message: 'Too many call attempts. Please wait.',
      };
    }

    if (DRY_RUN) {
      secureLog('Direct call initiated (dry-run)', {
        agentId: agent.id,
        leadId: lead.id,
      });

      return {
        success: true,
        callSid: generateCallSid(),
        conferenceSid: '',
        status: 'completed',
        message: '[Dry-run] Direct call simulated',
      };
    }
    throw new Error('Production Twilio not configured.');
  },

  /**
   * End an active call
   */
  async endCall(callSid: string): Promise<{ success: boolean; message: string }> {
    // Validate call SID format
    if (!callSid || !callSid.startsWith('CA')) {
      return { success: false, message: 'Invalid call SID' };
    }

    if (DRY_RUN) {
      secureLog('Call ended (dry-run)', { callSid });
      return { success: true, message: '[Dry-run] Call ended' };
    }
    throw new Error('Production Twilio not configured.');
  },
};
