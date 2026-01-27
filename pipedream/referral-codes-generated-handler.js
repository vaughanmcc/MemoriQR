/**
 * Pipedream Email Handler - Referral Codes Generated
 * 
 * This is a standalone handler for notifying partners when referral codes are generated.
 * Use this in a SEPARATE Pipedream workflow with its own webhook URL.
 * 
 * Last updated: January 26, 2026
 */

export default defineComponent({
  async run({ steps, $ }) {
    // Debug: log what we're receiving
    console.log('Full trigger event:', JSON.stringify(steps.trigger.event, null, 2));
    
    const body = steps.trigger.event.body || steps.trigger.event;
    
    console.log('Body object:', JSON.stringify(body, null, 2));
    console.log('Type:', body?.type);
    
    if (!body || body.type !== 'referral_codes_generated') {
      $.flow.exit(`Not a referral_codes_generated event: ${body?.type}`);
    }
    
    const { 
      to, 
      businessName, 
      quantity, 
      codes, 
      totalCodes,
      discountPercent, 
      commissionPercent, 
      freeShipping, 
      expiresAt,
      dashboardUrl 
    } = body;

    const expiryText = expiresAt 
      ? `Valid until ${new Date(expiresAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}`
      : 'No expiry date';
    
    const codesList = codes.join('\n');
    const moreCodesNote = totalCodes > 10 ? `\n... and ${totalCodes - 10} more codes` : '';

    return {
      to: to,
      replyTo: 'partners@memoriqr.co.nz',
      from_name: 'MemoriQR Partner Program',
      subject: `🎴 ${quantity} Referral Codes Generated for ${businessName}`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">🎴 Referral Codes Ready!</h1>
<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Lead Generation Cards</p>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${businessName},</p>
<p style="color: #555; line-height: 1.6;">Great news! <strong>${quantity} referral codes</strong> have been generated for your lead generation cards.</p>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
<tr><td style="padding: 12px 20px; color: #6b7280; font-size: 14px; width: 50%; border-bottom: 1px solid #e5e7eb;">Codes Generated</td><td style="padding: 12px 20px; color: #111827; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${quantity}</td></tr>
<tr><td style="padding: 12px 20px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Customer Discount</td><td style="padding: 12px 20px; color: #111827; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${discountPercent}%</td></tr>
<tr><td style="padding: 12px 20px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Your Commission</td><td style="padding: 12px 20px; color: #059669; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${commissionPercent}%</td></tr>
<tr><td style="padding: 12px 20px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Free Shipping</td><td style="padding: 12px 20px; color: #111827; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${freeShipping ? 'Yes ✓' : 'No'}</td></tr>
<tr><td style="padding: 12px 20px; color: #6b7280; font-size: 14px;">Validity</td><td style="padding: 12px 20px; color: #111827; font-size: 14px; font-weight: 600;">${expiryText}</td></tr>
</table>

<div style="background: #f9f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="font-weight: bold; margin: 0 0 10px; color: #333;">Your Referral Codes:</p>
<pre style="background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 14px; white-space: pre-wrap; word-break: break-all; margin: 0;">${codesList}${moreCodesNote}</pre>
</div>

<p style="color: #555; line-height: 1.6;">These codes are for your lead generation cards. When a customer uses one of these codes:</p>
<ul style="color: #555; line-height: 1.8;">
<li>They receive a <strong>${discountPercent}% discount</strong> on their order</li>
<li>You earn <strong>${commissionPercent}% commission</strong> on the sale</li>
${freeShipping ? '<li>They get <strong>free shipping</strong></li>' : ''}
</ul>

<div style="text-align: center; margin: 30px 0;">
<a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px;">View Partner Dashboard</a>
</div>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">MemoriQR Partner Program</p>
</div>
</div>`,
      text: `Hi ${businessName},\n\n${quantity} referral codes have been generated for your lead generation cards.\n\nDETAILS:\n- Customer Discount: ${discountPercent}%\n- Your Commission: ${commissionPercent}%\n- Free Shipping: ${freeShipping ? 'Yes' : 'No'}\n- Validity: ${expiryText}\n\nYOUR CODES:\n${codesList}${moreCodesNote}\n\nView your Partner Dashboard: ${dashboardUrl}`
    };
  }
});
