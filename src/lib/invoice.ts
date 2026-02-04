import { createClient } from '@supabase/supabase-js';
import { TIER_PRICING, type TierType } from './pricing';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Business details for invoices
export const BUSINESS_INFO = {
  name: 'MemoriQR',
  legalName: 'MemoriQR Limited',
  address: {
    line1: 'New Zealand',
    city: '',
    postalCode: '',
    country: 'New Zealand',
  },
  email: 'info@memoriqr.co.nz',
  website: 'https://memoriqr.co.nz',
  // NZ businesses under $60k don't need GST registration
  gstNumber: null, // Add when registered
  bankAccount: '', // For manual payments
};

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  orderId?: string;
  customerId?: string;
  invoiceType: 'order' | 'renewal' | 'partner_batch' | 'refund';
  billingName: string;
  billingEmail: string;
  billingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discountAmount?: number;
  discountCode?: string;
  taxAmount?: number;
  taxRate?: number;
  totalAmount: number;
  currency: string;
  paymentMethod?: string;
  stripePaymentId?: string;
  paidAt?: string;
  notes?: string;
}

// Generate invoice number
async function generateInvoiceNumber(): Promise<string> {
  const { data, error } = await supabase.rpc('generate_invoice_number');
  if (error) throw error;
  return data;
}

// Create invoice for an order
export async function createOrderInvoice(params: {
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress?: Record<string, string>;
  productType: string;
  hostingDuration: number;
  deceasedName: string;
  amountPaid: number;
  currency: string;
  discountAmount?: number;
  discountCode?: string;
  stripePaymentId?: string;
}): Promise<InvoiceData | null> {
  try {
    const invoiceNumber = await generateInvoiceNumber();
    
    // Determine tier and product name
    let productName = 'MemoriQR Memorial';
    let productDescription = '';
    
    // Map product type to readable name
    const productNames: Record<string, string> = {
      nfc_only: 'MemoriQR NFC Tag',
      qr_only: 'MemoriQR QR Plate',
      both: 'MemoriQR Premium (QR Plate + NFC Tag)',
    };
    
    productName = productNames[params.productType] || productName;
    productDescription = `Memorial for ${params.deceasedName} - ${params.hostingDuration} year hosting`;
    
    const lineItems: InvoiceLineItem[] = [
      {
        description: `${productName}\n${productDescription}`,
        quantity: 1,
        unitPrice: params.amountPaid + (params.discountAmount || 0),
        total: params.amountPaid + (params.discountAmount || 0),
      },
    ];
    
    const subtotal = params.amountPaid + (params.discountAmount || 0);
    
    const invoiceData: InvoiceData = {
      invoiceNumber,
      orderId: params.orderId,
      customerId: params.customerId,
      invoiceType: 'order',
      billingName: params.customerName,
      billingEmail: params.customerEmail,
      billingAddress: params.shippingAddress,
      lineItems,
      subtotal,
      discountAmount: params.discountAmount || 0,
      discountCode: params.discountCode,
      taxAmount: 0, // No GST until registered
      taxRate: 0,
      totalAmount: params.amountPaid,
      currency: params.currency,
      paymentMethod: 'Stripe',
      stripePaymentId: params.stripePaymentId,
      paidAt: new Date().toISOString(),
    };
    
    // Insert into database
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceData.invoiceNumber,
        order_id: invoiceData.orderId,
        customer_id: invoiceData.customerId,
        invoice_type: invoiceData.invoiceType,
        billing_name: invoiceData.billingName,
        billing_email: invoiceData.billingEmail,
        billing_address: invoiceData.billingAddress,
        line_items: invoiceData.lineItems,
        subtotal: invoiceData.subtotal,
        discount_amount: invoiceData.discountAmount,
        discount_code: invoiceData.discountCode,
        tax_amount: invoiceData.taxAmount,
        tax_rate: invoiceData.taxRate,
        total_amount: invoiceData.totalAmount,
        currency: invoiceData.currency,
        payment_status: 'paid',
        payment_method: invoiceData.paymentMethod,
        stripe_payment_id: invoiceData.stripePaymentId,
        paid_at: invoiceData.paidAt,
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Failed to create invoice:', error);
      return null;
    }
    
    // Update order with invoice ID
    if (invoice) {
      await supabase
        .from('orders')
        .update({ invoice_id: invoice.id })
        .eq('id', params.orderId);
    }
    
    return invoiceData;
  } catch (error) {
    console.error('Invoice creation error:', error);
    return null;
  }
}

