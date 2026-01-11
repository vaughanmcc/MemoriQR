import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      const orderNumber = session.metadata?.order_number
      const memorialId = session.metadata?.memorial_id
      const customerId = session.metadata?.customer_id

      if (!orderNumber) {
        console.error('Missing order_number in session metadata')
        break
      }

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          order_status: 'paid',
          stripe_payment_id: session.payment_intent as string,
          paid_at: new Date().toISOString(),
        })
        .eq('order_number', orderNumber)

      if (orderError) {
        console.error('Failed to update order:', orderError)
      }

      // Update customer shipping address if provided
      if (session.shipping_details?.address && customerId) {
        await supabase
          .from('customers')
          .update({
            shipping_address: session.shipping_details.address,
          })
          .eq('id', customerId)
      }

      // Log activity
      if (memorialId) {
        await supabase.from('activity_log').insert({
          memorial_id: memorialId,
          activity_type: 'created',
          details: {
            order_number: orderNumber,
            payment_id: session.payment_intent,
            amount: session.amount_total,
          },
        })
      }

      // Get order details to check product type
      const { data: order } = await supabase
        .from('orders')
        .select('product_type, engraving_text, hosting_duration')
        .eq('order_number', orderNumber)
        .single()

      // If order includes QR plate, create supplier order
      if (order && (order.product_type === 'qr_only' || order.product_type === 'both')) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('id')
          .eq('order_number', orderNumber)
          .single()

        if (orderData) {
          await supabase.from('supplier_orders').insert({
            order_id: orderData.id,
            supplier_name: 'Metal Image NZ',
            order_details: {
              engraving_text: order.engraving_text,
              qr_url: `${process.env.NEXT_PUBLIC_APP_URL}/memorial/${memorialId}`,
            },
            supplier_status: 'pending',
          })
        }
      }

      // TODO: Send confirmation email via SendGrid
      // This would be implemented with SendGrid API

      console.log(`Order ${orderNumber} payment completed`)
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderNumber = session.metadata?.order_number

      if (orderNumber) {
        await supabase
          .from('orders')
          .update({ order_status: 'cancelled' })
          .eq('order_number', orderNumber)
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
