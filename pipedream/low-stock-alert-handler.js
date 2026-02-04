// Low Stock Alert Handler for Pipedream
// Receives webhook when inventory drops below threshold
// Sends email notification to admin

export default defineComponent({
  async run({ steps, $ }) {
    const payload = steps.trigger.event.body;
    
    // Only process low_stock_alert events
    if (payload.type !== 'low_stock_alert') {
      return { skipped: true, reason: 'Not a low stock alert' };
    }

    const item = payload.item;
    
    // Format the email
    const subject = `⚠️ Low Stock Alert: ${item.product_type}${item.variant ? ` - ${item.variant}` : ''}`;
    
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #8B7355; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">MemoriQR Low Stock Alert</h1>
        </div>
        
        <div style="padding: 30px; background: #fff;">
          <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px; color: #92400E; font-size: 18px;">
              ⚠️ Stock Level Warning
            </h2>
            <p style="margin: 0; color: #78350F;">
              One of your products has dropped below the minimum stock threshold.
            </p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #6B7280;">Product</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; font-weight: 600;">${item.product_type}${item.variant ? ` - ${item.variant}` : ''}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #6B7280;">Available Stock</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; font-weight: 600; color: #DC2626;">${item.quantity_available}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #6B7280;">Threshold</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">${item.low_stock_threshold}</td>
            </tr>
            ${item.supplier_name ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #6B7280;">Supplier</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">${item.supplier_name}</td>
            </tr>
            ` : ''}
          </table>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://memoriqr.co.nz/admin/inventory" 
               style="display: inline-block; background: #8B7355; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Inventory
            </a>
            <a href="https://memoriqr.co.nz/admin/purchases" 
               style="display: inline-block; background: #E5E7EB; color: #374151; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-left: 10px;">
              Create Purchase
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #9CA3AF; font-size: 12px;">
          <p>This is an automated alert from your MemoriQR inventory system.</p>
        </div>
      </div>
    `;

    // Return the email content for the next step (email send)
    return {
      success: true,
      email: {
        to: 'admin@memoriqr.co.nz', // Update with your admin email
        subject: subject,
        html: htmlBody,
      },
      item: item,
    };
  },
});
