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

// Generate a 5-character alphanumeric code (excluding confusing chars)
function generateRandomPart(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluded I, O, 0, 1
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// POST - Generate referral codes for a partner
export async function POST(request: NextRequest) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { 
      partnerId, 
      quantity, 
      discountPercent = 10, 
      commissionPercent = 15,
      freeShipping = false,
      expiresInDays = null 
    } = await request.json()

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 })
    }

    if (!quantity || quantity < 1 || quantity > 500) {
      return NextResponse.json({ error: 'Quantity must be between 1 and 500' }, { status: 400 })
    }

    if (discountPercent < 0 || discountPercent > 100) {
      return NextResponse.json({ error: 'Discount must be between 0 and 100' }, { status: 400 })
    }

    if (commissionPercent < 0 || commissionPercent > 100) {
      return NextResponse.json({ error: 'Commission must be between 0 and 100' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify partner exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: partner, error: partnerError } = await (supabase as any)
      .from('partners')
      .select('id, partner_name, contact_email')
      .eq('id', partnerId)
      .single()

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    const partnerDisplayName = partner.partner_name || 'Unknown Partner'

    // Generate batch identifiers
    const batchId = crypto.randomUUID()
    const now = new Date()
    const batchName = `${partnerDisplayName} × ${quantity} - ${now.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })} ${now.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}`

    // Calculate expiry if specified
    let expiresAt = null
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)
    }

    // Generate unique codes
    const codes: string[] = []
    const insertPromises = []

    for (let i = 0; i < quantity; i++) {
      let referralCode: string
      let attempts = 0

      // Generate unique code
      do {
        referralCode = `REF-${generateRandomPart()}`
        attempts++

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing } = await (supabase as any)
          .from('referral_codes')
          .select('code')
          .eq('code', referralCode)
          .single()

        if (!existing) {
          break
        }
      } while (attempts < 10)

      if (attempts >= 10) {
        console.error('Failed to generate unique referral code after 10 attempts')
        continue
      }

      codes.push(referralCode)
      
      insertPromises.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('referral_codes')
          .insert({
            code: referralCode,
            partner_id: partnerId,
            discount_percent: discountPercent,
            commission_percent: commissionPercent,
            free_shipping: freeShipping,
            batch_id: batchId,
            batch_name: batchName,
            expires_at: expiresAt?.toISOString() || null,
          })
          .select('id, code')
          .single()
      )
    }

    // Execute all inserts
    const results = await Promise.all(insertPromises)
    const failures = results.filter(r => r.error)
    const successes = results.filter(r => !r.error && r.data)

    if (failures.length > 0) {
      console.error('Some referral codes failed to insert:', failures[0].error)
    }

    const successCount = codes.length - failures.length

    // Log activity for each created code
    const activityPromises = successes.map(r => 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('referral_code_activity_log')
        .insert({
          referral_code_id: r.data.id,
          code: r.data.code,
          activity_type: 'created',
          to_partner_id: partnerId,
          to_partner_name: partnerDisplayName,
          performed_by_admin: true,
          notes: `Generated in batch ${batchName}`,
        })
    )
    await Promise.all(activityPromises)

    console.log(`Generated ${successCount} referral codes for partner ${partnerDisplayName} (batch: ${batchId})`)

    // Send email notification to partner via Partner Codes Notification workflow
    const webhookUrl = process.env.PIPEDREAM_PARTNER_CODES_WEBHOOK_URL || process.env.PIPEDREAM_WEBHOOK_URL
    console.log(`[Referral Email] webhookUrl: ${webhookUrl ? 'SET' : 'NOT SET'}, contact_email: ${partner.contact_email}, successCount: ${successCount}`)
    if (webhookUrl && partner.contact_email && successCount > 0) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.com'
      const businessName = partnerDisplayName.replace(/\s*\([^)]+\)\s*$/, '')
      
      console.log(`[Referral Email] Sending to Pipedream: ${webhookUrl}`)
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'referral_codes_generated',
            to: partner.contact_email,
            businessName,
            quantity: successCount,
            codes: codes.slice(0, 10), // First 10 codes in email, rest in attachment
            totalCodes: codes.length,
            discountPercent,
            commissionPercent,
            freeShipping,
            expiresAt: expiresAt?.toISOString() || null,
            dashboardUrl: `${baseUrl}/partner/dashboard`,
          }),
        })
        console.log(`[Referral Email] Pipedream response status: ${response.status}`)
        console.log(`Referral codes email sent to ${partner.contact_email}`)
      } catch (emailError) {
        console.error('[Referral Email] Failed to send:', emailError)
      }
    } else {
      console.log(`[Referral Email] Skipped: webhookUrl=${!!webhookUrl}, email=${partner.contact_email}, count=${successCount}`)
    }

    return NextResponse.json({
      success: true,
      partnerId,
      partnerName: partnerDisplayName,
      quantity: successCount,
      codes,
      batchId,
      batchName,
      discountPercent,
      commissionPercent,
      freeShipping,
      expiresAt: expiresAt?.toISOString() || null,
    })

  } catch (error) {
    console.error('Generate referral codes error:', error)
    return NextResponse.json({ error: 'Failed to generate referral codes' }, { status: 500 })
  }
}

// GET - List referral code batches (grouped by batch)
export async function GET() {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    // Get all referral codes with partner info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: codes, error } = await (supabase as any)
      .from('referral_codes')
      .select(`
        code, 
        partner_id,
        discount_percent,
        commission_percent,
        free_shipping,
        is_used,
        batch_id, 
        batch_name, 
        created_at,
        partners(partner_name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching referral codes:', error)
      return NextResponse.json({ error: 'Failed to fetch referral codes' }, { status: 500 })
    }

    // Group by batch
    const batchMap = new Map<string, {
      id: string
      name: string
      partnerId: string
      partnerName: string
      discountPercent: number
      commissionPercent: number
      freeShipping: boolean
      totalCodes: number
      usedCodes: number
      createdAt: string
    }>()

    for (const code of codes || []) {
      const batchId = code.batch_id || 'no-batch'
      if (!batchMap.has(batchId)) {
        batchMap.set(batchId, {
          id: batchId,
          name: code.batch_name || 'No Batch',
          partnerId: code.partner_id,
          partnerName: code.partners?.partner_name || 'Unknown',
          discountPercent: code.discount_percent,
          commissionPercent: code.commission_percent,
          freeShipping: code.free_shipping,
          totalCodes: 0,
          usedCodes: 0,
          createdAt: code.created_at,
        })
      }
      const batch = batchMap.get(batchId)!
      batch.totalCodes++
      if (code.is_used) {
        batch.usedCodes++
      }
    }

    const batches = Array.from(batchMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ batches })

  } catch (error) {
    console.error('List referral batches error:', error)
    return NextResponse.json({ error: 'Failed to list referral batches' }, { status: 500 })
  }
}
