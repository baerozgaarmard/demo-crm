# EstateFlow CRM - Real Estate Lead Management System

A production-ready, mobile-first CRM for real estate businesses. Manage leads, instantly call prospects, send property details, track follow-ups, and manage your team.

![EstateFlow CRM](https://img.shields.io/badge/EstateFlow-CRM-6366f1)

## 🚀 Quick Start (Demo Mode)

The app runs in **demo mode** by default with sample data. Just open the app and log in with any demo account:

| Role | Email | Features |
|------|-------|----------|
| Admin | admin@estateflow.com | Full access, team management, integrations |
| Sales Manager | manager@estateflow.com | Lead oversight, agent performance |
| Sales Agent | agent1@estateflow.com | Lead management, calls, follow-ups |
| Sales Agent | agent2@estateflow.com | Lead management, calls, follow-ups |
| Field Executive | field1@estateflow.com | Attendance, site visits |
| Social Media | social@estateflow.com | Content calendar, posts |

**Password:** Any password works in demo mode

---

## 📱 Features Overview

### Lead Management
- ✅ Add leads manually or via webhook
- ✅ Search and filter leads by status, source, temperature
- ✅ One-click calling (Twilio integration)
- ✅ One-click WhatsApp/SMS messaging
- ✅ Property sharing with matching leads
- ✅ Follow-up scheduling and tracking
- ✅ Lead timeline with all activities
- ✅ Hot lead marking
- ✅ Agent assignment (round-robin or manual)

### Property Inventory
- ✅ Property listings with details
- ✅ Photo galleries (placeholder in demo)
- ✅ Matching leads by budget/location/type
- ✅ One-click share to leads
- ✅ Availability tracking

### Automated Calling System
- ✅ Bridge call: System calls agent first, then connects to lead
- ✅ Call logging with duration and outcome
- ✅ Missed call handling with fallback agents
- ✅ Dry-run mode for testing

### Follow-Up System
- ✅ Scheduled follow-ups
- ✅ Multiple channels: Call, WhatsApp, SMS, Email, Site Visit
- ✅ Pre-built templates
- ✅ Snooze and complete actions

### Team Management
- ✅ Role-based access control
- ✅ GPS-based attendance check-in/out
- ✅ Team status dashboard

### Social Media
- ✅ Content calendar
- ✅ Post drafting with AI caption helper
- ✅ Status workflow: Idea → Draft → Scheduled → Published

### Reports
- ✅ Leads by source
- ✅ Leads by status
- ✅ Agent performance
- ✅ Conversion rates

---

## 🔄 How Automatic Lead Generation Works

### The Lead Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     LEAD SOURCES                                │
├─────────────────────────────────────────────────────────────────┤
│  36 Acre  │ MagicBricks │ Housing.com │ Facebook Ads │ Website │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  WEBHOOK API    │
                    │ POST /api/leads │
                    └─────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │     EstateFlow CRM            │
              │  1. Save lead to database     │
              │  2. Assign agent (round-robin)│
              │  3. Create activity log       │
              │  4. Send notification         │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   INSTANT BRIDGE CALL         │
              │  1. Call assigned agent       │
              │  2. Agent presses key         │
              │  3. Call the lead             │
              │  4. Bridge both on conference │
              │  5. Log call result           │
              └───────────────────────────────┘
```

### Step-by-Step Automatic Process

1. **Lead Arrives** - A new lead comes from any source (website form, 36 Acre, Facebook Ads, etc.)

2. **Webhook Receives Data** - External platforms send lead data to your webhook endpoint

3. **Lead is Saved** - The CRM stores the lead with all details

4. **Agent Assignment** - Based on your settings:
   - **Round Robin**: Assigns to agent with fewest leads
   - **Manual**: Admin assigns manually
   - **Least Busy**: Assigns to agent with fewest active leads

5. **Instant Notification** - Assigned agent gets an in-app notification

6. **Bridge Call Initiated** (if enabled):
   - System calls the agent's phone first
   - Agent hears: "New lead from [Source]. Press any key to connect with [Lead Name]"
   - After confirmation, system calls the lead
   - Both calls are bridged into a conference
   - Call is recorded and logged

7. **Activity Logged** - Everything is recorded in the lead's timeline

---

## 🔧 Production Setup

### Prerequisites

- Node.js 18+
- Supabase account (database & auth)
- Twilio account (calls & SMS)
- Vercel account (hosting)
- Optional: Resend account (email)
- Optional: OpenAI account (AI features)

### Step 1: Clone and Install

```bash
git clone <your-repo>
cd estateflow-crm
npm install
```

### Step 2: Environment Variables

Create a `.env` file:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Twilio (for backend/serverless functions)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# WhatsApp
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Email
RESEND_API_KEY=your-resend-key

# OpenAI (optional)
OPENAI_API_KEY=your-openai-key

# Webhook Security
WEBHOOK_SECRET=your-secure-random-string
```

### Step 3: Supabase Database Setup

Run these SQL migrations in Supabase:

```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users/Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'sales_manager', 'sales_agent', 'field_executive', 'social_media_manager')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT NOT NULL,
  property_type TEXT,
  budget_min BIGINT,
  budget_max BIGINT,
  preferred_location TEXT,
  status TEXT DEFAULT 'New',
  temperature TEXT DEFAULT 'Warm',
  assigned_agent_id UUID REFERENCES profiles(id),
  notes TEXT,
  next_followup TIMESTAMPTZ,
  last_contacted TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  property_type TEXT,
  price BIGINT,
  size INTEGER,
  size_unit TEXT DEFAULT 'sq.ft',
  bedrooms INTEGER,
  bathrooms INTEGER,
  floor TEXT,
  furnishing TEXT,
  availability TEXT DEFAULT 'Available',
  description TEXT,
  amenities TEXT[],
  images TEXT[],
  developer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call Logs
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  lead_id UUID REFERENCES leads(id),
  agent_id UUID REFERENCES profiles(id),
  call_sid TEXT,
  conference_sid TEXT,
  status TEXT,
  duration INTEGER DEFAULT 0,
  recording_url TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follow-ups
CREATE TABLE followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  lead_id UUID REFERENCES leads(id),
  agent_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  template TEXT,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  lead_id UUID REFERENCES leads(id),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES profiles(id),
  check_in_time TIMESTAMPTZ NOT NULL,
  check_out_time TIMESTAMPTZ,
  check_in_lat DECIMAL,
  check_in_lng DECIMAL,
  check_out_lat DECIMAL,
  check_out_lng DECIMAL,
  status TEXT DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Posts
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  post_type TEXT NOT NULL,
  caption TEXT,
  media_url TEXT,
  status TEXT DEFAULT 'Draft',
  scheduled_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only see their organization's data)
CREATE POLICY "Users can view own org leads" ON leads
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- Repeat similar policies for other tables...
```

### Step 4: Webhook Endpoint Setup

For production, you need a backend to receive webhooks. Create a Supabase Edge Function or use Vercel Serverless Functions:

**Supabase Edge Function (`supabase/functions/webhook-leads/index.ts`):**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Verify webhook secret
  const secret = req.headers.get('x-webhook-secret')
  if (secret !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const payload = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Get organization (you'd have this from API key or subdomain)
  const orgId = 'your-org-id'

  // Round-robin agent assignment
  const { data: agents } = await supabase
    .from('profiles')
    .select('id')
    .eq('organization_id', orgId)
    .eq('role', 'sales_agent')
    .eq('is_active', true)

  const { data: leadCounts } = await supabase
    .from('leads')
    .select('assigned_agent_id')
    .eq('organization_id', orgId)

  // Find agent with fewest leads
  const agentLeadCounts = agents?.map(a => ({
    id: a.id,
    count: leadCounts?.filter(l => l.assigned_agent_id === a.id).length || 0
  })).sort((a, b) => a.count - b.count)

  const assignedAgentId = agentLeadCounts?.[0]?.id

  // Create lead
  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      organization_id: orgId,
      full_name: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      source: payload.source || 'Website',
      property_type: payload.propertyType,
      budget_min: payload.budgetMin,
      budget_max: payload.budgetMax,
      preferred_location: payload.preferredLocation,
      notes: payload.notes,
      status: 'New',
      temperature: 'Warm',
      assigned_agent_id: assignedAgentId,
    })
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }

  // Create notification for agent
  await supabase.from('notifications').insert({
    organization_id: orgId,
    user_id: assignedAgentId,
    title: 'New Lead Assigned',
    message: `${lead.full_name} from ${lead.source} has been assigned to you`,
    type: 'lead_assigned',
  })

  // Trigger bridge call (call separate function)
  // await triggerBridgeCall(lead, assignedAgentId)

  return new Response(JSON.stringify({ success: true, lead }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### Step 5: Twilio Bridge Call Setup

Create a Twilio bridge call function:

```typescript
// supabase/functions/bridge-call/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import twilio from 'npm:twilio'

serve(async (req) => {
  const { leadId, agentId, agentPhone, leadPhone, leadName, source } = await req.json()
  
  const client = twilio(
    Deno.env.get('TWILIO_ACCOUNT_SID'),
    Deno.env.get('TWILIO_AUTH_TOKEN')
  )

  // Step 1: Call the agent first
  const call = await client.calls.create({
    to: agentPhone,
    from: Deno.env.get('TWILIO_PHONE_NUMBER'),
    url: `https://your-app.com/api/twilio/agent-connect?leadPhone=${encodeURIComponent(leadPhone)}&leadName=${encodeURIComponent(leadName)}&source=${encodeURIComponent(source)}`,
    statusCallback: `https://your-app.com/api/twilio/status?leadId=${leadId}&agentId=${agentId}`,
  })

  return new Response(JSON.stringify({ callSid: call.sid }))
})
```

**TwiML for Agent Connection:**

```typescript
// /api/twilio/agent-connect
export default function handler(req, res) {
  const { leadPhone, leadName, source } = req.query
  
  const twiml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Gather numDigits="1" action="/api/twilio/connect-lead?leadPhone=${leadPhone}">
        <Say>New real estate lead from ${source}. Press any key to connect with ${leadName}.</Say>
      </Gather>
      <Say>No input received. Goodbye.</Say>
    </Response>
  `
  
  res.setHeader('Content-Type', 'text/xml')
  res.send(twiml)
}
```

**TwiML for Connecting Lead:**

```typescript
// /api/twilio/connect-lead
export default function handler(req, res) {
  const { leadPhone } = req.query
  
  const twiml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say>Connecting you now.</Say>
      <Dial callerId="${process.env.TWILIO_PHONE_NUMBER}">
        <Number>${leadPhone}</Number>
      </Dial>
    </Response>
  `
  
  res.setHeader('Content-Type', 'text/xml')
  res.send(twiml)
}
```

---

## 🔌 Integrating Lead Sources

### 1. Website Contact Form

Add this to your website's form submission:

```javascript
async function submitLead(formData) {
  await fetch('https://your-crm.com/api/webhooks/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-secret': 'your-webhook-secret'
    },
    body: JSON.stringify({
      fullName: formData.name,
      phone: formData.phone,
      email: formData.email,
      source: 'Website',
      propertyType: formData.propertyType,
      budgetMin: formData.budgetMin,
      budgetMax: formData.budgetMax,
      preferredLocation: formData.location,
      notes: formData.message
    })
  })
}
```

### 2. Facebook Lead Ads

Use **Zapier** or **Make.com** to connect:

1. Create a Zap: Facebook Lead Ads → Webhook
2. Configure the webhook:
   - URL: `https://your-crm.com/api/webhooks/leads`
   - Method: POST
   - Headers: `x-webhook-secret: your-secret`
   - Body: Map Facebook fields to CRM fields

