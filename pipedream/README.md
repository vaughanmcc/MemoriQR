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
Handles order confirmation + activation emails, memorial creation emails, and edit verification emails.

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

### Incoming Payload (Edit Verification - MFA)
```json
{
  "type": "edit_verification",
  "customer_email": "customer@example.com",
  "customer_name": "Jane Doe",
  "sender_name": "MemoriQR",
  "reply_to": "memoriqr.global@gmail.com",
  "deceased_name": "Buddy",
  "verification_code": "847293",
  "expires_in": "1 hour",
  "expires_at": "19 Jan 2026, 9:30 am"
}
```

### Incoming Payload (Admin Order Notification - Fulfillment)
```json
{
  "type": "admin_order_notification",
  "order_number": "MQR-12345678",
  "customer_email": "customer@example.com",
  "customer_name": "Jane Doe",
  "deceased_name": "Buddy",
  "product_type": "both",
  "hosting_duration": 10,
  "engraving_text": "In Loving Memory of Buddy",
  "amount_paid": 249,
  "currency": "NZD",
  "activation_code": "12345678",
  "shipping_address": "{\"line1\":\"123 Main St\",\"city\":\"Auckland\",\"postal_code\":\"1010\",\"country\":\"NZ\"}",
  "shipping_name": "Jane Doe"
}
```

### Email Action Configuration
Use these fields from the webhook payload:
- **From Name:** `{{steps.trigger.event.body.sender_name}}`
- **Reply-To:** `{{steps.trigger.event.body.reply_to}}`

### Steps: Route by Email Type

#### Step 1: Route by Type
```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const { type } = steps.trigger.event.body;
    return { type };
  }
});
```

---

### Steps: Edit Verification Email (MFA)

This email is sent when a customer wants to edit their memorial. It contains a 6-digit verification code that expires in 1 hour.

#### Step 2a: Format Edit Verification Email (Node.js)
Add this as a conditional step that runs when `type === 'edit_verification'`:

```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const body = steps.trigger.event.body;
    
    if (body.type !== 'edit_verification') {
      $.flow.exit('Not an edit_verification event');
    }
    
    const { 
      customer_email, 
      customer_name, 
      deceased_name, 
      verification_code, 
      expires_in, 
      expires_at,
      sender_name, 
      reply_to 
    } = body;
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
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
          Your Verification Code 🔐
        </h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 25px;">
          Hi ${customer_name},
        </p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 25px;">
          You requested to edit the memorial for <strong>${deceased_name}</strong>. 
          Please use the verification code below to continue:
        </p>
        
        <!-- Verification Code Box -->
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 0 0 25px;">
          <tr>
            <td style="background-color: #f9f7f4; border: 2px dashed #8B7355; padding: 30px; border-radius: 8px; text-align: center;">
              <p style="color: #666; margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Code</p>
              <p style="color: #333; font-size: 42px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${verification_code}</p>
            </td>
          </tr>
        </table>
        
        <!-- Expiry Warning -->
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 0 0 30px;">
          <tr>
            <td style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                ⏰ This code expires in <strong>${expires_in}</strong> (at ${expires_at})
              </p>
            </td>
          </tr>
        </table>
        
        <p style="color: #777; line-height: 1.6; margin: 0 0 20px; font-size: 14px;">
          If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #f9f7f4; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
        <p style="color: #888; font-size: 12px; margin: 0 0 10px;">
          This is an automated security email from MemoriQR.
        </p>
        <p style="color: #888; font-size: 12px; margin: 0;">
          © 2026 MemoriQR. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const emailText = \`
Hi \${customer_name},

Your verification code to edit the memorial for \${deceased_name} is:

    \${verification_code}

This code expires in \${expires_in} (at \${expires_at}).

If you didn't request this code, please ignore this email.

— The MemoriQR Team
    \`.trim();

    return {
      to: customer_email,
      from_name: sender_name,
      reply_to: reply_to,
      subject: \`Your MemoriQR Verification Code: \${verification_code}\`,
      html: emailHtml,
      text: emailText
    };
  }
});
```

#### Step 3a: Send Email (Gmail Action)
Configure the Gmail/Email action with:
- **To:** `{{steps.format_edit_verification.to}}`
- **From Name:** `{{steps.format_edit_verification.from_name}}`
- **Reply-To:** `{{steps.format_edit_verification.reply_to}}`
- **Subject:** `{{steps.format_edit_verification.subject}}`
- **HTML Body:** `{{steps.format_edit_verification.html}}`

---

### Steps: Admin Order Notification Email (Fulfillment)

