/**
 * Pipedream Email Handler - Partner Order Notifications
 * 
 * Handles partner notification emails for codes generated:
 * - referral_codes_generated: Lead generation referral codes ready
 * - partner_codes_generated: Wholesale activation codes ready
 * - partner_codes_unassigned: Codes removed from partner
 * 
 * Use this in a SEPARATE Pipedream workflow with its own webhook URL.
 * Env var: PIPEDREAM_PARTNER_CODES_WEBHOOK_URL
 * 
 * Last updated: January 27, 2026
 */

export default defineComponent({
  async run({ steps, $ }) {
    // Debug: log what we're receiving
    console.log('Full trigger event:', JSON.stringify(steps.trigger.event, null, 2));
    
    const body = steps.trigger.event.body || steps.trigger.event;
    
    console.log('Body object:', JSON.stringify(body, null, 2));
    console.log('Type:', body?.type);
    
    const validTypes = ['referral_codes_generated', 'partner_codes_generated', 'partner_codes_unassigned'];
    
    if (!body || !validTypes.includes(body.type)) {
      $.flow.exit(`Not a partner codes notification event: ${body?.type}`);
    }
    
    // Handle referral codes generated (Lead Generation Cards)
    if (body.type === 'referral_codes_generated') {
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
    
    // Handle partner activation codes generated (Wholesale Codes)
    if (body.type === 'partner_codes_generated') {
      const { partner_email, partner_name, batch_number, quantity, product_type, hosting_duration, codes_list, portal_url } = body;
      
      const productDisplays = {
        'nfc_only': 'NFC Tag Only',
        'qr_only': 'QR Code Plate Only',
        'both': 'QR Code Plate + NFC Tag'
      };
      const productDisplay = productDisplays[product_type] || product_type;
      
      return {
        to: partner_email,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR Partner Portal',
        subject: `✅ Your ${quantity} activation codes are ready! (${batch_number})`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #2d5a27 0%, #3d7a35 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">✅ Your Codes Are Ready!</h1>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${partner_name},</p>
<p style="color: #555; line-height: 1.6;">Great news! Your batch of activation codes has been generated and is ready to use.</p>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
<tr style="background: #f9f7f4;"><td colspan="2" style="padding: 12px; font-weight: bold; border: 1px solid #ddd;">Batch Details</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee; width: 40%;">Batch Number</td><td style="padding: 10px; border: 1px solid #eee; font-weight: 500;">${batch_number}</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Codes Generated</td><td style="padding: 10px; border: 1px solid #eee; font-weight: 500; color: #2d5a27;">${quantity}</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Product</td><td style="padding: 10px; border: 1px solid #eee;">${productDisplay}</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Hosting</td><td style="padding: 10px; border: 1px solid #eee;">${hosting_duration} years</td></tr>
</table>

<div style="text-align: center; margin: 30px 0;">
<a href="${portal_url}" style="display: inline-block; background: linear-gradient(135deg, #2d5a27 0%, #3d7a35 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px;">View Codes in Portal</a>
</div>

<div style="background: #f9f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="font-weight: bold; margin: 0 0 10px;">Your Activation Codes:</p>
<pre style="background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 14px; white-space: pre-wrap; word-break: break-all; margin: 0;">${codes_list}</pre>
</div>

<p style="color: #777; font-size: 14px;">You can also download all codes as a CSV from the Partner Portal. Each code can be used by one customer to activate their memorial.</p>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">MemoriQR Partner Portal</p>
</div>
</div>`,
        text: `Hi ${partner_name},\n\nYour batch of activation codes is ready!\n\nBatch: ${batch_number}\nCodes Generated: ${quantity}\nProduct: ${productDisplay}\nHosting: ${hosting_duration} years\n\nYOUR CODES:\n${codes_list}\n\nView all codes in the Partner Portal: ${portal_url}`
      };
    }
    
    // Handle codes unassigned from partner
    if (body.type === 'partner_codes_unassigned') {
      const { partner_email, partner_name, quantity, codes_list, portal_url } = body;

      return {
        to: partner_email,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR Partner Portal',
        subject: `⚠️ ${quantity} Activation Code${quantity > 1 ? 's' : ''} Removed from Your Account`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">⚠️ Codes Removed</h1>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${partner_name},</p>
<p style="color: #555; line-height: 1.6;">This is to inform you that <strong>${quantity} activation code${quantity > 1 ? 's have' : ' has'}</strong> been removed from your partner account.</p>

<div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="font-weight: bold; margin: 0 0 10px; color: #991b1b;">Removed Codes:</p>
<pre style="background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 14px; white-space: pre-wrap; word-break: break-all; margin: 0;">${codes_list}</pre>
</div>

<p style="color: #555; line-height: 1.6;">These codes are no longer associated with your account. If you believe this is an error, please contact our partner support team.</p>

<div style="text-align: center; margin: 30px 0;">
<a href="${portal_url}" style="display: inline-block; background: linear-gradient(135deg, #2d5a27 0%, #3d7a35 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px;">View Partner Portal</a>
</div>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">MemoriQR Partner Portal</p>
</div>
</div>`,
        text: `Hi ${partner_name},\n\nThis is to inform you that ${quantity} activation code${quantity > 1 ? 's have' : ' has'} been removed from your partner account.\n\nREMOVED CODES:\n${codes_list}\n\nIf you believe this is an error, please contact our partner support team.\n\nView Partner Portal: ${portal_url}`
      };
    }
  }
});