### 3. 36 Acre / MagicBricks / Housing.com

These portals typically offer:
- **Email forwarding**: Set up email parsing
- **API integration**: Use their API to fetch leads
- **Webhook**: If they support webhooks, configure them

**Email Parsing Example (using Zapier):**

1. Email arrives from 36acre@leads.com
2. Zapier parses the email content
3. Sends to your webhook with extracted data

### 4. Instagram/Google Ads

Use **Facebook Conversions API** or **Google Ads webhook**:

```javascript
// Zapier/Make.com transformation
{
  "fullName": "{{lead.name}}",
  "phone": "{{lead.phone}}",
  "email": "{{lead.email}}",
  "source": "Instagram", // or "Google Ads"
  "notes": "Ad Campaign: {{campaign_name}}"
}
```

### 5. Manual Entry via API

```bash
curl -X POST https://your-crm.com/api/webhooks/leads \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: your-secret" \
  -d '{
    "fullName": "Rahul Sharma",
    "phone": "+919999999999",
    "email": "rahul@example.com",
    "source": "Referral",
    "propertyType": "Apartment",
    "budgetMin": 7500000,
    "budgetMax": 12000000,
    "preferredLocation": "Gurgaon",
    "notes": "Referred by Amit. Looking for 3BHK."
  }'
```

