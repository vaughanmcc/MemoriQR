import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type RetailActivationCode = Database['public']['Tables']['retail_activation_codes']['Row']
type Order = Database['public']['Tables']['orders']['Row']

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Activation code is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check retail activation codes first
    const { data: retailCode } = await supabase
      .from('retail_activation_codes')
      .select('*')
      .eq('activation_code', code.toUpperCase())
      .single() as { data: RetailActivationCode | null }

    if (retailCode) {
      // Check if already used
      if (retailCode.is_used) {
        return NextResponse.json(
          { error: 'This activation code has already been used' },
          { status: 400 }
        )
      }

      // Check if expired
      if (retailCode.expires_at && new Date(retailCode.expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'This activation code has expired' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        valid: true,
        type: 'retail',
        productType: retailCode.product_type,
        hostingDuration: retailCode.hosting_duration,
        partnerId: retailCode.partner_id,
      })
    }

    // Check if it's an order-based code (memorial ID match)
    // For online orders, the code might be derived from order number
    const { data: order } = await supabase
      .from('orders')
      .select('id, memorial_id, order_status, product_type, hosting_duration')
      .eq('order_number', `MQR-${code}`)
      .single() as { data: Pick<Order, 'id' | 'memorial_id' | 'order_status' | 'product_type' | 'hosting_duration'> | null }

    if (order && order.order_status === 'paid') {
      // Fetch species from the memorial record if it exists
      let species: string | null = null
      if (order.memorial_id) {
        const { data: memorial } = await supabase
          .from('memorial_records')
          .select('species')
          .eq('id', order.memorial_id)
          .single()
        
        if (memorial) {
          species = memorial.species
        }
      }

      return NextResponse.json({
        valid: true,
        type: 'online',
        memorialId: order.memorial_id,
        productType: order.product_type,
        hostingDuration: order.hosting_duration,
        species: species,
      })
    }

    return NextResponse.json(
      { error: 'Invalid or unrecognized activation code' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Activation validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate activation code' },
      { status: 500 }
    )
  }
}
