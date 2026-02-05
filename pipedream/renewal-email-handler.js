// MemoriQR Renewal Emails - Pipedream Workflow Handler
// Webhook URL: https://eo88prg1g5dm60a.m.pipedream.net
// Env Var: PIPEDREAM_RENEWAL_WEBHOOK_URL
//
// Handles:
// - expiry_reminder (90/30/7 days, grace period)
// - renewal_confirmation (after successful payment)

export default defineComponent({
  async run({ steps, $ }) {
    const body = steps.trigger.event.body;
    const type = body.type;

    // Expiry reminder emails (sent by daily cron)
    if (type === 'expiry_reminder') {
      const { 
        reminder_type, 
        to, 
        customer_name, 
        deceased_name, 
        memorial_url, 
        renew_url, 
        days_until_expiry, 
        is_grace_period, 
        grace_days_remaining 
      } = body;

      // Different subject/urgency based on reminder type
      let subject, urgencyColor, urgencyText, ctaText;
      
      switch (reminder_type) {
        case '90_days':
          subject = `Your memorial for ${deceased_name} will expire in 90 days`;
          urgencyColor = '#4a7c59'; // green - no rush
          urgencyText = 'Coming up in 90 days';
          ctaText = 'You have plenty of time, but you can renew early if you\'d like.';
          break;
        case '30_days':
          subject = `Reminder: ${deceased_name}'s memorial hosting expires soon`;
          urgencyColor = '#f0ad4e'; // yellow - attention
          urgencyText = 'Expires in 30 days';
          ctaText = 'We recommend renewing soon to ensure continuous access to the memorial.';
          break;
        case '7_days':
          subject = `Urgent: ${deceased_name}'s memorial expires in 7 days`;
          urgencyColor = '#e74c3c'; // red - urgent
          urgencyText = 'Only 7 days remaining';
          ctaText = 'Please renew now to avoid interruption to the memorial.';
          break;
        case 'grace_period':
          subject = `Action Required: ${deceased_name}'s memorial has expired`;
          urgencyColor = '#8b0000'; // dark red - critical
          urgencyText = `Grace period: ${grace_days_remaining} days left`;
          ctaText = `The memorial is still accessible during the ${grace_days_remaining}-day grace period. Renew now to prevent permanent removal.`;
          break;
        default:
          subject = `${deceased_name}'s memorial hosting reminder`;
          urgencyColor = '#4a7c59';
          urgencyText = '';
          ctaText = '';
      }

      const daysText = is_grace_period 
        ? `The memorial expired ${Math.abs(days_until_expiry)} days ago but is still viewable during the 30-day grace period.`
        : `The memorial will expire in ${days_until_expiry} days.`;

      return {
        to: to,
        replyTo: 'support@memoriqr.co.nz',
        from_name: 'MemoriQR',
        subject: subject,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, ${urgencyColor} 0%, ${urgencyColor}dd 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 22px;">Memorial Hosting ${is_grace_period ? 'Expired' : 'Reminder'}</h1>
${urgencyText ? `<p style="color: #fff; margin: 10px 0 0 0; font-size: 14px;">${urgencyText}</p>` : ''}
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${customer_name},</p>

<p style="color: #555; line-height: 1.6;">${daysText}</p>

<div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
<p style="color: #666; margin: 0 0 5px 0; font-size: 14px;">Memorial for</p>
<p style="color: #333; margin: 0; font-size: 20px; font-weight: bold;">${deceased_name}</p>
</div>

<p style="color: #555; line-height: 1.6;">${ctaText}</p>

<div style="text-align: center; margin: 30px 0;">
<a href="${renew_url}" style="display: inline-block; background: ${urgencyColor}; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Renew Now - $${is_grace_period ? '35' : '25'}/year</a>
</div>

<p style="color: #666; font-size: 14px; text-align: center;">
<a href="${memorial_url}" style="color: ${urgencyColor};">View Memorial →</a>
</p>

<p style="color: #555; margin-top: 25px;">Thank you for choosing MemoriQR to honour ${deceased_name}'s memory.</p>

<p style="color: #555;">Warm regards,<br><strong>The MemoriQR Team</strong></p>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">Questions? Reply to this email or visit <a href="https://memoriqr.co.nz" style="color: #4a7c59;">memoriqr.co.nz</a></p>
</div>
</div>`,
        text: `Hi ${customer_name},\n\n${daysText}\n\nMemorial for: ${deceased_name}\n\n${ctaText}\n\nRenew now: ${renew_url}\nView memorial: ${memorial_url}\n\nThank you for choosing MemoriQR to honour ${deceased_name}'s memory.\n\nWarm regards,\nThe MemoriQR Team`
      };
    }

    // Renewal confirmation (sent after successful payment)
    if (type === 'renewal_confirmation') {
      const { 
        customer_email, 
        customer_name, 
        deceased_name, 
        memorial_url, 
        extension_type, 
        is_lifetime, 
        new_expires_at, 
        amount_paid, 
        currency 
      } = body;

      const expiryDate = new Date(new_expires_at).toLocaleDateString('en-NZ', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      
      const extensionLabel = is_lifetime ? 'Lifetime' : extension_type === '5_year' ? '5 years' : '1 year';
      const currencySymbol = currency === 'NZD' ? '$' : currency;

      return {
        to: customer_email,
        replyTo: 'support@memoriqr.co.nz',
        from_name: 'MemoriQR',
        subject: `Memorial renewed for ${deceased_name}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #4a7c59 0%, #3d6b4a 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 22px;">✓ Renewal Confirmed</h1>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${customer_name},</p>

<p style="color: #555; line-height: 1.6;">Thank you for renewing the memorial for <strong>${deceased_name}</strong>. Your payment has been processed successfully.</p>

<div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 25px 0;">
<table style="width: 100%; border-collapse: collapse;">
<tr>
<td style="padding: 8px 0; color: #666;">Extension:</td>
<td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">${extensionLabel}</td>
</tr>
<tr>
<td style="padding: 8px 0; color: #666;">${is_lifetime ? 'Status:' : 'New expiry date:'}</td>
<td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">${is_lifetime ? 'Lifetime hosting - never expires' : expiryDate}</td>
</tr>
<tr>
<td style="padding: 8px 0; color: #666; border-top: 1px solid #ddd;">Amount paid:</td>
<td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right; border-top: 1px solid #ddd;">${currencySymbol}${amount_paid.toFixed(2)}</td>
</tr>
</table>
</div>

<div style="text-align: center; margin: 30px 0;">
<a href="${memorial_url}" style="display: inline-block; background: #4a7c59; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">View Memorial</a>
</div>

<p style="color: #555; line-height: 1.6;">Thank you for continuing to honour ${deceased_name}'s memory with MemoriQR.</p>

<p style="color: #555;">Warm regards,<br><strong>The MemoriQR Team</strong></p>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">This is your receipt. Questions? Reply to this email.</p>
</div>
</div>`,
        text: `Hi ${customer_name},\n\nThank you for renewing the memorial for ${deceased_name}. Your payment has been processed successfully.\n\nExtension: ${extensionLabel}\n${is_lifetime ? 'Status: Lifetime hosting - never expires' : `New expiry date: ${expiryDate}`}\nAmount paid: ${currencySymbol}${amount_paid.toFixed(2)}\n\nView memorial: ${memorial_url}\n\nThank you for continuing to honour ${deceased_name}'s memory with MemoriQR.\n\nWarm regards,\nThe MemoriQR Team`
      };
    }

    // Unknown type
    $.flow.exit(`Unknown type: ${type}`);
  }
});