---

## 📞 Twilio Setup Guide

### 1. Create Twilio Account
- Go to [twilio.com](https://twilio.com)
- Sign up and verify your account
- Get a phone number with Voice and SMS capabilities

### 2. Get Credentials
- Account SID: Found on dashboard
- Auth Token: Found on dashboard
- Phone Number: Buy one from Twilio console

### 3. For India
- You need a verified caller ID or Twilio number
- Consider using Twilio's India-specific features
- WhatsApp Business API requires approval

### 4. Configure Webhooks
In Twilio Console:
- Voice URL: `https://your-app.com/api/twilio/voice`
- Status Callback: `https://your-app.com/api/twilio/status`

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
# ... add all env vars
```

### Deploy Supabase Functions

```bash
# Install Supabase CLI
npm i -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy webhook-leads
supabase functions deploy bridge-call
```

---

## 🧪 Testing

### Test Webhook Locally

```bash
# Using curl
curl -X POST http://localhost:5173/api/webhooks/leads \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Lead",
    "phone": "+919876543210",
    "source": "Website"
  }'
```

### Test in Demo Mode

The app includes a function to simulate webhook leads. Open browser console:

```javascript
// Access the store
const store = window.__ZUSTAND_STORE__ // or use React DevTools

// Simulate a webhook lead
store.getState().ingestWebhookLead({
  fullName: "New Test Lead",
  phone: "+919876543210",
  email: "test@example.com",
  source: "Facebook",
  propertyType: "Apartment",
  budgetMin: 5000000,
  budgetMax: 10000000,
  preferredLocation: "Gurgaon",
  notes: "Test lead from webhook"
})
```

---

## 📊 Current Demo Mode vs Production

| Feature | Demo Mode | Production |
|---------|-----------|------------|
| Data Storage | LocalStorage | Supabase PostgreSQL |
| Authentication | Any password works | Supabase Auth |
| Calls | Console logs (dry-run) | Actual Twilio calls |
| WhatsApp | Console logs | Twilio WhatsApp API |
| Email | Console logs | Resend/SMTP |
| Webhooks | In-memory | Real HTTP endpoints |
| AI Captions | Random templates | OpenAI API |

---

## 🛠️ Customization

### Add New Lead Sources

Edit `src/types/index.ts`:

```typescript
export type LeadSource = '36 Acre' | 'MagicBricks' | 'Housing' | 'Facebook' | 'Instagram' | 'Website' | 'Referral' | 'Manual' | 'Google Ads' | 'Your New Source' | 'Other';
```

### Add Custom Follow-up Templates

Edit `src/services/messageService.ts`:

```typescript
export const followUpTemplates = [
  // ... existing templates
  { 
    id: 'fu-custom', 
    name: 'Your Template', 
    text: 'Hi {{leadName}}, your custom message here...' 
  },
];
```

### Modify Agent Assignment Logic

Edit `src/store/index.ts` in the `ingestWebhookLead` function.

---

## 📱 Mobile App

This is a Progressive Web App (PWA). To install on mobile:

1. Open the app in Chrome/Safari
2. Tap "Add to Home Screen"
3. The app works offline and feels native

---

## 🆘 Support

For issues or questions:
1. Check the console for errors
2. Ensure all environment variables are set
3. Test in dry-run mode first
4. Check Twilio logs for call issues

---

## 📄 License

MIT License - Feel free to use for your real estate business!
