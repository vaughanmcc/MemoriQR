/**
 * Security Change Email Handler
 * 
 * Pipedream workflow for notifying partners when sensitive account details are changed.
 * Sends to the ORIGINAL email address to alert them of the change.
 * 
 * Webhook URL: Store in PIPEDREAM_SECURITY_WEBHOOK_URL environment variable
 * 
 * Expected payload:
 * {
 *   "type": "security_change",
 *   "to": "original-email@example.com",
 *   "data": {
 *     "partner_name": "John's Shop",
 *     "change_type": "bank_account" | "email" | "payout_email",
 *     "change_description": "Bank account number changed",
 *     "changed_at": "2026-01-28T10:30:00Z",
 *     "ip_address": "192.168.1.1" (optional)
 *   }
 * }
 */

export default defineComponent({
  async run({ steps, $ }) {
    const payload = steps.trigger.event.body;
    
    if (payload.type !== 'security_change') {
      return { skipped: true, reason: 'Not a security_change event' };
    }

    const { to, data } = payload;
    const { partner_name, change_type, change_description, changed_at, ip_address } = data;

    const changeTypeLabels = {
      'bank_account': 'Bank Account Details',
      'email': 'Contact Email Address',
      'payout_email': 'Payout Email Address'
    };

    const changeLabel = changeTypeLabels[change_type] || 'Account Settings';
    const formattedDate = new Date(changed_at).toLocaleString('en-NZ', {
      timeZone: 'Pacific/Auckland',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Alert - Account Change</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; font-size: 18px; line-height: 1.6; color: #333;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">🔐</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Security Alert</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Your account details were changed</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${partner_name},
              </p>
              
              <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 30px 0;">
                We're writing to let you know that your <strong>${changeLabel}</strong> was recently changed on your MemoriQR Partner account.
              </p>
              
              <!-- Change Details Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 30px 0;">
                <tr>
                  <td style="background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 25px;">
                    <div style="color: #991b1b; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px;">
                      Change Details
                    </div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 16px; padding: 5px 0;">What changed:</td>
                        <td style="color: #111827; font-size: 16px; font-weight: 600; padding: 5px 0;">${change_description}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 16px; padding: 5px 0;">When:</td>
                        <td style="color: #111827; font-size: 16px; font-weight: 600; padding: 5px 0;">${formattedDate}</td>
                      </tr>
                      ${ip_address ? `
                      <tr>
                        <td style="color: #6b7280; font-size: 16px; padding: 5px 0;">IP Address:</td>
                        <td style="color: #111827; font-size: 16px; font-weight: 600; padding: 5px 0;">${ip_address}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                <strong>If you made this change:</strong> No action is needed. You can safely ignore this email.
              </p>
              
              <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 30px 0;">
                <strong>If you didn't make this change:</strong> Please contact us immediately at <a href="mailto:support@memoriqr.co.nz" style="color: #dc2626; font-weight: 600;">support@memoriqr.co.nz</a> to secure your account.
              </p>
              
              <!-- Warning Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 30px 0;">
                <tr>
                  <td style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px 20px;">
                    <p style="color: #92400e; font-size: 16px; line-height: 1.5; margin: 0;">
                      <strong>⚠️ Important:</strong> MemoriQR will never ask for your password or full bank account details via email. If you receive a suspicious request, please report it to us.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 15px; line-height: 1.5; margin: 0; text-align: center;">
                This is an automated security notification.<br>
                Contact us at <a href="mailto:support@memoriqr.co.nz" style="color: #059669;">support@memoriqr.co.nz</a> if you have any concerns.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Brand Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px;">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                © ${new Date().getFullYear()} MemoriQR. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const textBody = `
SECURITY ALERT - Account Change

Hi ${partner_name},

Your ${changeLabel} was recently changed on your MemoriQR Partner account.

CHANGE DETAILS:
- What changed: ${change_description}
- When: ${formattedDate}
${ip_address ? `- IP Address: ${ip_address}` : ''}

IF YOU MADE THIS CHANGE:
No action is needed. You can safely ignore this email.

IF YOU DIDN'T MAKE THIS CHANGE:
Please contact us immediately at support@memoriqr.co.nz to secure your account.

---

This is an automated security notification.
MemoriQR will never ask for your password or full bank account details via email.

© ${new Date().getFullYear()} MemoriQR. All rights reserved.
    `.trim();

    return {
      to: to,
      subject: `🔐 Security Alert: ${changeLabel} Changed on Your Account`,
      html: htmlBody,
      text: textBody,
      replyTo: 'support@memoriqr.co.nz'
    };
  }
});
