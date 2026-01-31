/**
 * Pipedream Email Handler for MemoriQR
 * 
 * This is the single source of truth for the Pipedream workflow code.
 * Copy this code into your Pipedream workflow's Node.js step.
 * 
 * Last updated: January 25, 2026
 * 
 * MAIN WORKFLOW (MemoriQR Supabase Webhook WF):
 * - contact_form: Contact form submissions → info@memoriqr.co.nz
 * - order_confirmation: Order confirmation → customer email
 * - admin_order_notification: Fulfillment notification → memoriqr.global@gmail.com
 * - retail_fulfillment: Retail scratch card activation → memoriqr.global@gmail.com
 * - memorial_created: Memorial live notification → customer email
 * - edit_verification: MFA verification code → customer email
 * - partner_login_code: Partner portal OTP → partner email
 * - partner_code_request: Batch request notification → admin
 * - partner_codes_generated: Codes ready notification → partner email
 * - partner_application: New partner application → admin
 * - partner_application_received: Application confirmation → applicant
 * - partner_approved: Approval notification → partner
 * - partner_rejected: Rejection notification → applicant
 * - partner_suspended: Suspension notification → partner
 * - commission_payout_statement: Payout confirmation → partner
 * 
 * SEPARATE WORKFLOW (Referral Redemption WF - PIPEDREAM_REFERRAL_WEBHOOK_URL):
 * - referral_redeemed: Referral code used notification → partner (with opt-out)
 *   See: pipedream/referral-redeemed-handler.js
 * 
 * SEPARATE WORKFLOW (Partner Codes Notification WF - PIPEDREAM_PARTNER_CODES_WEBHOOK_URL):
 * - referral_codes_generated: Lead gen codes ready → partner email
 * - partner_codes_generated: Wholesale activation codes ready → partner email
 *   See: pipedream/partner-codes-notification-handler.js
 */

