/**
 * Commission Approved Email Handler
 * 
 * Pipedream workflow for sending email notifications to partners when their commissions are approved.
 * 
 * Webhook URL: Store in PIPEDREAM_COMMISSION_WEBHOOK_URL environment variable
 * 
 * Expected payload:
 * {
 *   "type": "commission_approved",
 *   "to": "partner@example.com",
 *   "data": {
 *     "partner_name": "John's Shop",
 *     "approved_amount": 45.00,
 *     "commission_count": 3,
 *     "dashboard_url": "https://memoriqr.co.nz/partner/commissions"
 *   }
 * }
 */

export default defineComponent({
  async run({ steps, $ }) {
    const payload = steps.trigger.event.body;
    
    if (payload.type !== 'commission_approved') {
      return { skipped: true, reason: 'Not a commission_approved event' };
    }

    const { to, data } = payload;
    const { partner_name, approved_amount, commission_count, dashboard_url } = data;

    const formattedAmount = new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD'
    }).format(approved_amount);

    const commissionText = commission_count === 1 ? 'commission' : 'commissions';

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commission Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; font-size: 18px; line-height: 1.6; color: #333;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Commission Approved!</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${partner_name},
              </p>
              
              <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 30px 0;">
                Great news! Your ${commissionText} ${commission_count === 1 ? 'has' : 'have'} been approved and ${commission_count === 1 ? 'is' : 'are'} ready for payout.
              </p>
              
              <!-- Amount Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 30px 0;">
                <tr>
                  <td style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 25px; text-align: center;">
                    <div style="color: #065f46; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                      Approved Amount
                    </div>
                    <div style="color: #047857; font-size: 36px; font-weight: 700;">
                      ${formattedAmount}
                    </div>
                    <div style="color: #059669; font-size: 16px; margin-top: 8px;">
                      ${commission_count} ${commissionText}
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                This amount will be included in your next scheduled payout. You can view all your commission details in your partner dashboard.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${dashboard_url}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                      View Commission Details
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 15px; line-height: 1.5; margin: 0; text-align: center;">
                Thank you for being a MemoriQR partner!<br>
                Questions? Reply to this email or contact us at <a href="mailto:info@memoriqr.co.nz" style="color: #10b981;">info@memoriqr.co.nz</a>
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
Commission Approved!

Hi ${partner_name},

Great news! Your ${commissionText} ${commission_count === 1 ? 'has' : 'have'} been approved and ${commission_count === 1 ? 'is' : 'are'} ready for payout.

APPROVED AMOUNT: ${formattedAmount}
COMMISSIONS: ${commission_count}

This amount will be included in your next scheduled payout.

View your commission details: ${dashboard_url}

---

Thank you for being a MemoriQR partner!
Questions? Contact us at info@memoriqr.co.nz

© ${new Date().getFullYear()} MemoriQR. All rights reserved.
    `.trim();

    return {
      to: to,
      subject: `✅ Commission Approved - ${formattedAmount} Ready for Payout`,
      html: htmlBody,
      text: textBody,
      replyTo: 'info@memoriqr.co.nz'
    };
  }
});
