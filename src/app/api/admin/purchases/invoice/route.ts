import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify admin session
async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session');
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const purchaseId = formData.get('purchaseId') as string;

    if (!file || !purchaseId) {
      return NextResponse.json({ error: 'File and purchase ID required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF and image files allowed' }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Get purchase to verify it exists and get PO number
    const { data: purchase, error: purchaseError } = await supabase
      .from('business_purchases')
      .select('purchase_number')
      .eq('id', purchaseId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Create filename: PO-2026-0001-invoice.pdf
    const ext = file.name.split('.').pop() || 'pdf';
    const fileName = `${purchase.purchase_number}-invoice.${ext}`;
    const filePath = `business-invoices/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('admin-files')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Allow overwriting
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('admin-files')
      .getPublicUrl(filePath);

    const invoiceUrl = urlData.publicUrl;

    // Update purchase with invoice URL
    const { error: updateError } = await supabase
      .from('business_purchases')
      .update({ invoice_url: invoiceUrl })
      .eq('id', purchaseId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update purchase' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      invoiceUrl,
      fileName 
    });
  } catch (error) {
    console.error('Invoice upload error:', error);
    return NextResponse.json({ error: 'Failed to upload invoice' }, { status: 500 });
  }
}