export default defineComponent({
  async run({ steps, $ }) {
    const body = steps.trigger.event.body;
    const type = body.type;
    
    // Product type display mapping
    const getProductDisplay = (productType) => {
      const displays = {
        'nfc_only': 'NFC Tag Only',
        'qr_only': 'QR Code Plate Only',
        'both': 'QR Code Plate + NFC Tag'
      };
      return displays[productType] || productType;
    };
    
    // Contact form email
    if (type === 'contact_form') {
      const { name, email, subject, message, submitted_at } = body;
      return {
        to: 'info@memoriqr.co.nz',
        replyTo: email,
        from_name: 'MemoriQR',
        subject: `[MemoriQR] ${subject || 'Contact Form'} - from ${name}`,
        html: `<p><strong>From:</strong> ${name}<br><strong>Email:</strong> ${email}<br><strong>Subject:</strong> ${subject || 'General Inquiry'}</p><p>${message}</p>`,
        text: `From: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`
      };
    }
    
    // Order confirmation email (to customer)
    if (type === 'order_confirmation') {
      const { 
        customer_email, 
        customer_name, 
        order_number, 
        deceased_name, 
        memorial_slug, 
        product_type, 
        hosting_duration, 
        amount_paid, 
        currency, 
        activation_url, 
        sender_name, 
        reply_to,
        surface_preparation_note
      } = body;
      
      const productDisplay = getProductDisplay(product_type);
      
      // Surface preparation section - show for all product types
      const surfacePrepSection = surface_preparation_note ? `
<div style="background: #fff3cd; border-left: 4px solid #f0ad4e; padding: 20px; margin: 25px 0; border-radius: 4px;">
<h3 style="color: #856404; margin: 0 0 10px; font-size: 16px;">📋 Important: Surface Preparation</h3>
<p style="color: #856404; margin: 0; line-height: 1.6; font-size: 14px;">${surface_preparation_note}</p>
</div>` : '';

      const surfacePrepText = surface_preparation_note ? `\n\nIMPORTANT: SURFACE PREPARATION\n${surface_preparation_note}\n` : '';
      
      return {
        to: customer_email,
        replyTo: reply_to || 'memoriqr.global@gmail.com',
        from_name: sender_name || 'MemoriQR',
        subject: `Your MemoriQR order ${order_number} is confirmed`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); padding: 30px; text-align: center;">
<h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300;">MemoriQR</h1>
</div>
<div style="padding: 30px; background: #fff;">
<h2 style="color: #333; margin: 0 0 20px;">Thank you for your order, ${customer_name}!</h2>
<p style="color: #555; line-height: 1.6;">Your order <strong>${order_number}</strong> has been confirmed.</p>

<table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
<tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Memorial for:</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 500;">${deceased_name}</td></tr>
<tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Product:</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 500;">${productDisplay}</td></tr>
<tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Hosting:</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 500;">${hosting_duration} years</td></tr>
</table>

${surfacePrepSection}

<div style="text-align: center; margin: 30px 0;">
<a href="${activation_url}" style="display: inline-block; background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px;">Activate Your Memorial</a>
</div>

<p style="color: #777; font-size: 14px;">Once your physical product arrives, you can use the activation code printed on it, or click the button above to set up your memorial page now.</p>
</div>
<div style="background: #f5f5f0; padding: 20px; text-align: center;">
<p style="color: #888; font-size: 12px; margin: 0;">© 2026 MemoriQR - Preserving Memories Forever</p>
</div>
</div>`,
        text: `Thank you for your order, ${customer_name}!\n\nOrder: ${order_number}\nMemorial for: ${deceased_name}\nProduct: ${productDisplay}\nHosting: ${hosting_duration} years${surfacePrepText}\n\nActivate your memorial: ${activation_url}`
      };
    }
    
    // Admin order notification (for fulfillment)
    if (type === 'admin_order_notification') {
      const { 
        order_number, 
        customer_email, 
        customer_name, 
        deceased_name,
        product_type,
        hosting_duration,
        amount_paid,
        currency,
        activation_code,
        shipping_address,
        shipping_name,
        nfc_url,
        memorial_url,
        qr_code_url
      } = body;
      
      // Parse shipping address
      let shippingHtml = 'No shipping address provided';
      let shippingText = 'No shipping address provided';
      try {
        const addr = JSON.parse(shipping_address || '{}');
        if (addr.line1) {
          const parts = [
            shipping_name || customer_name,
            addr.line1,
            addr.line2,
            `${addr.city} ${addr.postal_code || ''}`.trim(),
            addr.country
          ].filter(Boolean);
          shippingHtml = parts.join('<br>');
          shippingText = parts.join('\n');
        }
      } catch (e) {
        shippingHtml = shipping_address || 'No address provided';
        shippingText = shipping_address || 'No address provided';
      }
      
      // Format product type for display
      const productDisplay = {
        'nfc_only': '🏷️ NFC Tag Only',
        'qr_only': '📱 QR Code Plate Only',
        'both': '🏷️📱 QR Code Plate + NFC Tag'
      }[product_type] || product_type;
      
      return {
        to: 'memoriqr.global@gmail.com',
        replyTo: customer_email,
        from_name: 'MemoriQR Orders',
        subject: `📦 New Order ${order_number} - ${productDisplay} for ${deceased_name}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #2d5a27 0%, #3d7a35 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0;">📦 New Order Received</h1>
<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 18px; font-weight: bold;">${order_number}</p>
</div>

<div style="padding: 25px; background: #fff; border: 1px solid #ddd; border-top: none;">

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
<tr style="background: #f9f7f4;"><td colspan="2" style="padding: 12px; font-weight: bold; border: 1px solid #ddd;">Order Summary</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee; width: 40%;">Product</td><td style="padding: 10px; border: 1px solid #eee; font-weight: 500;">${productDisplay}</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Hosting</td><td style="padding: 10px; border: 1px solid #eee;">${hosting_duration} years</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Amount Paid</td><td style="padding: 10px; border: 1px solid #eee; color: #2d5a27; font-weight: bold;">$${amount_paid} ${currency}</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Memorial For</td><td style="padding: 10px; border: 1px solid #eee; font-weight: 500;">${deceased_name}</td></tr>
</table>

<div style="background: #8B7355; color: #fff; padding: 12px; font-weight: bold; border-radius: 8px 8px 0 0;">⚙️ Fulfillment Details</div>
<div style="border: 2px solid #8B7355; border-top: none; padding: 15px; margin-bottom: 20px; border-radius: 0 0 8px 8px;">
<p style="margin: 0 0 10px;"><strong>NFC URL (program to tag):</strong><br>
<a href="${nfc_url}" style="color: #8B7355; word-break: break-all;">${nfc_url}</a></p>
<p style="margin: 0;"><strong>Memorial Page:</strong><br>
<a href="${memorial_url}" style="color: #8B7355; word-break: break-all;">${memorial_url}</a></p>
</div>

${qr_code_url ? `<div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 20px;">
<p style="margin: 0 0 10px; font-weight: bold;">QR Code for Plate</p>
<img src="${qr_code_url}" alt="QR Code" style="width: 150px; height: 150px;">
<p style="margin: 10px 0 0;"><a href="${qr_code_url}" style="color: #8B7355; font-size: 13px;">Download QR Code</a></p>
</div>` : ''}

<table style="width: 100%; margin-bottom: 20px;">
<tr>
<td style="width: 48%; vertical-align: top;">
<div style="border: 1px solid #ddd; border-radius: 8px;">
<div style="background: #f9f7f4; padding: 10px; border-bottom: 1px solid #ddd;"><strong>👤 Customer</strong></div>
<div style="padding: 12px;">${customer_name}<br><a href="mailto:${customer_email}" style="color: #8B7355;">${customer_email}</a></div>
</div>
</td>
<td style="width: 4%;"></td>
<td style="width: 48%; vertical-align: top;">
<div style="border: 1px solid #ddd; border-radius: 8px;">
<div style="background: #f9f7f4; padding: 10px; border-bottom: 1px solid #ddd;"><strong>📍 Ship To</strong></div>
<div style="padding: 12px;">${shippingHtml}</div>
</div>
</td>
</tr>
</table>

<div style="background: #f0f8ff; border: 1px solid #b8d4f0; padding: 15px; border-radius: 8px;">
<strong>📋 Action Checklist:</strong>
<p style="margin: 10px 0 5px;">☐ Program NFC tag with URL: <strong>${nfc_url}</strong></p>
<p style="margin: 5px 0;">☐ Print QR code for plate (if applicable)</p>
<p style="margin: 5px 0 0;">☐ Pack and ship to address above</p>
</div>

</div>
<div style="background: #f9f7f4; padding: 15px; text-align: center; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">Internal order notification</p>
</div>
</div>`,
        text: `NEW ORDER: ${order_number}\n\nPRODUCT: ${productDisplay}\nHOSTING: ${hosting_duration} years\nAMOUNT: $${amount_paid} ${currency}\nMEMORIAL FOR: ${deceased_name}\n\nFULFILLMENT DETAILS:\nNFC URL: ${nfc_url}\nMemorial Page: ${memorial_url}\nQR Code: ${qr_code_url || 'N/A'}\n\nCUSTOMER:\n${customer_name}\n${customer_email}\n\nSHIP TO:\n${shippingText}\n\nACTION CHECKLIST:\n- Program NFC tag with URL: ${nfc_url}\n- Print QR code for plate (if applicable)\n- Pack and ship`
      };
    }
    
    // =====================================================
    // RETAIL FULFILLMENT EMAIL (scratch card activation)
    // Sent to admin when customer activates a retail scratch card
    // =====================================================
    if (type === 'retail_fulfillment') {
      const { 
        customer_email, 
        customer_name, 
        deceased_name,
        product_type,
        hosting_duration,
        activation_code,
        shipping_name,
        shipping_address,
        memorial_url,
        nfc_url,
        qr_code_url,
        partner_id
      } = body;
      
      // Parse shipping address
      let shippingHtml = 'No shipping address provided';
      let shippingText = 'No shipping address provided';
      try {
        const addr = JSON.parse(shipping_address || '{}');
        if (addr.line1) {
          const parts = [
            shipping_name || customer_name,
            addr.line1,
            addr.line2,
            `${addr.city} ${addr.postal_code || ''}`.trim(),
            addr.country
          ].filter(Boolean);
          shippingHtml = parts.join('<br>');
          shippingText = parts.join('\n');
        }
      } catch (e) {
        shippingHtml = shipping_address || 'No address provided';
        shippingText = shipping_address || 'No address provided';
      }
      
      // Format product type for display
      const productDisplay = {
        'nfc_only': '🏷️ NFC Tag Only',
        'qr_only': '📱 QR Code Plate Only',
        'both': '🏷️📱 QR Code Plate + NFC Tag'
      }[product_type] || product_type;
      
      return {
        to: 'memoriqr.global@gmail.com',
        replyTo: customer_email,
        from_name: 'MemoriQR Retail',
        subject: `🎫 Retail Activation: ${productDisplay} for ${deceased_name}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #6B46C1 0%, #805AD5 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0;">🎫 Retail Scratch Card Activated</h1>
<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Customer activated their memorial - product ready to ship!</p>
</div>

<div style="padding: 25px; background: #fff; border: 1px solid #ddd; border-top: none;">

<div style="background: #f0fff4; border: 1px solid #9ae6b4; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
<p style="margin: 0; color: #276749; font-size: 16px;">✅ Memorial is <strong>LIVE</strong> - customer can view it now!</p>
<p style="margin: 10px 0 0;"><a href="${memorial_url}" style="color: #6B46C1; font-weight: bold;">${memorial_url}</a></p>
</div>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
<tr style="background: #f9f7f4;"><td colspan="2" style="padding: 12px; font-weight: bold; border: 1px solid #ddd;">Activation Details</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee; width: 40%;">Activation Code</td><td style="padding: 10px; border: 1px solid #eee; font-weight: 500; font-family: monospace; letter-spacing: 2px;">${activation_code}</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Product</td><td style="padding: 10px; border: 1px solid #eee; font-weight: 500;">${productDisplay}</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Hosting</td><td style="padding: 10px; border: 1px solid #eee;">${hosting_duration} years</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Memorial For</td><td style="padding: 10px; border: 1px solid #eee; font-weight: 500;">${deceased_name}</td></tr>
${partner_id ? `<tr><td style="padding: 10px; border: 1px solid #eee;">Partner ID</td><td style="padding: 10px; border: 1px solid #eee; font-family: monospace; font-size: 12px;">${partner_id}</td></tr>` : ''}
</table>

<div style="background: #6B46C1; color: #fff; padding: 12px; font-weight: bold; border-radius: 8px 8px 0 0;">⚙️ Fulfillment Details</div>
<div style="border: 2px solid #6B46C1; border-top: none; padding: 15px; margin-bottom: 20px; border-radius: 0 0 8px 8px;">
<p style="margin: 0 0 10px;"><strong>NFC URL (program to tag):</strong><br>
<a href="${nfc_url}" style="color: #6B46C1; word-break: break-all;">${nfc_url}</a></p>
<p style="margin: 0;"><strong>Memorial Page:</strong><br>
<a href="${memorial_url}" style="color: #6B46C1; word-break: break-all;">${memorial_url}</a></p>
</div>

${qr_code_url ? `<div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 20px;">
<p style="margin: 0 0 10px; font-weight: bold;">QR Code for Plate</p>
<img src="${qr_code_url}" alt="QR Code" style="width: 150px; height: 150px;">
<p style="margin: 10px 0 0;"><a href="${qr_code_url}" style="color: #6B46C1; font-size: 13px;">Download QR Code</a></p>
</div>` : ''}

<table style="width: 100%; margin-bottom: 20px;">
<tr>
<td style="width: 48%; vertical-align: top;">
<div style="border: 1px solid #ddd; border-radius: 8px;">
<div style="background: #f9f7f4; padding: 10px; border-bottom: 1px solid #ddd;"><strong>👤 Customer</strong></div>
<div style="padding: 12px;">${customer_name || shipping_name}<br><a href="mailto:${customer_email}" style="color: #6B46C1;">${customer_email}</a></div>
</div>
</td>
<td style="width: 4%;"></td>
<td style="width: 48%; vertical-align: top;">
<div style="border: 1px solid #ddd; border-radius: 8px;">
<div style="background: #f9f7f4; padding: 10px; border-bottom: 1px solid #ddd;"><strong>📍 Ship To</strong></div>
<div style="padding: 12px;">${shippingHtml}</div>
</div>
</td>
</tr>
</table>

<div style="background: #f0f8ff; border: 1px solid #b8d4f0; padding: 15px; border-radius: 8px;">
<strong>📋 Action Checklist:</strong>
<p style="margin: 10px 0 5px;">☐ Program NFC tag with URL: <strong>${nfc_url}</strong></p>
<p style="margin: 5px 0;">☐ Print QR code for plate (if applicable)</p>
<p style="margin: 5px 0 0;">☐ Pack and ship to address above</p>
</div>

</div>
<div style="background: #f9f7f4; padding: 15px; text-align: center; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">Retail activation fulfillment notification</p>
</div>
</div>`,
        text: `RETAIL SCRATCH CARD ACTIVATED\n\nACTIVATION CODE: ${activation_code}\nPRODUCT: ${productDisplay}\nHOSTING: ${hosting_duration} years\nMEMORIAL FOR: ${deceased_name}\n${partner_id ? `PARTNER ID: ${partner_id}\n` : ''}\nMEMORIAL IS LIVE:\n${memorial_url}\n\nFULFILLMENT DETAILS:\nNFC URL: ${nfc_url}\nQR Code: ${qr_code_url || 'N/A'}\n\nCUSTOMER:\n${customer_name || shipping_name}\n${customer_email}\n\nSHIP TO:\n${shippingText}\n\nACTION CHECKLIST:\n- Program NFC tag with URL: ${nfc_url}\n- Print QR code for plate (if applicable)\n- Pack and ship`
      };
    }
    
    // Memorial created email
    if (type === 'memorial_created') {
      const { email, memorialName, memorialUrl, editUrl, qrCodeUrl, sender_name, reply_to, hostingYears, packageLimits } = body;
      
      // Package limits with defaults for backward compatibility
      const photos = packageLimits?.photos || 20;
      const videos = packageLimits?.videos || 2;
      const themes = packageLimits?.themes || 5;
      const frames = packageLimits?.frames || 5;
      const years = hostingYears || 5;
      
      return {
        to: email,
        replyTo: reply_to || 'memoriqr.global@gmail.com',
        from_name: sender_name || 'MemoriQR',
        subject: `Your memorial for ${memorialName} is now live 🕊️`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); padding: 30px; text-align: center;">
<h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300;">MemoriQR</h1>
<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Preserving Memories Forever</p>
</div>

<div style="padding: 30px; background: #fff;">
<h2 style="color: #333; margin: 0 0 20px;">Your Memorial for ${memorialName} is Now Live! 🕊️</h2>

<p style="color: #555; line-height: 1.6;">We're honoured to let you know that the memorial page for <strong>${memorialName}</strong> has been successfully created and is now live.</p>

<div style="background: #f9f7f4; border-left: 4px solid #8B7355; padding: 20px; margin: 20px 0;">
<p style="color: #666; margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Memorial Page</p>
<table style="width: 100%; border-collapse: collapse;">
<tr>
<td style="padding: 0;">
<a href="${memorialUrl}" style="color: #8B7355; font-size: 16px; text-decoration: none; word-break: break-all;">${memorialUrl}</a>
</td>
<td style="width: 80px; text-align: right; vertical-align: middle;">
<a href="${memorialUrl}" onclick="navigator.clipboard.writeText('${memorialUrl}'); return false;" style="display: inline-block; background: #8B7355; color: #fff; text-decoration: none; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">📋 Copy</a>
</td>
</tr>
</table>
<p style="color: #888; font-size: 13px; margin: 12px 0 0; font-style: italic;">💝 Share this link with family and friends so they can visit the digital memorial.</p>
</div>

<div style="text-align: center; margin: 25px 0;">
<a href="${memorialUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px;">View Memorial Page</a>
</div>

<div style="background: #f9f7f4; padding: 25px; border-radius: 8px; margin: 25px 0;">
<h3 style="color: #333; margin: 0 0 15px; font-size: 18px;">📦 Your ${years}-Year Package Includes</h3>
<table style="width: 100%;">
<tr>
<td style="padding: 8px 0; color: #555; font-size: 14px;"><span style="color: #5A7F5A;">✓</span> ${photos} curated photos</td>
<td style="padding: 8px 0; color: #555; font-size: 14px;"><span style="color: #5A7F5A;">✓</span> ${videos} videos</td>
</tr>
<tr>
<td style="padding: 8px 0; color: #555; font-size: 14px;"><span style="color: #5A7F5A;">✓</span> ${themes} memorial themes</td>
<td style="padding: 8px 0; color: #555; font-size: 14px;"><span style="color: #5A7F5A;">✓</span> ${frames} photo frames</td>
</tr>
</table>
</div>

<div style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0;">
<h3 style="color: #333; margin: 0 0 15px;">Your QR Code</h3>
<img src="${qrCodeUrl}" alt="QR Code for ${memorialName}" style="width: 180px; height: 180px; margin: 0 auto 15px; display: block;">
<p style="color: #777; font-size: 13px; margin: 0 0 15px;">Scan this QR code with any smartphone camera<br>to visit the memorial page instantly.</p>
<a href="${qrCodeUrl}" style="color: #8B7355; font-size: 14px;">Download QR Code</a>
</div>

<div style="background: #fefcf9; padding: 25px; border-radius: 8px; margin: 25px 0;">
<h3 style="color: #333; margin: 0 0 12px;">✏️ Need to Make Changes?</h3>
<p style="color: #555; line-height: 1.6; margin: 0 0 15px; font-size: 14px;">You can update photos, change the theme, add videos, or edit text at any time using your private edit link:</p>
<a href="${editUrl}" style="display: inline-block; background-color: #fff; border: 2px solid #8B7355; color: #8B7355; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 14px;">Edit Memorial</a>
<p style="color: #999; font-size: 12px; margin: 15px 0 0;">⚠️ Keep this link private - anyone with it can edit the memorial.</p>
</div>

<p style="color: #555; line-height: 1.6;">If you have any questions, just reply to this email and we'll be happy to help.</p>
</div>

<div style="background: #f5f5f0; padding: 25px; text-align: center;">
<p style="color: #888; font-size: 13px; margin: 0 0 10px;">With deepest sympathy,<br><strong style="color: #8B7355;">The MemoriQR Team</strong></p>
<p style="color: #aaa; font-size: 12px; margin: 0;"><a href="https://memoriqr.co.nz" style="color: #8B7355; text-decoration: none;">memoriqr.co.nz</a></p>
</div>
</div>`,
        text: `Your Memorial for ${memorialName} is Now Live!

We're honoured to let you know that the memorial page for ${memorialName} has been successfully created and is now live.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MEMORIAL PAGE:
${memorialUrl}

💝 Share this link with family and friends so they can visit the digital memorial.

QR CODE (download):
${qrCodeUrl}

EDIT MEMORIAL:
${editUrl}
(Keep this link private - anyone with it can edit the memorial)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR ${years}-YEAR PACKAGE INCLUDES:
✓ ${photos} curated photos
✓ ${videos} videos
✓ ${themes} memorial themes
✓ ${frames} photo frames

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If you have any questions, just reply to this email and we'll be happy to help.

With deepest sympathy,
The MemoriQR Team

memoriqr.co.nz`
      };
    }
    
    // Edit verification email (MFA)
    if (type === 'edit_verification') {
      const { customer_email, customer_name, deceased_name, verification_code, expires_in, expires_at, sender_name, reply_to } = body;
      return {
        to: customer_email,
        replyTo: reply_to || 'memoriqr.global@gmail.com',
        from_name: sender_name || 'MemoriQR',
        subject: `Your MemoriQR Verification Code: ${verification_code}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #8B7355;">Your Verification Code 🔐</h2>
<p>Hi ${customer_name},</p>
<p>You requested to edit the memorial for <strong>${deceased_name}</strong>.</p>
<div style="background: #f5f5f0; border: 2px dashed #8B7355; padding: 30px; text-align: center; margin: 20px 0; border-radius: 8px;">
<p style="margin: 0 0 10px; color: #666;">Your Code</p>
<p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">${verification_code}</p>
</div>
<p style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px;">
⏰ This code expires in <strong>${expires_in}</strong> (at ${expires_at})
</p>
<p style="color: #777; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
</div>`,
        text: `Hi ${customer_name},\n\nYour verification code to edit the memorial for ${deceased_name} is:\n\n    ${verification_code}\n\nThis code expires in ${expires_in} (at ${expires_at}).\n\nIf you didn't request this code, please ignore this email.`
      };
    }
    
    // =====================================================
    // PARTNER PORTAL EMAILS
    // =====================================================
    
    // Partner login code (magic link OTP)
    if (type === 'partner_login_code') {
      const { partner_email, partner_name, login_code, expires_in } = body;
      return {
        to: partner_email,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR Partner Portal',
        subject: `Your Partner Login Code: ${login_code}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #2d5a27 0%, #3d7a35 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">🔐 Partner Portal Login</h1>
</div>
<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${partner_name},</p>
<p style="color: #555; line-height: 1.6;">Use this code to log in to your MemoriQR Partner Portal:</p>

<div style="background: #f5f5f0; border: 2px dashed #2d5a27; padding: 30px; text-align: center; margin: 25px 0; border-radius: 8px;">
<p style="margin: 0 0 10px; color: #666; font-size: 14px;">Your Login Code</p>
<p style="font-size: 42px; font-weight: bold; letter-spacing: 10px; margin: 0; font-family: monospace; color: #2d5a27;">${login_code}</p>
</div>

<p style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
⏰ This code expires in <strong>${expires_in}</strong>
</p>

<p style="color: #777; font-size: 14px; margin-top: 20px;">If you didn't request this code, please ignore this email or contact us if you have concerns.</p>
</div>
<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">MemoriQR Partner Portal</p>
</div>
</div>`,
        text: `Hi ${partner_name},\n\nYour MemoriQR Partner Portal login code is:\n\n    ${login_code}\n\nThis code expires in ${expires_in}.\n\nIf you didn't request this code, please ignore this email.`
      };
    }
    
    // Partner code batch request (notification to admin)
    if (type === 'partner_code_request') {
      const { partner_name, partner_email, batch_number, quantity, product_type, hosting_duration, unit_cost, total_cost, notes } = body;
      
      const productDisplay = getProductDisplay(product_type);
      
      return {
        to: 'memoriqr.global@gmail.com',
        replyTo: partner_email,
        from_name: 'MemoriQR Partner Portal',
        subject: `📦 New Code Request: ${quantity}x ${productDisplay} from ${partner_name}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0;">📦 New Partner Code Request</h1>
</div>

<div style="padding: 25px; background: #fff; border: 1px solid #ddd; border-top: none;">

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
<tr style="background: #f9f7f4;"><td colspan="2" style="padding: 12px; font-weight: bold; border: 1px solid #ddd;">Request Details</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee; width: 40%;">Batch Number</td><td style="padding: 10px; border: 1px solid #eee; font-weight: 500;">${batch_number}</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Partner</td><td style="padding: 10px; border: 1px solid #eee;">${partner_name}<br><a href="mailto:${partner_email}" style="color: #8B7355;">${partner_email}</a></td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Quantity</td><td style="padding: 10px; border: 1px solid #eee; font-weight: 500;">${quantity} codes</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Product</td><td style="padding: 10px; border: 1px solid #eee;">${productDisplay}</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Hosting</td><td style="padding: 10px; border: 1px solid #eee;">${hosting_duration} years</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Unit Cost</td><td style="padding: 10px; border: 1px solid #eee;">$${unit_cost.toFixed(2)} NZD</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Total Cost</td><td style="padding: 10px; border: 1px solid #eee; color: #2d5a27; font-weight: bold;">$${total_cost.toFixed(2)} NZD</td></tr>
</table>

${notes ? `<div style="background: #f9f7f4; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
<strong>Partner Notes:</strong><br>
<p style="margin: 10px 0 0; color: #555;">${notes}</p>
</div>` : ''}

<div style="background: #f0f8ff; border: 1px solid #b8d4f0; padding: 15px; border-radius: 8px;">
<strong>📋 Admin Actions:</strong>
<p style="margin: 10px 0 5px;">1. Review and approve the batch request</p>
<p style="margin: 5px 0;">2. Generate codes using admin API</p>
<p style="margin: 5px 0 0;">3. Partner will be notified automatically</p>
</div>

</div>
<div style="background: #f9f7f4; padding: 15px; text-align: center; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">Partner Portal Admin Notification</p>
</div>
</div>`,
        text: `NEW PARTNER CODE REQUEST\n\nBatch: ${batch_number}\nPartner: ${partner_name} (${partner_email})\nQuantity: ${quantity} codes\nProduct: ${productDisplay}\nHosting: ${hosting_duration} years\nUnit Cost: $${unit_cost.toFixed(2)} NZD\nTotal: $${total_cost.toFixed(2)} NZD\n${notes ? `\nNotes: ${notes}` : ''}\n\nACTIONS:\n1. Approve batch request\n2. Generate codes via admin API\n3. Partner will be notified`
      };
    }
    
    // Partner codes generated (notification to partner)
    if (type === 'partner_codes_generated') {
      const { partner_email, partner_name, batch_number, quantity, product_type, hosting_duration, codes_list, portal_url } = body;
      
      const productDisplay = getProductDisplay(product_type);
      
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
    
    // NOTE: The following email types are handled by a SEPARATE Pipedream workflow:
    // - referral_codes_generated (lead gen codes)
    // - partner_codes_generated (wholesale activation codes)
    // See: pipedream/partner-codes-notification-handler.js
    // Requires env var: PIPEDREAM_PARTNER_CODES_WEBHOOK_URL
    
    // Partner application notification (to admin)
    // Note: Data comes at root level (body.X), not nested (body.data.X)
    if (type === 'partner_application') {
      const { businessName, contactName, email, phone, businessType, message, expectedQrSales, expectedNfcSales, baseUrl = 'https://memoriqr.co.nz' } = body;
      
      const businessTypeLabels = {
        vet: 'Veterinary Clinic',
        pet_cremation: 'Pet Cremation Service',
        funeral_director: 'Funeral Director',
        cemetery: 'Cemetery / Memorial Park',
        retailer: 'Retail Store',
        other: 'Other'
      };
      
      return {
        to: 'memoriqr.global@gmail.com',
        replyTo: email,
        from_name: 'MemoriQR Partner Portal',
        subject: `🆕 New Partner Application: ${businessName}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">🆕 New Partner Application</h1>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #555; font-size: 16px;">A new partner application has been submitted and requires your review.</p>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
<tr style="background: #f9f7f4;"><td colspan="2" style="padding: 12px; font-weight: bold; border: 1px solid #ddd;">Application Details</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee; width: 35%;">Business Name</td><td style="padding: 10px; border: 1px solid #eee; font-weight: 500;">${businessName}</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Business Type</td><td style="padding: 10px; border: 1px solid #eee;">${businessTypeLabels[businessType] || businessType}</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Contact Name</td><td style="padding: 10px; border: 1px solid #eee;">${contactName}</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Email</td><td style="padding: 10px; border: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">Phone</td><td style="padding: 10px; border: 1px solid #eee;">${phone || 'Not provided'}</td></tr>
</table>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
<tr style="background: #e8f5e9;"><td colspan="2" style="padding: 12px; font-weight: bold; border: 1px solid #ddd;">📊 Expected Monthly Sales</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee; width: 50%;">QR Memorial Plates</td><td style="padding: 10px; border: 1px solid #eee; font-weight: 500;">${expectedQrSales || 'Not specified'}</td></tr>
<tr><td style="padding: 10px; border: 1px solid #eee;">NFC Tags</td><td style="padding: 10px; border: 1px solid #eee; font-weight: 500;">${expectedNfcSales || 'Not specified'}</td></tr>
</table>

${message ? `<div style="background: #f9f7f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
<p style="font-weight: bold; margin: 0 0 10px; color: #333;">Message from Applicant:</p>
<p style="color: #555; margin: 0; line-height: 1.6;">${message}</p>
</div>` : ''}

<div style="background: #f0f8ff; border: 1px solid #b8d4f0; padding: 15px; border-radius: 8px; margin-top: 20px;">
<strong>📋 Next Steps:</strong>
<p style="margin: 10px 0 5px;">1. Review the application details above</p>
<p style="margin: 5px 0;">2. Contact applicant if more info needed</p>
<p style="margin: 5px 0 0;">3. Approve or reject in the admin dashboard</p>
</div>

<div style="text-align: center; margin-top: 25px;">
<a href="${baseUrl}/admin/partners?status=pending" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #fff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-size: 16px; font-weight: bold;">Review Pending Applications</a>
</div>

</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">MemoriQR Admin Notification</p>
</div>
</div>`,
        text: `New Partner Application\n\nBusiness: ${businessName}\nType: ${businessTypeLabels[businessType] || businessType}\nContact: ${contactName}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nExpected Monthly Sales:\n- QR Plates: ${expectedQrSales || 'Not specified'}\n- NFC Tags: ${expectedNfcSales || 'Not specified'}\n${message ? `\nMessage: ${message}\n` : ''}\n\nReview pending applications: ${baseUrl}/admin/partners?status=pending`
      };
    }
    
    // Partner application received (confirmation to applicant)
    if (type === 'partner_application_received') {
      const { businessName, contactName } = body.data;
      
      return {
        to: body.to,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR',
        subject: `Application Received - Welcome to MemoriQR`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #4BA4A4 0%, #3d8a8a 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">Application Received! ✓</h1>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${contactName},</p>

<p style="color: #555; line-height: 1.6;">Thank you for your interest in becoming a MemoriQR partner! We've received your application for <strong>${businessName}</strong>.</p>

<div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
<p style="margin: 0; color: #2e7d32;"><strong>What happens next?</strong></p>
<p style="margin: 10px 0 0; color: #555;">Our team will review your application within 1-2 business days. You'll receive an email once a decision has been made.</p>
</div>

<p style="color: #555; line-height: 1.6;">In the meantime, if you have any questions about our partner program, feel free to reply to this email.</p>

<p style="color: #555; line-height: 1.6;">We look forward to potentially working with you!</p>

<p style="color: #555; margin-top: 30px;">Warm regards,<br><strong>The MemoriQR Team</strong></p>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">MemoriQR Partner Program</p>
</div>
</div>`,
        text: `Hi ${contactName},\n\nThank you for your interest in becoming a MemoriQR partner! We've received your application for ${businessName}.\n\nWhat happens next?\nOur team will review your application within 1-2 business days. You'll receive an email once a decision has been made.\n\nIn the meantime, if you have any questions about our partner program, feel free to reply to this email.\n\nWe look forward to potentially working with you!\n\nWarm regards,\nThe MemoriQR Team`
      };
    }
    
    // Partner approved notification
    if (type === 'partner_approved') {
      const { businessName, contactName, loginUrl } = body.data;
      
      return {
        to: body.to,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR',
        subject: `🎉 Welcome to MemoriQR Partners!`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #2d5a27 0%, #3d7a35 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">🎉 You're Approved!</h1>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${contactName},</p>

<p style="color: #555; line-height: 1.6;">Great news! Your partner application for <strong>${businessName}</strong> has been approved. Welcome to the MemoriQR partner family!</p>

<div style="background: #e8f5e9; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
<p style="font-size: 18px; font-weight: bold; color: #2d5a27; margin: 0 0 10px;">Your Partner Portal is Ready</p>
<p style="color: #555; margin: 0 0 20px;">Log in to access your dashboard, request activation codes, and track commissions.</p>
<a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #2d5a27 0%, #3d7a35 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px;">Access Partner Portal</a>
</div>

<div style="background: #fff8e1; border-left: 4px solid #ffa000; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
<p style="font-weight: bold; color: #e65100; margin: 0 0 8px 0;">⚡ Important: Complete Your Profile</p>
<p style="color: #555; margin: 0; line-height: 1.5;">Before you can receive commission payouts, please log in and add your <strong>business address</strong> and <strong>banking details</strong> in your Account Settings.</p>
</div>

<p style="font-weight: bold; color: #333; margin-top: 25px;">What you can do:</p>
<ul style="color: #555; line-height: 1.8;">
<li>View your dashboard with activation statistics</li>
<li>Request batches of activation codes at wholesale prices</li>
<li>Track commissions on customer activations</li>
<li>Download marketing materials for your business</li>
<li><strong>Add your business address and bank details in Settings</strong></li>
</ul>

<p style="color: #555; line-height: 1.6; margin-top: 25px;">If you have any questions about getting started, just reply to this email and we'll be happy to help.</p>

<p style="color: #555; margin-top: 30px;">Welcome aboard!<br><strong>The MemoriQR Team</strong></p>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">MemoriQR Partner Program</p>
</div>
</div>`,
        text: `Hi ${contactName},\n\nGreat news! Your partner application for ${businessName} has been approved. Welcome to the MemoriQR partner family!\n\nYour Partner Portal is Ready:\n${loginUrl}\n\n⚡ IMPORTANT: Complete Your Profile\nBefore you can receive commission payouts, please log in and add your business address and banking details in your Account Settings.\n\nWhat you can do:\n- View your dashboard with activation statistics\n- Request batches of activation codes at wholesale prices\n- Track commissions on customer activations\n- Download marketing materials for your business\n- Add your business address and bank details in Settings\n\nIf you have any questions about getting started, just reply to this email and we'll be happy to help.\n\nWelcome aboard!\nThe MemoriQR Team`
      };
    }
    
    // Partner rejected notification
    if (type === 'partner_rejected') {
      const { businessName, contactName } = body.data;
      
      return {
        to: body.to,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR',
        subject: `Update on Your MemoriQR Partner Application`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #4BA4A4 0%, #3d8a8a 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">Application Update</h1>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${contactName},</p>

<p style="color: #555; line-height: 1.6;">Thank you for your interest in becoming a MemoriQR partner. After reviewing your application for <strong>${businessName}</strong>, we've decided not to proceed at this time.</p>

<p style="color: #555; line-height: 1.6;">This decision may be based on factors such as market coverage, business alignment, or current partner capacity in your area.</p>

<p style="color: #555; line-height: 1.6;">We appreciate you taking the time to apply, and we encourage you to reapply in the future if your circumstances change.</p>

<p style="color: #555; line-height: 1.6;">If you have any questions, please don't hesitate to reach out.</p>

<p style="color: #555; margin-top: 30px;">Best regards,<br><strong>The MemoriQR Team</strong></p>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">MemoriQR Partner Program</p>
</div>
</div>`,
        text: `Hi ${contactName},\n\nThank you for your interest in becoming a MemoriQR partner. After reviewing your application for ${businessName}, we've decided not to proceed at this time.\n\nThis decision may be based on factors such as market coverage, business alignment, or current partner capacity in your area.\n\nWe appreciate you taking the time to apply, and we encourage you to reapply in the future if your circumstances change.\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\nThe MemoriQR Team`
      };
    }

    // Partner reactivated notification
    if (type === 'partner_reactivated') {
      const { businessName, contactName, loginUrl } = body.data;
      
      return {
        to: body.to,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR',
        subject: `🎉 Welcome Back to MemoriQR Partners!`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #2d5a27 0%, #3d7a35 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">🎉 Welcome Back!</h1>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${contactName},</p>

<p style="color: #555; line-height: 1.6;">Great news! Your partner account for <strong>${businessName}</strong> has been reactivated. We're glad to have you back in the MemoriQR partner family!</p>

<div style="background: #e8f5e9; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
<p style="font-size: 18px; font-weight: bold; color: #2d5a27; margin: 0 0 10px;">Your Partner Portal is Ready</p>
<p style="color: #555; margin: 0 0 20px;">Log in to access your dashboard, request activation codes, and track commissions.</p>
<a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #2d5a27 0%, #3d7a35 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px;">Access Partner Portal</a>
</div>

<p style="font-weight: bold; color: #333; margin-top: 25px;">What you can do:</p>
<ul style="color: #555; line-height: 1.8;">
<li>View your dashboard with activation statistics</li>
<li>Request batches of activation codes at wholesale prices</li>
<li>Track commissions on customer activations</li>
<li>Download marketing materials for your business</li>
</ul>

<p style="color: #555; line-height: 1.6; margin-top: 25px;">If you have any questions, just reply to this email and we'll be happy to help.</p>

<p style="color: #555; margin-top: 30px;">Welcome back!<br><strong>The MemoriQR Team</strong></p>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">MemoriQR Partner Program</p>
</div>
</div>`,
        text: `Hi ${contactName},\n\nGreat news! Your partner account for ${businessName} has been reactivated. We're glad to have you back in the MemoriQR partner family!\n\nYour Partner Portal is Ready:\n${loginUrl}\n\nWhat you can do:\n- View your dashboard with activation statistics\n- Request batches of activation codes at wholesale prices\n- Track commissions on customer activations\n- Download marketing materials for your business\n\nIf you have any questions, just reply to this email and we'll be happy to help.\n\nWelcome back!\nThe MemoriQR Team`
      };
    }

    // Partner terms updated notification (discount, commission, or shipping changed)
    if (type === 'partner_terms_updated') {
      const { businessName, contactName, changes, portalUrl } = body.data;
      
      // Build changes list
      let changesList = '';
      let changesText = '';
      
      if (changes.discount) {
        changesList += `<tr><td style="padding: 10px; border: 1px solid #eee;">Product Discount</td><td style="padding: 10px; border: 1px solid #eee; text-decoration: line-through; color: #999;">${changes.discount.old}%</td><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #2d5a27;">${changes.discount.new}%</td></tr>`;
        changesText += `- Product Discount: ${changes.discount.old}% → ${changes.discount.new}%\n`;
      }
      if (changes.commission) {
        changesList += `<tr><td style="padding: 10px; border: 1px solid #eee;">Commission Rate</td><td style="padding: 10px; border: 1px solid #eee; text-decoration: line-through; color: #999;">${changes.commission.old}%</td><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #2d5a27;">${changes.commission.new}%</td></tr>`;
        changesText += `- Commission Rate: ${changes.commission.old}% → ${changes.commission.new}%\n`;
      }
      if (changes.freeShipping) {
        const oldShipping = changes.freeShipping.old ? 'Free Shipping' : 'Standard Shipping';
        const newShipping = changes.freeShipping.new ? 'Free Shipping' : 'Standard Shipping';
        changesList += `<tr><td style="padding: 10px; border: 1px solid #eee;">Shipping</td><td style="padding: 10px; border: 1px solid #eee; text-decoration: line-through; color: #999;">${oldShipping}</td><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #2d5a27;">${newShipping}</td></tr>`;
        changesText += `- Shipping: ${oldShipping} → ${newShipping}\n`;
      }
      
      return {
        to: body.to,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR',
        subject: `📋 Your Partner Terms Have Been Updated`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #4BA4A4 0%, #3d8a8a 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 24px;">📋 Partner Terms Updated</h1>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${contactName},</p>

<p style="color: #555; line-height: 1.6;">We're writing to let you know that your partner terms for <strong>${businessName}</strong> have been updated.</p>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
<tr style="background: #f9f7f4;">
<td style="padding: 12px; font-weight: bold; border: 1px solid #ddd;">Term</td>
<td style="padding: 12px; font-weight: bold; border: 1px solid #ddd;">Previous</td>
<td style="padding: 12px; font-weight: bold; border: 1px solid #ddd;">New</td>
</tr>
${changesList}
</table>

<p style="color: #555; line-height: 1.6;">These changes are effective immediately and will apply to all future orders and commissions.</p>

<div style="text-align: center; margin: 25px 0;">
<a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #2d5a27 0%, #3d7a35 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px;">View Partner Portal</a>
</div>

<p style="color: #555; line-height: 1.6;">If you have any questions about these changes, please reply to this email and we'll be happy to discuss.</p>

<p style="color: #555; margin-top: 30px;">Best regards,<br><strong>The MemoriQR Team</strong></p>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">MemoriQR Partner Program</p>
</div>
</div>`,
        text: `Hi ${contactName},\n\nWe're writing to let you know that your partner terms for ${businessName} have been updated.\n\nCHANGES:\n${changesText}\nThese changes are effective immediately and will apply to all future orders and commissions.\n\nView your Partner Portal: ${portalUrl}\n\nIf you have any questions about these changes, please reply to this email and we'll be happy to discuss.\n\nBest regards,\nThe MemoriQR Team`
      };
    }

    // Commission payout statement notification
    if (type === 'commission_payout_statement') {
      const { 
        partner_name, 
        partner_email, 
        payout_number, 
        period_start, 
        period_end, 
        total_commissions, 
        total_amount, 
        payment_reference,
        bank_name,
        bank_account_last4
      } = body;

      return {
        to: partner_email,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR',
        subject: `💰 Your MemoriQR Commission Payout - ${payout_number}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 22px;">💰 Commission Payout Processed</h1>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${partner_name},</p>

<p style="color: #555; line-height: 1.6;">Great news! Your commission payout has been processed and the funds are on their way to you.</p>

<div style="background: #ecfdf5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
<p style="color: #059669; font-size: 14px; margin: 0 0 5px 0;">PAYOUT AMOUNT</p>
<p style="color: #047857; font-size: 32px; font-weight: bold; margin: 0;">$${total_amount} NZD</p>
</div>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
<tr>
<td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Payout Reference</td>
<td style="padding: 10px; border-bottom: 1px solid #eee; color: #333; text-align: right; font-weight: bold;">${payout_number}</td>
</tr>
<tr>
<td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Period</td>
<td style="padding: 10px; border-bottom: 1px solid #eee; color: #333; text-align: right;">${period_start} to ${period_end}</td>
</tr>
<tr>
<td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Commissions Included</td>
<td style="padding: 10px; border-bottom: 1px solid #eee; color: #333; text-align: right;">${total_commissions}</td>
</tr>
<tr>
<td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Bank Transfer Ref</td>
<td style="padding: 10px; border-bottom: 1px solid #eee; color: #333; text-align: right;">${payment_reference}</td>
</tr>
<tr>
<td style="padding: 10px; color: #666;">Paid To</td>
<td style="padding: 10px; color: #333; text-align: right;">${bank_name} ****${bank_account_last4}</td>
</tr>
</table>

<p style="color: #555; line-height: 1.6;">Funds typically arrive within 1-2 business days. You can view your full commission history in your <a href="https://memoriqr.co.nz/partner/commissions" style="color: #059669;">Partner Portal</a>.</p>

<p style="color: #555; margin-top: 25px;">Thank you for being a valued MemoriQR partner! 🙏</p>

<p style="color: #555;">Regards,<br><strong>The MemoriQR Team</strong></p>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">MemoriQR Partner Program | Questions? Reply to this email</p>
</div>
</div>`,
        text: `Hi ${partner_name},\n\nGreat news! Your commission payout has been processed.\n\nPAYOUT DETAILS:\n- Payout Reference: ${payout_number}\n- Amount: $${total_amount} NZD\n- Period: ${period_start} to ${period_end}\n- Commissions: ${total_commissions}\n- Bank Transfer Ref: ${payment_reference}\n- Paid To: ${bank_name} ****${bank_account_last4}\n\nFunds typically arrive within 1-2 business days.\n\nView your commission history: https://memoriqr.co.nz/partner/commissions\n\nThank you for being a valued MemoriQR partner!\n\nRegards,\nThe MemoriQR Team`
      };
    }

    // Partner suspended notification
    if (type === 'partner_suspended') {
      const { businessName, contactName, reason } = body.data;

      return {
        to: body.to,
        replyTo: 'partners@memoriqr.co.nz',
        from_name: 'MemoriQR',
        subject: `Your MemoriQR Partner Account Has Been Suspended`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #8b0000 0%, #b22222 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: #fff; margin: 0; font-size: 22px;">⚠️ Partner Account Suspended</h1>
</div>

<div style="padding: 30px; background: #fff; border: 1px solid #ddd; border-top: none;">
<p style="color: #333; font-size: 16px;">Hi ${contactName},</p>

<p style="color: #555; line-height: 1.6;">Your MemoriQR partner account for <strong>${businessName}</strong> has been suspended.</p>

<div style="background: #fff3cd; border-left: 4px solid #f0ad4e; padding: 15px; border-radius: 4px; margin: 20px 0;">
<strong>Reason:</strong> ${reason}
</div>

<p style="color: #555; line-height: 1.6;">If you believe this is a mistake or would like to discuss this suspension, please reply to this email.</p>

<p style="color: #555; margin-top: 25px;">Regards,<br><strong>The MemoriQR Team</strong></p>
</div>

<div style="background: #f5f5f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
<p style="color: #888; font-size: 12px; margin: 0;">MemoriQR Partner Program</p>
</div>
</div>`,
        text: `Hi ${contactName},\n\nYour MemoriQR partner account for ${businessName} has been suspended.\n\nReason: ${reason}\n\nIf you believe this is a mistake or would like to discuss this suspension, please reply to this email.\n\nRegards,\nThe MemoriQR Team`
      };
    }
    
    // Unknown type - skip
    // NOTE: referral_redeemed is handled by a SEPARATE Pipedream workflow
    // URL: https://eo5xpf69y0qbaul.m.pipedream.net
    // This was moved out due to main workflow size limits in Pipedream
    $.flow.exit(`Unknown type: ${type}`);
  }
});
