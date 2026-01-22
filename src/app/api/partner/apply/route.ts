import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PIPEDREAM_WEBHOOK_URL = process.env.PIPEDREAM_WEBHOOK_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      businessName, 
      contactName, 
      email, 
      phone, 
      partnerType,
      businessType, // Alternative field name from /partners form
      website, 
      message,
      expectedQrSales,
      expectedNfcSales
    } = body;

    // Accept either partnerType or businessType
    const resolvedPartnerType = partnerType || businessType;

    // Validate required fields
    if (!businessName || !contactName || !email || !resolvedPartnerType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate partner type
    const validTypes = ['vet', 'funeral_director', 'funeral_home', 'cemetery', 'crematorium', 'pet_cremation', 'pet_store', 'retailer', 'groomer', 'other'];
    if (!validTypes.includes(resolvedPartnerType)) {
      return NextResponse.json(
        { error: 'Invalid partner type' },
        { status: 400 }
      );
    }

    // Check if email already exists (case-insensitive)
    const { data: existingByEmail } = await supabase
      .from('partners')
      .select('id, status, partner_name')
      .ilike('contact_email', email.trim().toLowerCase())
      .limit(1)

    const existing = existingByEmail?.[0]

    if (existing) {
      if (existing.status === 'pending') {
        return NextResponse.json(
          { error: 'An application with this email is already pending review' },
          { status: 400 }
        );
      } else if (existing.status === 'active' || existing.status === 'approved') {
        return NextResponse.json(
          { error: 'This email is already registered as a partner. Please log in instead.' },
          { status: 400 }
        );
      } else if (existing.status === 'rejected') {
        return NextResponse.json(
          { error: 'A previous application with this email was not approved. Please contact support.' },
          { status: 400 }
        );
      } else if (existing.status === 'suspended') {
        return NextResponse.json(
          { error: 'This partner account has been suspended. Please contact support.' },
          { status: 400 }
        );
      }
    }

    // Check if business name already exists (case-insensitive partial match)
    const { data: existingByName } = await supabase
      .from('partners')
      .select('id, status, contact_email')
      .ilike('partner_name', `%${businessName.trim()}%`)
      .limit(1)

    const existingName = existingByName?.[0]

    if (existingName && existingName.status !== 'rejected') {
      return NextResponse.json(
        { error: 'A partner with a similar business name already exists. If this is your business, please contact support.' },
        { status: 400 }
      );
    }

    // Create partner with pending status
    // Column mapping: partner_name (business), contact_email, contact_phone match original schema
    // is_active defaults to false until admin approves
    const { data: partner, error: insertError } = await supabase
      .from('partners')
      .insert({
        partner_name: `${businessName} (${contactName})`,
        contact_email: email.toLowerCase(),
        contact_phone: phone || null,
        partner_type: resolvedPartnerType,
        website: website || null,
        application_message: message || null,
        expected_qr_sales: expectedQrSales || null,
        expected_nfc_sales: expectedNfcSales || null,
        commission_rate: 15.00, // Default commission rate
        status: 'pending',
        is_active: false,  // Must be approved by admin before access
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating partner:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      );
    }

    // Send notification emails via Pipedream
    if (PIPEDREAM_WEBHOOK_URL) {
      // Notify admin
      await fetch(PIPEDREAM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'partner_application',
          businessName,
          contactName,
          email,
          phone: phone || '',
          businessType: resolvedPartnerType,
          message: message || '',
          expectedQrSales: expectedQrSales || 'Not specified',
          expectedNfcSales: expectedNfcSales || 'Not specified',
          partnerId: partner.id,
        }),
      }).catch(console.error);

      // Confirm receipt to applicant
      await fetch(PIPEDREAM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'partner_application_received',
          to: email,
          data: {
            businessName,
            contactName,
          },
        }),
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, partnerId: partner.id });
  } catch (error) {
    console.error('Partner application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
