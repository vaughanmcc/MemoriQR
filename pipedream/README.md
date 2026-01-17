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

## Workflow 2: Transactional Emails (Orders + Activation)

**Name:** MemoriQR Transactional Emails  
**Trigger:** HTTP Webhook (same `PIPEDREAM_WEBHOOK_URL`)  

### Purpose
Handles order confirmation + activation emails and memorial creation emails.

### Incoming Payload (Order Confirmation)
```json
{
  "type": "order_confirmation",
  "order_number": "MQR-12345678",
  "customer_email": "customer@example.com",
  "customer_name": "Jane Doe",
  "sender_name": "MemoriQR",
  "reply_to": "memoriqr.global@gmail.com",
  "deceased_name": "Buddy",
  "memorial_slug": "buddy-2026-xyz",
  "product_type": "both",
  "hosting_duration": 10,
  "amount_paid": 249,
  "currency": "NZD",
  "activation_url": "https://app.memoriqr.com/activate/ABC12345"
}
```

### Incoming Payload (Memorial Created)
```json
{
  "type": "memorial_created",
  "email": "customer@example.com",
  "sender_name": "MemoriQR",
  "reply_to": "memoriqr.global@gmail.com",
  "memorialName": "Buddy",
  "memorialUrl": "https://app.memoriqr.com/memorial/buddy-2026-xyz",
  "editUrl": "https://app.memoriqr.com/memorial/edit?token=...",
  "qrCodeUrl": "https://app.memoriqr.com/api/qr/buddy-2026-xyz"
}
```

### Email Action Configuration
Use these fields from the webhook payload:
- **From Name:** `{{steps.trigger.event.body.sender_name}}`
- **Reply-To:** `{{steps.trigger.event.body.reply_to}}`

### Steps: Memorial Created Email

#### Step 1: Route by Type
```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const { type } = steps.trigger.event.body;
    return { type };
  }
});
```

