/**
 * Pipedream Email Handler for MemoriQR
 * 
 * This is the single source of truth for the Pipedream workflow code.
 * Copy this code into your Pipedream workflow's Node.js step.
 * 
 * Last updated: January 19, 2026
 * 
 * Handles the following email types:
 * - contact_form: Contact form submissions → info@memoriqr.co.nz
 * - order_confirmation: Order confirmation → customer email
 * - admin_order_notification: Fulfillment notification → memoriqr.global@gmail.com
 * - memorial_created: Memorial live notification → customer email
 * - edit_verification: MFA verification code → customer email
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
<p style="margin: 0 0 15px;"><strong>Activation Code:</strong><br>
<code style="background: #f0f0f0; padding: 10px 20px; border-radius: 4px; font-size: 20px; font-weight: bold; letter-spacing: 3px; display: inline-block; margin-top: 5px;">${activation_code}</code></p>
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
        text: `NEW ORDER: ${order_number}\n\nPRODUCT: ${productDisplay}\nHOSTING: ${hosting_duration} years\nAMOUNT: $${amount_paid} ${currency}\nMEMORIAL FOR: ${deceased_name}\n\nFULFILLMENT DETAILS:\nActivation Code: ${activation_code}\nNFC URL: ${nfc_url}\nMemorial Page: ${memorial_url}\nQR Code: ${qr_code_url || 'N/A'}\n\nCUSTOMER:\n${customer_name}\n${customer_email}\n\nSHIP TO:\n${shippingText}\n\nACTION CHECKLIST:\n- Program NFC tag with URL: ${nfc_url}\n- Print QR code for plate (if applicable)\n- Pack and ship`
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
<a href="${memorialUrl}" style="color: #8B7355; font-size: 16px; text-decoration: none;">${memorialUrl}</a>
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
    
    // Unknown type - skip
    $.flow.exit(`Unknown type: ${type}`);
  }
});