// Generate HTML invoice
export function generateInvoiceHTML(invoice: InvoiceData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: invoice.currency,
    }).format(amount);
  };
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return new Date(dateStr).toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  const billingAddressLines = invoice.billingAddress ? [
    invoice.billingAddress.line1,
    invoice.billingAddress.line2,
    [invoice.billingAddress.city, invoice.billingAddress.postalCode].filter(Boolean).join(' '),
    invoice.billingAddress.country,
  ].filter(Boolean) : [];
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #8B7355;
    }
    .logo {
      height: 50px;
      width: auto;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      margin: 0;
      color: #333;
      font-size: 24px;
    }
    .invoice-number {
      color: #666;
      font-size: 14px;
    }
    .addresses {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .address-block {
      flex: 1;
    }
    .address-block h3 {
      margin: 0 0 10px;
      color: #8B7355;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .address-block p {
      margin: 0;
      color: #555;
    }
    .details-row {
      display: flex;
      justify-content: flex-end;
      gap: 40px;
      margin-bottom: 30px;
    }
    .detail-item {
      text-align: right;
    }
    .detail-item label {
      display: block;
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
    }
    .detail-item span {
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background: #f5f5f0;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #ddd;
    }
    th:last-child, td:last-child {
      text-align: right;
    }
    td {
      padding: 16px 12px;
      border-bottom: 1px solid #eee;
      vertical-align: top;
    }
    .item-description {
      white-space: pre-line;
    }
    .totals {
      margin-left: auto;
      width: 300px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .totals-row.discount {
      color: #28a745;
    }
    .totals-row.total {
      border-top: 2px solid #333;
      font-weight: bold;
      font-size: 18px;
      padding-top: 12px;
      margin-top: 8px;
    }
    .paid-badge {
      display: inline-block;
      background: #28a745;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-left: 10px;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #888;
      font-size: 14px;
    }
    .footer a {
      color: #8B7355;
    }
    @media print {
      body {
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://memoriqr.co.nz/logo.png" alt="MemoriQR" class="logo">
    <div class="invoice-title">
      <h1>INVOICE</h1>
      <div class="invoice-number">${invoice.invoiceNumber}</div>
    </div>
  </div>
  
  <div class="addresses">
    <div class="address-block">
      <h3>From</h3>
      <p>
        <strong>${BUSINESS_INFO.legalName}</strong><br>
        ${BUSINESS_INFO.address.line1}<br>
        ${BUSINESS_INFO.email}<br>
        ${BUSINESS_INFO.website}
      </p>
    </div>
    <div class="address-block">
      <h3>Bill To</h3>
      <p>
        <strong>${invoice.billingName}</strong><br>
        ${invoice.billingEmail}
        ${billingAddressLines.length > 0 ? '<br>' + billingAddressLines.join('<br>') : ''}
      </p>
    </div>
  </div>
  
  <div class="details-row">
    <div class="detail-item">
      <label>Invoice Date</label>
      <span>${formatDate(invoice.paidAt)}</span>
    </div>
    <div class="detail-item">
      <label>Payment Status</label>
      <span>Paid <span class="paid-badge">PAID</span></span>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.lineItems.map(item => `
      <tr>
        <td class="item-description">${item.description}</td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.unitPrice)}</td>
        <td>${formatCurrency(item.total)}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="totals">
    <div class="totals-row">
      <span>Subtotal</span>
      <span>${formatCurrency(invoice.subtotal)}</span>
    </div>
    ${invoice.discountAmount && invoice.discountAmount > 0 ? `
    <div class="totals-row discount">
      <span>Discount${invoice.discountCode ? ` (${invoice.discountCode})` : ''}</span>
      <span>-${formatCurrency(invoice.discountAmount)}</span>
    </div>
    ` : ''}
    ${invoice.taxAmount && invoice.taxAmount > 0 ? `
    <div class="totals-row">
      <span>GST (${invoice.taxRate}%)</span>
      <span>${formatCurrency(invoice.taxAmount)}</span>
    </div>
    ` : ''}
    <div class="totals-row total">
      <span>Total</span>
      <span>${formatCurrency(invoice.totalAmount)}</span>
    </div>
  </div>
  
  <div class="footer">
    <p>Thank you for your order!</p>
    <p>
      <a href="${BUSINESS_INFO.website}">${BUSINESS_INFO.website}</a> | 
      <a href="mailto:${BUSINESS_INFO.email}">${BUSINESS_INFO.email}</a>
    </p>
  </div>
</body>
</html>
`;
}

// Generate plain text invoice for email
export function generateInvoiceText(invoice: InvoiceData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: invoice.currency,
    }).format(amount);
  };
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleDateString('en-NZ');
    return new Date(dateStr).toLocaleDateString('en-NZ');
  };
  
  let text = `
INVOICE
${invoice.invoiceNumber}
Date: ${formatDate(invoice.paidAt)}

FROM:
${BUSINESS_INFO.legalName}
${BUSINESS_INFO.address.line1}
${BUSINESS_INFO.email}

BILL TO:
${invoice.billingName}
${invoice.billingEmail}

ITEMS:
${invoice.lineItems.map(item => `
- ${item.description.replace(/\n/g, ' ')}
  Qty: ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.total)}
`).join('')}

TOTAL:
Subtotal: ${formatCurrency(invoice.subtotal)}
${invoice.discountAmount && invoice.discountAmount > 0 ? `Discount: -${formatCurrency(invoice.discountAmount)}\n` : ''}
${invoice.taxAmount && invoice.taxAmount > 0 ? `GST: ${formatCurrency(invoice.taxAmount)}\n` : ''}
TOTAL PAID: ${formatCurrency(invoice.totalAmount)}

Payment Status: PAID
Payment Method: ${invoice.paymentMethod || 'Card'}

Thank you for your order!
${BUSINESS_INFO.website}
`;
  
  return text.trim();
}
