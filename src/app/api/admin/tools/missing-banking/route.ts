import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session')?.value;
  const correctPassword = process.env.ADMIN_PASSWORD;
  return !!correctPassword && session === correctPassword;
}

export async function GET() {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch active partners without complete banking details
    const { data: partners, error } = await supabase
      .from('partners')
      .select(`
        id,
        partner_name,
        contact_email,
        partner_type,
        status,
        bank_name,
        bank_account_name,
        bank_account_number,
        created_at
      `)
      .eq('status', 'active')
      .or('bank_name.is.null,bank_account_name.is.null,bank_account_number.is.null')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching partners without banking:', error);
      return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
    }

    // Filter to only include partners that are genuinely missing banking info
    // (null or empty strings for any of the 3 fields)
    const partnersMissingBanking = (partners || []).filter(p => 
      !p.bank_name || !p.bank_account_name || !p.bank_account_number
    );

    // Get code counts for each partner
    const partnerIds = partnersMissingBanking.map(p => p.id);
    
    // Get assigned codes count (unused)
    const { data: assignedCodes } = await supabase
      .from('retail_activation_codes')
      .select('partner_id')
      .in('partner_id', partnerIds)
      .is('memorial_id', null);

    // Get used codes count
    const { data: usedCodes } = await supabase
      .from('retail_activation_codes')
      .select('partner_id')
      .in('partner_id', partnerIds)
      .not('memorial_id', 'is', null);

    // Count codes by partner
    const assignedByPartner: Record<string, number> = {};
    const usedByPartner: Record<string, number> = {};
    
    (assignedCodes || []).forEach(code => {
      assignedByPartner[code.partner_id] = (assignedByPartner[code.partner_id] || 0) + 1;
    });
    
    (usedCodes || []).forEach(code => {
      usedByPartner[code.partner_id] = (usedByPartner[code.partner_id] || 0) + 1;
    });

    const result = partnersMissingBanking.map(p => ({
      id: p.id,
      partnerName: p.partner_name,
      email: p.contact_email,
      partnerType: p.partner_type,
      status: p.status,
      createdAt: p.created_at,
      bankingStatus: {
        hasName: !!p.bank_name,
        hasAccountName: !!p.bank_account_name,
        hasAccountNumber: !!p.bank_account_number,
      },
      assignedCodesCount: assignedByPartner[p.id] || 0,
      usedCodesCount: usedByPartner[p.id] || 0,
    }));

    return NextResponse.json({ 
      partners: result,
      total: result.length
    });
  } catch (error) {
    console.error('Error in missing-banking lookup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
