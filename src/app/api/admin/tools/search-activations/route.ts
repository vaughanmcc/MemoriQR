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

// Type for activation query result
interface ActivationQueryResult {
  activation_code: string
  product_type: string
  hosting_duration: number
  is_used: boolean
  used_at: string | null
  created_at: string
  partner: {
    id: string
    partner_name: string
    partner_type: string
    contact_email: string | null
  } | null
  memorial: {
    id: string
    memorial_slug: string
    deceased_name: string
    deceased_type: string
    contact_email: string | null
    is_published: boolean
    hosting_expires_at: string
    customer: {
      id: string
      full_name: string
      email: string
    } | null
  } | null
}

// POST - Search activations by partner info and/or customer email
export async function POST(request: NextRequest) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { businessName, partnerType, customerEmail } = await request.json()

    // At least one search field required
    if (!businessName && !partnerType && !customerEmail) {
      return NextResponse.json({ 
        error: 'At least one search field is required (business name, partner type, or customer email)' 
      }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Search retail_activation_codes joined with partners and memorial_records
    // We need to find activations that have been used (have memorial_id)
    let query = supabase
      .from('retail_activation_codes')
      .select(`
        activation_code,
        product_type,
        hosting_duration,
        is_used,
        used_at,
        created_at,
        partner:partners(id, partner_name, partner_type, contact_email),
        memorial:memorial_records(
          id,
          memorial_slug,
          deceased_name,
          deceased_type,
          contact_email,
          is_published,
          hosting_expires_at,
          customer:customers(id, full_name, email)
        )
      `)
      .eq('is_used', true) // Only show used activations (they have memorials)

    // If business name provided, we need to filter by partner
    // We'll fetch all and filter in-memory for business name (Supabase has limitations on nested filters)
    if (partnerType) {
      query = query.eq('partner.partner_type', partnerType)
    }

    const { data: activations, error } = await query
      .order('used_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Activation search error:', error)
      return NextResponse.json({ error: 'Failed to search activations' }, { status: 500 })
    }

    // Filter results based on search criteria
    let results = activations || []

    // Filter by business name (case-insensitive partial match)
    if (businessName) {
      const searchTerm = businessName.toLowerCase()
      results = results.filter((a) => {
        const partner = a.partner as { partner_name: string } | null
        return partner?.partner_name?.toLowerCase().includes(searchTerm)
      })
    }

    // Filter by partner type
    if (partnerType) {
      results = results.filter((a) => {
        const partner = a.partner as { partner_type: string } | null
        return partner?.partner_type === partnerType
      })
    }

    // Filter by customer email (from memorial.contact_email or memorial.customer.email)
    if (customerEmail) {
      const searchEmail = customerEmail.toLowerCase()
      results = results.filter((a) => {
        const memorial = a.memorial as { 
          contact_email?: string | null
          customer?: { email?: string | null } | null 
        } | null
        
        const contactEmail = memorial?.contact_email?.toLowerCase()
        const custEmail = memorial?.customer?.email?.toLowerCase()
        
        return contactEmail?.includes(searchEmail) || custEmail?.includes(searchEmail)
      })
    }

    // Format results for frontend
    const formattedResults = results.map((a) => {
      const partner = a.partner as { 
        id: string
        partner_name: string
        partner_type: string
        contact_email: string 
      } | null
      
      const memorial = a.memorial as { 
        id: string
        memorial_slug: string
        deceased_name: string
        deceased_type: string
        contact_email: string | null
        is_published: boolean
        hosting_expires_at: string
        customer: { id: string; full_name: string; email: string } | null
      } | null

      const customerEmailAddr = memorial?.contact_email || memorial?.customer?.email || null
      const customerName = memorial?.customer?.full_name || null

      return {
        activationCode: a.activation_code,
        productType: a.product_type,
        hostingDuration: a.hosting_duration,
        usedAt: a.used_at,
        partner: partner ? {
          id: partner.id,
          name: partner.partner_name,
          type: partner.partner_type,
        } : null,
        memorial: memorial ? {
          id: memorial.id,
          slug: memorial.memorial_slug,
          deceasedName: memorial.deceased_name,
          deceasedType: memorial.deceased_type,
          isPublished: memorial.is_published,
          expiresAt: memorial.hosting_expires_at,
        } : null,
        customerEmail: customerEmailAddr,
        customerName,
      }
    })

    return NextResponse.json({ 
      activations: formattedResults,
      count: formattedResults.length 
    })
  } catch (error) {
    console.error('Activation search error:', error)
    return NextResponse.json({ error: 'Failed to search activations' }, { status: 500 })
  }
}