#### Step 2: Format Memorial Created Email (Node.js)
```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const body = steps.trigger.event.body;
    
    if (body.type !== 'memorial_created') {
      $.flow.exit('Not a memorial_created event');
    }
    
    const { email, memorialName, memorialUrl, editUrl, qrCodeUrl, sender_name, reply_to } = body;
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Memorial for ${memorialName} is Live</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f0;">
  <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">MemoriQR</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Preserving Memories Forever</p>
      </td>
    </tr>
    
    <!-- Main Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #333; margin: 0 0 20px; font-size: 24px; font-weight: 400;">
          Your Memorial for ${memorialName} is Now Live! 🕊️
        </h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 25px;">
          We're honoured to let you know that the memorial page for <strong>${memorialName}</strong> has been successfully created and is now live.
        </p>
        
        <!-- Memorial Link Box -->
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 0 0 25px;">
          <tr>
            <td style="background-color: #f9f7f4; border-left: 4px solid #8B7355; padding: 20px; border-radius: 4px;">
              <p style="color: #666; margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Memorial Page</p>
              <a href="${memorialUrl}" style="color: #8B7355; font-size: 16px; text-decoration: none; word-break: break-all;">${memorialUrl}</a>
            </td>
          </tr>
        </table>
        
        <!-- CTA Button -->
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 0 0 30px;">
          <tr>
            <td style="text-align: center;">
              <a href="${memorialUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 500;">
                View Memorial Page
              </a>
            </td>
          </tr>
        </table>
        
        <!-- QR Code Section -->
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 0 0 30px; border: 1px solid #e5e5e5; border-radius: 8px;">
          <tr>
            <td style="padding: 25px; text-align: center;">
              <h3 style="color: #333; margin: 0 0 15px; font-size: 18px; font-weight: 500;">Your QR Code</h3>
              <img src="${qrCodeUrl}" alt="QR Code for ${memorialName}" style="width: 180px; height: 180px; margin: 0 auto 15px; display: block;">
              <p style="color: #777; font-size: 13px; margin: 0 0 15px; line-height: 1.5;">
                Scan this QR code with any smartphone camera<br>to visit the memorial page instantly.
              </p>
              <a href="${qrCodeUrl}" style="color: #8B7355; font-size: 14px; text-decoration: underline;">View QR Code</a>
            </td>
          </tr>
        </table>
        
        <!-- Edit Section -->
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 0 0 30px; background-color: #fefcf9; border-radius: 8px;">
          <tr>
            <td style="padding: 25px;">
              <h3 style="color: #333; margin: 0 0 12px; font-size: 18px; font-weight: 500;">✏️ Need to Make Changes?</h3>
              <p style="color: #555; line-height: 1.6; margin: 0 0 15px; font-size: 14px;">
                You can update photos, change the theme, add videos, or edit text at any time using your private edit link:
              </p>
              <a href="${editUrl}" style="display: inline-block; background-color: #fff; border: 2px solid #8B7355; color: #8B7355; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 14px; font-weight: 500;">
                Edit Memorial
              </a>
              <p style="color: #999; font-size: 12px; margin: 15px 0 0;">
                ⚠️ Keep this link private - anyone with it can edit the memorial.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- What's Included -->
        <h3 style="color: #333; margin: 0 0 15px; font-size: 18px; font-weight: 500;">What You Can Do</h3>
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 0 0 25px;">
          <tr>
            <td style="padding: 8px 0; color: #555; font-size: 14px; line-height: 1.5;">
              ✓ Share the memorial link with family and friends
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555; font-size: 14px; line-height: 1.5;">
              ✓ Print the QR code for display at a service or gravesite
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555; font-size: 14px; line-height: 1.5;">
              ✓ Add more photos or videos anytime
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555; font-size: 14px; line-height: 1.5;">
              ✓ Change themes and frames to personalise the look
            </td>
          </tr>
        </table>
        
        <p style="color: #555; line-height: 1.6; margin: 0;">
          If you have any questions, just reply to this email and we'll be happy to help.
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #f5f5f0; padding: 25px 30px; text-align: center;">
        <p style="color: #888; font-size: 13px; margin: 0 0 10px;">
          With deepest sympathy,<br>
          <strong style="color: #8B7355;">The MemoriQR Team</strong>
        </p>
        <p style="color: #aaa; font-size: 12px; margin: 0;">
          MemoriQR - Preserving Memories Forever<br>
          <a href="https://memoriqr.co.nz" style="color: #8B7355; text-decoration: none;">memoriqr.co.nz</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
    
    const emailText = \`
Your Memorial for \${memorialName} is Now Live!

We're honoured to let you know that the memorial page for \${memorialName} has been successfully created and is now live.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MEMORIAL PAGE:
\${memorialUrl}

QR CODE (download):
\${qrCodeUrl}

EDIT MEMORIAL:
\${editUrl}
(Keep this link private - anyone with it can edit the memorial)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT YOU CAN DO:
• Share the memorial link with family and friends
• Print the QR code for display at a service or gravesite
• Add more photos or videos anytime
• Change themes and frames to personalise the look

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If you have any questions, just reply to this email and we'll be happy to help.

With deepest sympathy,
The MemoriQR Team

MemoriQR - Preserving Memories Forever
https://memoriqr.co.nz
    \`.trim();

    return {
      to: email,
      from_name: sender_name || 'MemoriQR',
      reply_to: reply_to || 'memoriqr.global@gmail.com',
      subject: \`Your memorial for \${memorialName} is now live 🕊️\`,
      html: emailHtml,
      text: emailText
    };
  }
});
```

#### Step 3: Send Email (Gmail/SendGrid)
Use Pipedream's Gmail or SendGrid action:
- **To:** `{{steps.format_email.to}}`
- **From Name:** `{{steps.format_email.from_name}}`
- **Reply-To:** `{{steps.format_email.reply_to}}`
- **Subject:** `{{steps.format_email.subject}}`
- **HTML Body:** `{{steps.format_email.html}}`
- **Text Body:** `{{steps.format_email.text}}`

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
