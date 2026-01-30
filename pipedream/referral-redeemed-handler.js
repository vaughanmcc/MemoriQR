/**
 * Pipedream Email Handler - Referral Redeemed
 * 
 * This is a standalone handler for referral redemption emails.
 * Use this in a SEPARATE Pipedream workflow with its own webhook URL.
 * 
 * Last updated: January 30, 2026
 */

export default defineComponent({
  async run({ steps, $ }) {
    // Debug: log what we're receiving
    console.log('Full trigger event:', JSON.stringify(steps.trigger.event, null, 2));
    
    // Pipedream HTTP webhook puts body in steps.trigger.event.body
    // But it could also be directly in the event for some configurations
    const body = steps.trigger.event.body || steps.trigger.event;
    
    console.log('Body object:', JSON.stringify(body, null, 2));
    console.log('Type:', body?.type);
    
    if (!body || body.type !== 'referral_redeemed') {
      $.flow.exit(`Not a referral_redeemed event: ${body?.type}`);
    }
    
    const { 
      to, 
      businessName, 
      referralCode, 
      orderNumber, 
      discountPercent,
      commissionAmount,
      orderTotal,
      optOutUrl,
      dashboardUrl,
      hasBankingDetails,
      settingsUrl
    } = body;

    // Build discount row conditionally (must be computed before the template string)
    const discountRowHtml = discountPercent > 0 
      ? `<tr><td style="padding: 12px 20px; color: #6b7280; font-size: 14px;">Customer Discount:</td><td style="padding: 12px 20px; color: #111827; font-size: 14px; font-weight: 600;">${discountPercent}%</td></tr>`
      : '';
    
    const discountRowText = discountPercent > 0 
      ? `- Customer Discount: ${discountPercent}%\n` 
      : '';

    // Banking reminder block - only shown if hasBankingDetails is false
    const bankingReminderHtml = hasBankingDetails === false ? `
<div style="margin: 0 0 25px; background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px;">
<p style="color: #92400e; font-weight: bold; margin: 0 0 10px;">⚠️ Banking Details Required</p>
<p style="color: #78350f; margin: 0; line-height: 1.5;">To receive commission payouts, please add your banking details in the Partner Portal.</p>
<div style="text-align: center; margin-top: 15px;">
<a href="${settingsUrl}" style="display: inline-block; background-color: #f59e0b; color: #fff; text-decoration: none; padding: 10px 25px; border-radius: 6px; font-size: 14px; font-weight: 600;">Add Banking Details</a>
</div>
</div>
` : '';

    const bankingReminderText = hasBankingDetails === false 
      ? `\n⚠️ BANKING DETAILS REQUIRED\nTo receive commission payouts, please add your banking details: ${settingsUrl}\n` 
      : '';

    return {
      to: to,
      replyTo: 'partners@memoriqr.co.nz',
      from_name: 'MemoriQR Partner Program',
      subject: `🎉 Referral Code ${referralCode} Redeemed - $${commissionAmount} Commission Earned!`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300;">MemoriQR</h1>
<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Partner Program</p>
</div>

<div style="padding: 40px 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<h2 style="color: #333; margin: 0 0 20px; font-size: 24px; font-weight: 400;">Great News! 🎉</h2>

<p style="color: #555; line-height: 1.6; margin: 0 0 25px;">Hi ${businessName},</p>

<p style="color: #555; line-height: 1.6; margin: 0 0 25px;">One of your referral codes has just been used to place an order. Here are the details:</p>

<table style="width: 100%; margin: 0 0 25px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; border-collapse: collapse;">
<tr><td style="padding: 12px 20px; color: #6b7280; font-size: 14px; width: 140px; border-bottom: 1px solid #e5e7eb;">Referral Code:</td><td style="padding: 12px 20px; color: #111827; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${referralCode}</td></tr>
<tr><td style="padding: 12px 20px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Order Number:</td><td style="padding: 12px 20px; color: #111827; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${orderNumber}</td></tr>
<tr><td style="padding: 12px 20px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Order Total:</td><td style="padding: 12px 20px; color: #111827; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">$${orderTotal} NZD</td></tr>
${discountRowHtml}
</table>

<div style="margin: 0 0 25px; background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 25px; text-align: center;">
<p style="color: #059669; margin: 0 0 5px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Commission</p>
<p style="color: #047857; font-size: 36px; font-weight: bold; margin: 0;">$${commissionAmount}</p>
<p style="color: #6b7280; margin: 10px 0 0; font-size: 12px;">Status: Pending</p>
</div>

${bankingReminderHtml}

<p style="color: #555; line-height: 1.6; margin: 0 0 25px;">Your commission will be added to your next payout. You can view all your commissions and referral activity in your Partner Dashboard.</p>

<div style="text-align: center; margin: 0 0 30px;">
<a href="${dashboardUrl}" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">View Partner Dashboard</a>
</div>
</div>

<div style="background: #f5f5f0; padding: 25px 30px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0 0 10px;">You're receiving this because you're a MemoriQR Partner.</p>
<p style="color: #888; font-size: 12px; margin: 0 0 10px;"><a href="${optOutUrl}" style="color: #059669; text-decoration: underline;">Unsubscribe from redemption notifications</a></p>
<p style="color: #888; font-size: 12px; margin: 0;">© 2026 MemoriQR. All rights reserved.</p>
</div>
</div>`,
      text: `Hi ${businessName},\n\nGreat news! One of your referral codes has just been used.\n\nDETAILS:\n- Referral Code: ${referralCode}\n- Order Number: ${orderNumber}\n- Order Total: $${orderTotal} NZD\n${discountRowText}${bankingReminderText}\nYOUR COMMISSION: $${commissionAmount}\nStatus: Pending\n\nYour commission will be added to your next payout.\n\nView your Partner Dashboard: ${dashboardUrl}\n\n---\nTo stop receiving these notifications: ${optOutUrl}\n\n© 2026 MemoriQR. All rights reserved.`
    };
  }
});