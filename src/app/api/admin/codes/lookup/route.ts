import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

// Check admin authentication
async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin-session')?.value
  const correctPassword = process.env.ADMIN_PASSWORD
  return !!correctPassword && session === correctPassword
}

// GET - Lookup a code (activation code or referral code)
export async function GET(request: NextRequest) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')?.trim().toUpperCase()

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Try to find as activation code first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: activationCode, error: activationError } = await (supabase as any)
      .from('retail_activation_codes')
      .select(`
        activation_code,
        product_type,
        hosting_duration,
        is_used,
        used_at,
        created_at,
        partner_id,
        partner:partners(id, partner_name, partner_type, contact_email),
        memorial:memorial_records(
          id,
          memorial_slug,
          deceased_name,
          deceased_type,
          is_published,
          hosting_expires_at,
          customer_id
        )
      `)
      .eq('activation_code', code)
      .single()

    if (!activationError && activationCode) {
      // If memorial exists, get customer info separately
      let customer = null
      if (activationCode.memorial?.customer_id) {
        const { data: customerData } = await (supabase as any)
          .from('customers')
          .select('id, full_name, email')
          .eq('id', activationCode.memorial.customer_id)
          .single()
        customer = customerData
      }

      // Fetch activity history for this activation code
      const { data: activityLog } = await (supabase as any)
        .from('activation_code_activity_log')
        .select(`
          id,
          activity_type,
          from_partner_id,
          to_partner_id,
          from_partner_name,
          to_partner_name,
          performed_by_admin,
          notes,
          created_at
        `)
        .eq('activation_code', activationCode.activation_code)
        .order('created_at', { ascending: true })

      return NextResponse.json({
        found: true,
        type: 'activation',
        code: {
          code: activationCode.activation_code,
          productType: activationCode.product_type,
          hostingDuration: activationCode.hosting_duration,
          isUsed: activationCode.is_used,
          usedAt: activationCode.used_at,
          createdAt: activationCode.created_at,
          partner: activationCode.partner ? {
            id: activationCode.partner.id,
            name: activationCode.partner.partner_name,
            type: activationCode.partner.partner_type,
            email: activationCode.partner.contact_email
          } : null,
          memorial: activationCode.memorial ? {
            id: activationCode.memorial.id,
            slug: activationCode.memorial.memorial_slug,
            deceasedName: activationCode.memorial.deceased_name,
            deceasedType: activationCode.memorial.deceased_type,
            isPublished: activationCode.memorial.is_published,
            expiresAt: activationCode.memorial.hosting_expires_at,
            customer: customer ? {
              id: customer.id,
              name: customer.full_name,
              email: customer.email
            } : null
          } : null,
          activityHistory: activityLog?.map((log: { id: string; activity_type: string; from_partner_id: string | null; to_partner_id: string | null; from_partner_name: string | null; to_partner_name: string | null; performed_by_admin: boolean; notes: string | null; created_at: string }) => ({
            id: log.id,
            activityType: log.activity_type,
            fromPartnerId: log.from_partner_id,
            toPartnerId: log.to_partner_id,
            fromPartnerName: log.from_partner_name,
            toPartnerName: log.to_partner_name,
            performedByAdmin: log.performed_by_admin,
            notes: log.notes,
            createdAt: log.created_at
          })) || []
        }
      })
    }

    // Try to find as referral code
    console.log(`[Code Lookup] Searching referral_codes for: "${code}"`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: referralCode, error: referralError } = await (supabase as any)
      .from('referral_codes')
      .select(`
        id,
        code,
        discount_percent,
        commission_percent,
        free_shipping,
        is_used,
        used_at,
        expires_at,
        created_at,
        partner_id,
        order_id,
        partner:partners(id, partner_name, partner_type, contact_email),
        order:orders(
          id,
          order_number,
          total_amount,
          order_status,
          created_at,
          customer:customers(id, full_name, email)
        )
      `)
      .eq('code', code)
      .single()

    console.log(`[Code Lookup] Referral result: found=${!!referralCode}, error=${referralError?.message || 'none'}`)

    if (!referralError && referralCode) {
      // Fetch activity history for this referral code
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: activityLog } = await (supabase as any)
        .from('referral_code_activity_log')
        .select(`
          id,
          activity_type,
          from_partner_id,
          to_partner_id,
          from_partner_name,
          to_partner_name,
          performed_by_admin,
          notes,
          created_at
        `)
        .eq('referral_code_id', referralCode.id)
        .order('created_at', { ascending: true })

      return NextResponse.json({
        found: true,
        type: 'referral',
        code: {
          code: referralCode.code,
          discountPercent: referralCode.discount_percent,
          commissionPercent: referralCode.commission_percent,
          freeShipping: referralCode.free_shipping,
          isUsed: referralCode.is_used,
          usedAt: referralCode.used_at,
          expiresAt: referralCode.expires_at,
          createdAt: referralCode.created_at,
          partner: referralCode.partner ? {
            id: referralCode.partner.id,
            name: referralCode.partner.partner_name,
            type: referralCode.partner.partner_type,
            email: referralCode.partner.contact_email
          } : null,
          order: referralCode.order ? {
            id: referralCode.order.id,
            orderNumber: referralCode.order.order_number,
            totalAmount: referralCode.order.total_amount,
            status: referralCode.order.order_status,
            createdAt: referralCode.order.created_at,
            customer: referralCode.order.customer ? {
              id: referralCode.order.customer.id,
              name: referralCode.order.customer.full_name,
              email: referralCode.order.customer.email
            } : null
          } : null,
          activityHistory: activityLog?.map((log: { id: string; activity_type: string; from_partner_id: string | null; to_partner_id: string | null; from_partner_name: string | null; to_partner_name: string | null; performed_by_admin: boolean; notes: string | null; created_at: string }) => ({
            id: log.id,
            activityType: log.activity_type,
            fromPartnerId: log.from_partner_id,
            toPartnerId: log.to_partner_id,
            fromPartnerName: log.from_partner_name,
            toPartnerName: log.to_partner_name,
            performedByAdmin: log.performed_by_admin,
            notes: log.notes,
            createdAt: log.created_at
          })) || []
        }
      })
    }

    // Code not found
    return NextResponse.json({
      found: false,
      message: 'Code not found. Check that it is a valid activation code (MQR-...) or referral code (REF-...).'
    })

  } catch (error) {
    console.error('Code lookup error:', error)
    return NextResponse.json({ error: 'Failed to lookup code' }, { status: 500 })
  }
}