#### Step 2c: Format Admin Order Notification (Node.js)
```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const body = steps.trigger.event.body;
    
    if (body.type !== 'admin_order_notification') {
      $.flow.exit('Not an admin_order_notification event');
    }
    
    const { 
      order_number, 
      customer_email, 
      customer_name, 
      deceased_name,
      product_type,
      hosting_duration,
      engraving_text,
      amount_paid,
      currency,
      activation_code,
      shipping_address,
      shipping_name
    } = body;
    
    // Parse shipping address
    let shippingHtml = 'No shipping address provided';
    try {
      const addr = JSON.parse(shipping_address || '{}');
      if (addr.line1) {
        shippingHtml = [
          shipping_name || customer_name,
          addr.line1,
          addr.line2,
          `${addr.city} ${addr.postal_code || ''}`.trim(),
          addr.country
        ].filter(Boolean).join('<br>');
      }
    } catch (e) {
      shippingHtml = shipping_address || 'No address provided';
    }
    
    // Format product type for display
    const productDisplay = {
      'medallion': '🥇 Medallion Only',
      'plaque': '🪧 Plaque Only',
      'both': '🥇🪧 Medallion + Plaque'
    }[product_type] || product_type;
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order - ${order_number}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f0;">
  <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #2d5a27 0%, #3d7a35 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">📦 New Order Received</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 18px; font-weight: bold;">${order_number}</p>
      </td>
    </tr>
    
    <!-- Main Content -->
    <tr>
      <td style="padding: 30px;">
        
        <!-- Order Summary -->
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 0 0 25px; border: 1px solid #ddd; border-radius: 8px;">
          <tr>
            <td colspan="2" style="background-color: #f9f7f4; padding: 15px; border-bottom: 1px solid #ddd; border-radius: 8px 8px 0 0;">
              <strong style="color: #333; font-size: 16px;">Order Summary</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #666; width: 40%;">Product</td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #333; font-weight: 500;">${productDisplay}</td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #666;">Hosting</td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #333;">${hosting_duration} years</td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #666;">Amount Paid</td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #2d5a27; font-weight: bold;">$${amount_paid} ${currency}</td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; color: #666;">Memorial For</td>
            <td style="padding: 12px 15px; color: #333; font-weight: 500;">${deceased_name}</td>
          </tr>
        </table>
        
        <!-- Fulfillment Details -->
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 0 0 25px; border: 2px solid #8B7355; border-radius: 8px;">
          <tr>
            <td colspan="2" style="background-color: #8B7355; padding: 15px; border-radius: 6px 6px 0 0;">
              <strong style="color: #fff; font-size: 16px;">⚙️ Fulfillment Details</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px; border-bottom: 1px solid #eee; color: #666; width: 40%; vertical-align: top;">Activation Code</td>
            <td style="padding: 15px; border-bottom: 1px solid #eee;">
              <code style="background-color: #f0f0f0; padding: 8px 15px; border-radius: 4px; font-size: 18px; font-weight: bold; letter-spacing: 2px;">${activation_code}</code>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px; color: #666; vertical-align: top;">Engraving Text</td>
            <td style="padding: 15px;">
              <div style="background-color: #fffbf0; border: 1px dashed #d4a853; padding: 15px; border-radius: 4px; font-style: italic; color: #333;">
                ${engraving_text || '<em style="color: #999;">No engraving requested</em>'}
              </div>
            </td>
          </tr>
        </table>
        
        <!-- Customer & Shipping -->
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 0 0 25px;">
          <tr>
            <td style="width: 48%; vertical-align: top;">
              <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="border: 1px solid #ddd; border-radius: 8px;">
                <tr>
                  <td style="background-color: #f9f7f4; padding: 12px; border-bottom: 1px solid #ddd; border-radius: 8px 8px 0 0;">
                    <strong style="color: #333; font-size: 14px;">👤 Customer</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; color: #333; line-height: 1.6;">
                    ${customer_name}<br>
                    <a href="mailto:${customer_email}" style="color: #8B7355;">${customer_email}</a>
                  </td>
                </tr>
              </table>
            </td>
            <td style="width: 4%;"></td>
            <td style="width: 48%; vertical-align: top;">
              <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="border: 1px solid #ddd; border-radius: 8px;">
                <tr>
                  <td style="background-color: #f9f7f4; padding: 12px; border-bottom: 1px solid #ddd; border-radius: 8px 8px 0 0;">
                    <strong style="color: #333; font-size: 14px;">📍 Ship To</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; color: #333; line-height: 1.6;">
                    ${shippingHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Action Checklist -->
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 0 0 20px; background-color: #f0f8ff; border: 1px solid #b8d4f0; border-radius: 8px;">
          <tr>
            <td style="padding: 20px;">
              <strong style="color: #333; font-size: 14px; display: block; margin-bottom: 12px;">📋 Action Checklist:</strong>
              <p style="margin: 0 0 8px; color: #555; font-size: 14px;">☐ Code NFC tag with activation code: <strong>${activation_code}</strong></p>
              ${engraving_text ? `<p style="margin: 0 0 8px; color: #555; font-size: 14px;">☐ Request engraving: <strong>"${engraving_text}"</strong></p>` : ''}
              <p style="margin: 0; color: #555; font-size: 14px;">☐ Pack and ship to address above</p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #f9f7f4; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
        <p style="color: #888; font-size: 12px; margin: 0;">
          This is an internal order notification. Do not reply to this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const emailText = `
NEW ORDER: ${order_number}

PRODUCT: ${productDisplay}
HOSTING: ${hosting_duration} years
AMOUNT: $${amount_paid} ${currency}
MEMORIAL FOR: ${deceased_name}

ACTIVATION CODE: ${activation_code}
ENGRAVING: ${engraving_text || 'None'}

CUSTOMER:
${customer_name}
${customer_email}

SHIP TO:
${shippingHtml.replace(/<br>/g, '\\n')}

ACTION CHECKLIST:
- Code NFC tag with: ${activation_code}
${engraving_text ? `- Request engraving: "${engraving_text}"` : ''}
- Pack and ship
    `.trim();

    return {
      to: 'memoriqr.global@gmail.com',
      from_name: 'MemoriQR Orders',
      reply_to: customer_email,
      subject: `📦 New Order ${order_number} - ${productDisplay} for ${deceased_name}`,
      html: emailHtml,
      text: emailText
    };
  }
});
```

#### Step 3c: Send Email (Gmail Action)
Configure the Gmail/Email action with:
- **To:** `{{steps.format_admin_order.to}}`
- **From Name:** `{{steps.format_admin_order.from_name}}`
- **Reply-To:** `{{steps.format_admin_order.reply_to}}`
- **Subject:** `{{steps.format_admin_order.subject}}`
- **HTML Body:** `{{steps.format_admin_order.html}}`

---

### Steps: Memorial Created Email

#### Step 2b: Format Memorial Created Email (Node.js)
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
