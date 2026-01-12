# Pipedream Workflows for MemoriQR

This document describes the Pipedream workflows used by MemoriQR.

## Project Details

- **Pipedream Project:** MemoriQR Supabase webhook
- **Account:** vaughanmcc.nz@gmail.com

---

## Workflow 1: Contact Form Handler

**Name:** MemoriQR Contact Form  
**Trigger:** HTTP Webhook  
**Webhook URL:** `https://eo7epxu5aypc0vj.m.pipedream.net` (stored in `PIPEDREAM_WEBHOOK_URL`)

### Purpose
Receives contact form submissions from the website and sends email notifications to the MemoriQR team.

### Incoming Payload
```json
{
  "type": "contact_form",
  "name": "John Smith",
  "email": "john@example.com",
  "subject": "Order Question",
  "message": "I have a question about my order...",
  "submitted_at": "2026-01-12T10:30:00.000Z",
  "source": "memoriqr.co.nz"
}
```

### Steps

#### Step 1: Trigger - HTTP Webhook
- Receives POST requests from the Next.js API (`/api/contact`)

#### Step 2: Send Email (Gmail or SMTP)
Use the code below in a **Node.js** step, or use Pipedream's built-in Gmail/Email action.

**Option A: Using Pipedream's Gmail Action**
1. Add step → Gmail → Send Email
2. Configure:
   - **To:** `info@memoriqr.co.nz`
   - **Subject:** `[MemoriQR Contact] {{steps.trigger.event.body.subject}} - from {{steps.trigger.event.body.name}}`
   - **Body:** Use the template below

**Option B: Node.js Code Step**
```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const { name, email, subject, message, submitted_at } = steps.trigger.event.body;
    
    // Format the email body
    const emailBody = `
New contact form submission from MemoriQR website:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FROM: ${name}
EMAIL: ${email}
SUBJECT: ${subject || 'General Inquiry'}
DATE: ${new Date(submitted_at).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MESSAGE:

${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply directly to this email to respond to the customer.
    `.trim();

    // Return formatted data for the next step (email action)
    return {
      to: 'info@memoriqr.co.nz',
      replyTo: email,
      subject: `[MemoriQR] ${subject || 'Contact Form'} - from ${name}`,
      body: emailBody,
      customerEmail: email,
      customerName: name
    };
  }
});
```

#### Step 3 (Optional): Send Confirmation to Customer
Send an auto-reply to the customer confirming receipt.

```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const { name, email } = steps.trigger.event.body;
    
    return {
      to: email,
      subject: 'We received your message - MemoriQR',
      body: `
Hi ${name},

Thank you for contacting MemoriQR. We've received your message and will get back to you within 24 hours.

If you have an urgent matter, please email us directly at info@memoriqr.co.nz

Warm regards,
The MemoriQR Team

---
MemoriQR - Preserving Memories Forever
https://memoriqr.co.nz
      `.trim()
    };
  }
});
```

---

## Workflow 2: Supabase Webhook Handler (Future)

**Name:** MemoriQR Supabase Webhook WF  
**Purpose:** Handle database events from Supabase (new orders, memorial views, etc.)

### Potential Use Cases
1. **New Order Notification** - Email when a new order is placed
2. **Memorial Published** - Notify customer when their memorial goes live
3. **Renewal Reminder** - Send reminder emails before hosting expires
4. **View Milestone** - Notify when a memorial reaches view milestones

### Supabase Webhook Setup
1. Go to Supabase Dashboard → Database → Webhooks
2. Create webhook pointing to Pipedream endpoint
3. Configure for INSERT/UPDATE on relevant tables

---

## Environment Variables

| Variable | Description | Location |
|----------|-------------|----------|
| `PIPEDREAM_WEBHOOK_URL` | Contact form webhook endpoint | `.env.local`, `.env.production` |

---

## Testing

### Test Contact Form Locally
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Order Question",
    "message": "This is a test message"
  }'
```

### Test Pipedream Webhook Directly
```bash
curl -X POST https://eo7epxu5aypc0vj.m.pipedream.net \
  -H "Content-Type: application/json" \
  -d '{
    "type": "contact_form",
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test",
    "message": "Testing webhook",
    "submitted_at": "2026-01-12T10:00:00Z",
    "source": "memoriqr.co.nz"
  }'
```

---

## Deployment Checklist

- [ ] Verify webhook URL in `.env.local` matches Pipedream trigger
- [ ] Add Gmail account connection in Pipedream
- [ ] Test contact form end-to-end
- [ ] Set up production webhook URL in `.env.production` / Vercel
