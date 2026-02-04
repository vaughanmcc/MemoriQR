import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateInvoiceHTML, generateInvoiceText, type InvoiceData, type InvoiceLineItem } from '@/lib/invoice';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Public invoice view - requires invoice number and email for verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const invoiceNumber = searchParams.get('number');
  const email = searchParams.get('email');
  const format = searchParams.get('format') || 'html'; // html, text, json

  if (!invoiceNumber) {
    return NextResponse.json({ error: 'Invoice number required' }, { status: 400 });
  }

  try {
    let query = supabase
      .from('invoices')
      .select('*')
      .eq('invoice_number', invoiceNumber);

    // If email provided, verify ownership
    if (email) {
      query = query.eq('billing_email', email.toLowerCase());
    }

    const { data: invoice, error } = await query.single();

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Convert DB record to InvoiceData
    const invoiceData: InvoiceData = {
      invoiceNumber: invoice.invoice_number,
      orderId: invoice.order_id,
      customerId: invoice.customer_id,
      invoiceType: invoice.invoice_type,
      billingName: invoice.billing_name,
      billingEmail: invoice.billing_email,
      billingAddress: invoice.billing_address,
      lineItems: invoice.line_items as InvoiceLineItem[],
      subtotal: parseFloat(invoice.subtotal),
      discountAmount: parseFloat(invoice.discount_amount || '0'),
      discountCode: invoice.discount_code,
      taxAmount: parseFloat(invoice.tax_amount || '0'),
      taxRate: parseFloat(invoice.tax_rate || '0'),
      totalAmount: parseFloat(invoice.total_amount),
      currency: invoice.currency,
      paymentMethod: invoice.payment_method,
      stripePaymentId: invoice.stripe_payment_id,
      paidAt: invoice.paid_at,
      notes: invoice.notes,
    };

    if (format === 'json') {
      return NextResponse.json({ invoice: invoiceData });
    }

    if (format === 'text') {
      const text = generateInvoiceText(invoiceData);
      return new NextResponse(text, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `inline; filename="${invoiceNumber}.txt"`,
        },
      });
    }

    // Default: HTML
    const html = generateInvoiceHTML(invoiceData);
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Invoice fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}
