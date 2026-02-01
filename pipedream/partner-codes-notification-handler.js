/**
 * Pipedream Email Handler - Partner Order Notifications
 * 
 * Handles partner notification emails for codes generated:
 * - referral_codes_generated: Lead generation referral codes ready
 * - referral_codes_transferred: Referral codes transferred from another partner
 * - partner_codes_generated: Wholesale activation codes ready
 * - partner_codes_unassigned: Codes removed from partner
 * - activation_code_used: Customer used an activation code
 * - referral_code_request: Partner requests codes (admin notification)
 * - referral_request_submitted: Request confirmation (partner notification)
 * - referral_request_approved: Request approved (partner notification)
 * - referral_request_rejected: Request rejected (partner notification)
 * - referral_code_share: Partner shares a referral code with customer via email
 * 
 * Use this in a SEPARATE Pipedream workflow with its own webhook URL.
 * Env var: PIPEDREAM_PARTNER_CODES_WEBHOOK_URL
 * 
 * Last updated: February 1, 2026
 */

export default defineComponent({
  async run({ steps, $ }) {
    // Debug: log what we're receiving
    console.log('Full trigger event:', JSON.stringify(steps.trigger.event, null, 2));
    
    const body = steps.trigger.event.body || steps.trigger.event;
    
    console.log('Body object:', JSON.stringify(body, null, 2));
    console.log('Type:', body?.type);
    
    const validTypes = [
      'referral_codes_generated', 
      'referral_codes_transferred', 
      'partner_codes_generated', 
      'partner_codes_unassigned', 
      'activation_codes_transferred', 
      'activation_code_used',
      'referral_code_request',
      'referral_request_submitted',
      'referral_request_approved',
      'referral_request_rejected',
      'referral_code_share'
    ];
    
    if (!body || !validTypes.includes(body.type)) {
      $.flow.exit(`Not a partner codes notification event: ${body?.type}`);
    }
    
    // Handle referral codes generated (Lead Generation Cards)
    if (body.type === 'referral_codes_generated') {
      // Support both old field names (partner_email, partner_name, codes_list) and new ones (to, businessName, codes)
      const to = body.to || body.partner_email;
      const businessName = body.businessName || body.partner_name;
      const codes = body.codes || body.codes_list || [];
      const quantity = body.quantity || codes.length;
      const totalCodes = body.totalCodes || quantity;
      const discountPercent = body.discountPercent ?? 10;
      const commissionPercent = body.commissionPercent ?? 15;
      const freeShipping = body.freeShipping ?? false;
      const expiresAt = body.expiresAt;
      const dashboardUrl = body.dashboardUrl || 'https://memoriqr.co.nz/partner/referrals';

      const expiryText = expiresAt 
        ? `Valid until ${new Date(expiresAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}`
        : 'No expiry date';
      
      const codesList = Array.isArray(codes) ? codes.join('\n') : '';
      const moreCodesNote = totalCodes > 10 ? `\n... and ${totalCodes - 10} more codes` : '';

      return {
        to: to,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR Partner Program',
        subject: `🎴 ${quantity} Referral Codes Generated for ${businessName}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 18px; line-height: 1.6; color: #333;">
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
<p style="color: #888; font-size: 14px; margin: 0;">MemoriQR Partner Program</p>
</div>
</div>`,
        text: `Hi ${businessName},\n\n${quantity} referral codes have been generated for your lead generation cards.\n\nDETAILS:\n- Customer Discount: ${discountPercent}%\n- Your Commission: ${commissionPercent}%\n- Free Shipping: ${freeShipping ? 'Yes' : 'No'}\n- Validity: ${expiryText}\n\nYOUR CODES:\n${codesList}${moreCodesNote}\n\nView your Partner Dashboard: ${dashboardUrl}`
      };
    }

    // Handle referral codes transferred from another partner
    if (body.type === 'referral_codes_transferred') {
      const { 
        to, 
        toBusinessName, 
        fromBusinessName, 
        quantity, 
        codesList,
        notes,
        dashboardUrl 
      } = body;

      const notesHtml = notes ? `
<div style="background: #f9f7f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
<p style="font-weight: bold; margin: 0 0 5px; color: #333;">Note from ${fromBusinessName}:</p>
<p style="color: #555; margin: 0; font-style: italic;">${notes}</p>
</div>
` : '';

      const notesText = notes ? `\nNote from ${fromBusinessName}: ${notes}\n` : '';

      return {
        to: to,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR Partner Program',
        subject: `📥 ${quantity} Referral Code${quantity > 1 ? 's' : ''} Transferred to Your Account`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 18px; line-height: 1.6; color: #333;">
<div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">📥 Codes Transferred!</h1>
<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">From ${fromBusinessName}</p>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${toBusinessName},</p>
<p style="color: #555; line-height: 1.6;"><strong>${fromBusinessName}</strong> has transferred <strong>${quantity} referral code${quantity > 1 ? 's' : ''}</strong> to your account.</p>

${notesHtml}

<div style="background: #f9f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="font-weight: bold; margin: 0 0 10px; color: #333;">Your New Referral Codes:</p>
<pre style="background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 14px; white-space: pre-wrap; word-break: break-all; margin: 0;">${codesList}</pre>
</div>

<p style="color: #555; line-height: 1.6;">These codes are now yours to use. When a customer uses one of these codes, you'll earn the commission!</p>

<div style="text-align: center; margin: 30px 0;">
<a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px;">View Your Referral Codes</a>
</div>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 14px; margin: 0;">MemoriQR Partner Program</p>
</div>
</div>`,
        text: `Hi ${toBusinessName},\n\n${fromBusinessName} has transferred ${quantity} referral code${quantity > 1 ? 's' : ''} to your account.${notesText}\n\nYOUR NEW CODES:\n${codesList}\n\nThese codes are now yours to use. When a customer uses one of these codes, you'll earn the commission!\n\nView your referral codes: ${dashboardUrl}`
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
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 18px; line-height: 1.6; color: #333;">
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
<p style="color: #888; font-size: 14px; margin: 0;">MemoriQR Partner Portal</p>
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
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 18px; line-height: 1.6; color: #333;">
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
<p style="color: #888; font-size: 14px; margin: 0;">MemoriQR Partner Portal</p>
</div>
</div>`,
        text: `Hi ${partner_name},\n\nThis is to inform you that ${quantity} activation code${quantity > 1 ? 's have' : ' has'} been removed from your partner account.\n\nREMOVED CODES:\n${codes_list}\n\nIf you believe this is an error, please contact our partner support team.\n\nView Partner Portal: ${portal_url}`
      };
    }

    // Handle activation codes transferred between partner's businesses
    if (body.type === 'activation_codes_transferred') {
      const { 
        to, 
        toBusinessName, 
        fromBusinessName, 
        quantity, 
        codesList,
        notes,
        dashboardUrl 
      } = body;

      const notesHtml = notes ? `
<div style="background: #f9f7f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
<p style="font-weight: bold; margin: 0 0 5px; color: #333;">Note from ${fromBusinessName}:</p>
<p style="color: #555; margin: 0; font-style: italic;">${notes}</p>
</div>
` : '';

      const notesText = notes ? `\nNote from ${fromBusinessName}: ${notes}\n` : '';

      return {
        to: to,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR Partner Portal',
        subject: `📥 ${quantity} Activation Code${quantity > 1 ? 's' : ''} Transferred to Your Account`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 18px; line-height: 1.6; color: #333;">
<div style="background: linear-gradient(135deg, #2d5a27 0%, #3d7a35 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">📥 Codes Transferred!</h1>
<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">From ${fromBusinessName}</p>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${toBusinessName},</p>
<p style="color: #555; line-height: 1.6;"><strong>${fromBusinessName}</strong> has transferred <strong>${quantity} activation code${quantity > 1 ? 's' : ''}</strong> to your account.</p>

${notesHtml}

<div style="background: #f9f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="font-weight: bold; margin: 0 0 10px; color: #333;">Your Transferred Activation Codes:</p>
<pre style="background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 14px; white-space: pre-wrap; word-break: break-all; margin: 0;">${codesList}</pre>
</div>

<p style="color: #555; line-height: 1.6;">These codes are now available in your account. Customers can use them to activate their MemoriQR products.</p>

<div style="text-align: center; margin: 30px 0;">
<a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #2d5a27 0%, #3d7a35 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px;">View Your Activation Codes</a>
</div>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 14px; margin: 0;">MemoriQR Partner Portal</p>
</div>
</div>`,
        text: `Hi ${toBusinessName},\n\n${fromBusinessName} has transferred ${quantity} activation code${quantity > 1 ? 's' : ''} to your account.${notesText}\n\nYOUR TRANSFERRED CODES:\n${codesList}\n\nThese codes are now available in your account. Customers can use them to activate their MemoriQR products.\n\nView your activation codes: ${dashboardUrl}`
      };
    }

    // Handle activation code used notification
    if (body.type === 'activation_code_used') {
      const { 
        to, 
        businessName, 
        activationCode, 
        deceasedName,
        productType,
        hostingDuration,
        memorialUrl,
        dashboardUrl,
        hasBankingDetails,
        settingsUrl
      } = body;

      const productLabels = {
        'nfc_only': 'NFC Tag',
        'qr_only': 'QR Plate',
        'both': 'NFC Tag + QR Plate'
      };
      const productLabel = productLabels[productType] || productType;

      // Banking reminder block - only shown if hasBankingDetails is false
      const bankingReminderHtml = hasBankingDetails === false ? `
<div style="margin: 20px 0; background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px;">
<p style="color: #92400e; font-weight: bold; margin: 0 0 10px;">⚠️ Banking Details Required</p>
<p style="color: #78350f; margin: 0; line-height: 1.5;">To receive commission payouts for your code sales, please add your banking details in the Partner Portal.</p>
<div style="text-align: center; margin-top: 15px;">
<a href="${settingsUrl}" style="display: inline-block; background-color: #f59e0b; color: #fff; text-decoration: none; padding: 10px 25px; border-radius: 6px; font-size: 14px; font-weight: 600;">Add Banking Details</a>
</div>
</div>
` : '';

      const bankingReminderText = hasBankingDetails === false 
        ? `\n\n⚠️ BANKING DETAILS REQUIRED\nTo receive commission payouts, please add your banking details: ${settingsUrl}\n` 
        : '';

      return {
        to: to,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR Partner Program',
        subject: `✅ Activation Code ${activationCode} Used - Memorial Created!`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 18px; line-height: 1.6; color: #333;">
<div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">✅ Code Activated!</h1>
<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">A customer has created their memorial</p>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${businessName},</p>
<p style="color: #555; line-height: 1.6;">Great news! One of your activation codes has been used to create a memorial.</p>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
<tr><td style="padding: 12px 20px; color: #6b7280; font-size: 14px; width: 50%; border-bottom: 1px solid #e5e7eb;">Activation Code</td><td style="padding: 12px 20px; color: #111827; font-size: 14px; font-weight: 600; font-family: monospace; border-bottom: 1px solid #e5e7eb;">${activationCode}</td></tr>
<tr><td style="padding: 12px 20px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Memorial For</td><td style="padding: 12px 20px; color: #111827; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${deceasedName}</td></tr>
<tr><td style="padding: 12px 20px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Product</td><td style="padding: 12px 20px; color: #111827; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${productLabel}</td></tr>
<tr><td style="padding: 12px 20px; color: #6b7280; font-size: 14px;">Hosting Duration</td><td style="padding: 12px 20px; color: #111827; font-size: 14px; font-weight: 600;">${hostingDuration} years</td></tr>
</table>

${bankingReminderHtml}

<p style="color: #555; line-height: 1.6;">The customer's products will be shipped shortly. You can view all your codes and their status in the Partner Portal.</p>

<div style="text-align: center; margin: 30px 0;">
<a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px;">View Partner Portal</a>
</div>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 14px; margin: 0;">MemoriQR Partner Program</p>
</div>
</div>`,
        text: `Hi ${businessName},\n\nGreat news! One of your activation codes has been used to create a memorial.\n\nDETAILS:\n- Activation Code: ${activationCode}\n- Memorial For: ${deceasedName}\n- Product: ${productLabel}\n- Hosting: ${hostingDuration} years${bankingReminderText}\n\nView your codes in the Partner Portal: ${dashboardUrl}`
      };
    }

    // Referral code request - admin notification (partner requests > 10 codes)
    if (body.type === 'referral_code_request') {
      const { partner_name, partner_email, quantity, reason, baseUrl } = body;
      const adminUrl = `${baseUrl || 'https://memoriqr.co.nz'}/admin/referrals`;
      
      return {
        to: 'memoriqr.global@gmail.com',
        replyTo: partner_email,
        from_name: 'MemoriQR Partner Portal',
        subject: `🏷️ Referral Code Request: ${quantity} codes from ${partner_name}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 18px; line-height: 1.6; color: #333;">
<div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0;">🏷️ Referral Code Request</h1>
</div>

<div style="padding: 25px; background: #fff; border: 1px solid #ddd; border-top: none;">

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
<tr style="background: #f0fdf4;"><td colspan="2" style="padding: 12px; font-weight: bold; border: 1px solid #ddd;">Request Details</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee; width: 40%;">Partner</td><td style="padding: 10px; border: 1px solid #eee;">${partner_name}<br><a href="mailto:${partner_email}" style="color: #059669;">${partner_email}</a></td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Quantity Requested</td><td style="padding: 10px; border: 1px solid #eee; font-weight: 500; font-size: 20px;">${quantity} codes</td></tr>
</table>

<div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
<strong>📝 Partner's Reason:</strong>
<p style="margin: 10px 0 0; color: #555;">${reason}</p>
</div>

<div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px;">
<strong>⚡ Action Required:</strong>
<p style="margin: 10px 0 5px;">Review this request in the Admin Portal:</p>
<p style="margin: 5px 0;">• Approve to generate codes automatically</p>
<p style="margin: 5px 0 0;">• Or reject with a reason</p>
</div>

<div style="text-align: center; margin: 25px 0 10px;">
<a href="${adminUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px;">Review Request</a>
</div>

</div>
<div style="background: #f0fdf4; padding: 15px; text-align: center; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 14px; margin: 0;">Partner Portal Admin Notification</p>
</div>
</div>`,
        text: `REFERRAL CODE REQUEST\n\nPartner: ${partner_name} (${partner_email})\nQuantity: ${quantity} codes\n\nReason: ${reason}\n\nReview this request: ${adminUrl}`
      };
    }

    // Referral request submitted - partner confirmation
    if (body.type === 'referral_request_submitted') {
      const { partner_email, partner_name, quantity, reason, baseUrl } = body;
      const dashboardUrl = `${baseUrl || 'https://memoriqr.co.nz'}/partner/referrals`;
      
      return {
        to: partner_email,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR Partner Portal',
        subject: `✓ Your request for ${quantity} referral codes has been submitted`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 18px; line-height: 1.6; color: #333;">
<div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">Request Submitted</h1>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${partner_name},</p>

<p style="color: #555; line-height: 1.6;">Your request for <strong>${quantity} referral codes</strong> has been submitted and is awaiting approval.</p>

<div style="background: #f0fdf4; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 0; color: #065f46;"><strong>📋 Request Details:</strong></p>
<p style="margin: 10px 0 0; color: #047857;">Quantity: ${quantity} codes</p>
<p style="margin: 5px 0 0; color: #047857;">Status: Pending approval</p>
</div>

${reason ? `<div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Your reason:</strong></p>
<p style="margin: 5px 0 0; color: #374151;">${reason}</p>
</div>` : ''}

<p style="color: #555; line-height: 1.6;">We'll review your request and notify you once it's been processed. This typically takes 1-2 business days.</p>

<div style="text-align: center; margin: 30px 0;">
<a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px;">View Your Referrals</a>
</div>

</div>
<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 14px; margin: 0;">MemoriQR Partner Portal</p>
</div>
</div>`,
        text: `Hi ${partner_name},\n\nYour request for ${quantity} referral codes has been submitted and is awaiting approval.\n\nQuantity: ${quantity} codes\nStatus: Pending approval\n${reason ? `\nYour reason: ${reason}` : ''}\n\nWe'll review your request and notify you once it's been processed.\n\nView your referrals: ${dashboardUrl}`
      };
    }

    // Referral request approved - partner notification
    if (body.type === 'referral_request_approved') {
      const { partner_email, partner_name, quantity, codes, admin_notes, baseUrl } = body;
      const dashboardUrl = `${baseUrl || 'https://memoriqr.co.nz'}/partner/referrals`;
      const codesList = Array.isArray(codes) ? codes.slice(0, 10).join('\n') : '';
      const moreCodesNote = codes && codes.length > 10 ? `\n... and ${codes.length - 10} more codes` : '';
      
      return {
        to: partner_email,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR Partner Portal',
        subject: `✅ Your request for ${quantity} referral codes has been approved!`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 18px; line-height: 1.6; color: #333;">
<div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">✅ Request Approved!</h1>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${partner_name},</p>

<p style="color: #555; line-height: 1.6;">Great news! Your request for <strong>${quantity} referral codes</strong> has been approved and the codes are now available in your account.</p>

${admin_notes ? `<div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 0; color: #065f46;"><strong>Admin note:</strong></p>
<p style="margin: 5px 0 0; color: #047857;">${admin_notes}</p>
</div>` : ''}

<div style="background: #f9f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="font-weight: bold; margin: 0 0 10px; color: #333;">Your New Referral Codes:</p>
<pre style="background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 14px; white-space: pre-wrap; word-break: break-all; margin: 0;">${codesList}${moreCodesNote}</pre>
</div>

<div style="text-align: center; margin: 30px 0;">
<a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px;">View All Your Codes</a>
</div>

</div>
<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 14px; margin: 0;">MemoriQR Partner Portal</p>
</div>
</div>`,
        text: `Hi ${partner_name},\n\nGreat news! Your request for ${quantity} referral codes has been approved!\n\n${admin_notes ? `Admin note: ${admin_notes}\n\n` : ''}YOUR CODES:\n${codesList}${moreCodesNote}\n\nView all your codes: ${dashboardUrl}`
      };
    }

    // Referral request rejected - partner notification
    if (body.type === 'referral_request_rejected') {
      const { partner_email, partner_name, quantity, admin_notes, baseUrl } = body;
      const dashboardUrl = `${baseUrl || 'https://memoriqr.co.nz'}/partner/referrals`;
      
      return {
        to: partner_email,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR Partner Portal',
        subject: `Your referral code request update`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 18px; line-height: 1.6; color: #333;">
<div style="background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">Referral Code Request Update</h1>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${partner_name},</p>

<p style="color: #555; line-height: 1.6;">Thank you for your request for ${quantity} referral codes.</p>

<div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 0; color: #92400e;"><strong>Status:</strong> Not approved at this time</p>
${admin_notes ? `<p style="margin: 10px 0 0; color: #78350f;">${admin_notes}</p>` : ''}
</div>

<p style="color: #555; line-height: 1.6;">If you have any questions or would like to discuss this further, please reply to this email or contact us at partners@memoriqr.co.nz.</p>

<div style="text-align: center; margin: 30px 0;">
<a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px;">View Your Referrals</a>
</div>

</div>
<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 14px; margin: 0;">MemoriQR Partner Portal</p>
</div>
</div>`,
        text: `Hi ${partner_name},\n\nThank you for your request for ${quantity} referral codes.\n\nStatus: Not approved at this time\n${admin_notes ? `\n${admin_notes}\n` : ''}\nIf you have any questions, please contact us at partners@memoriqr.co.nz.\n\nView your referrals: ${dashboardUrl}`
      };
    }

    // Referral code share email (sent by partner to potential customer)
    if (body.type === 'referral_code_share') {
      const { to, recipientName, partnerName, personalMessage, referralCode, discountPercent, freeShipping, orderUrl } = body;
      
      const greeting = recipientName ? `Hi ${recipientName}` : 'Hello';
      
      const discountText = discountPercent > 0 ? `${discountPercent}% discount` : '';
      const freeShippingText = freeShipping ? 'free shipping' : '';
      const benefits = [discountText, freeShippingText].filter(Boolean).join(' + ');
      const benefitsDisplay = benefits ? ` with ${benefits}` : '';
      
      const personalMessageHtml = personalMessage 
        ? `<div style="background: #f5f5f0; border-left: 4px solid #8B7355; padding: 20px; margin: 20px 0; border-radius: 4px; font-style: italic;">
"${personalMessage}"
<div style="margin-top: 10px; color: #666; font-size: 14px;">— ${partnerName}</div>
</div>` 
        : '';
      
      return {
        to,
        replyTo: 'info@memoriqr.co.nz',
        from_name: 'MemoriQR',
        subject: `${partnerName} has shared a MemoriQR referral code with you`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 18px; line-height: 1.6; color: #333;">
<div style="background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">You've Received a Referral Code! 💝</h1>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 18px; margin-top: 0;">${greeting},</p>

<p style="color: #555; line-height: 1.7;"><strong>${partnerName}</strong> thought you might be interested in MemoriQR and has shared their referral code with you${benefitsDisplay}!</p>

${personalMessageHtml}

<div style="background: #f9f7f4; border: 2px dashed #8B7355; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
<p style="color: #666; font-size: 14px; margin: 0 0 10px;">Your referral code:</p>
<p style="font-family: monospace; font-size: 28px; font-weight: bold; color: #8B7355; margin: 0; letter-spacing: 2px;">${referralCode}</p>
${benefits ? `<p style="color: #2d5a27; font-size: 14px; margin: 10px 0 0;">✓ ${benefits}</p>` : ''}
</div>

<p style="color: #555; line-height: 1.7;">MemoriQR creates premium NFC tags and QR code plates that link to beautiful online memorials, perfect for:</p>

<ul style="color: #555; line-height: 2;">
<li>🪦 Cemetery headstones and grave markers</li>
<li>🐾 Pet memorial gardens and urns</li>
<li>🏠 Home memorial displays</li>
<li>🌳 Memorial trees and benches</li>
</ul>

<div style="text-align: center; margin: 30px 0;">
<a href="${orderUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 18px;">
Use Code & View Options →
</a>
</div>

<p style="color: #888; font-size: 14px; text-align: center;">Your code will be automatically applied when you click the link above</p>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #666; font-size: 14px; margin: 0 0 10px;">Honouring lives, preserving memories.</p>
<p style="color: #888; font-size: 12px; margin: 0;">MemoriQR • memoriqr.co.nz</p>
</div>
</div>`,
        text: `${greeting},\n\n${partnerName} thought you might be interested in MemoriQR and has shared their referral code with you${benefitsDisplay}!\n\n${personalMessage ? `"${personalMessage}"\n— ${partnerName}\n\n` : ''}Your referral code: ${referralCode}\n${benefits ? `Benefits: ${benefits}\n` : ''}\nMemoriQR creates premium NFC tags and QR code plates that link to beautiful online memorials.\n\nUse your code here: ${orderUrl}\n\n---\nMemoriQR • memoriqr.co.nz`
      };
    }
  }
});
