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

      // Send order confirmation email via Pipedream
      const webhookUrl = process.env.PIPEDREAM_WEBHOOK_URL
      if (webhookUrl) {
        // Get customer details
        const { data: customer } = await supabase
          .from('customers')
          .select('email, full_name')
          .eq('id', customerId)
          .single()

        // Get memorial details
        const { data: memorial } = await supabase
          .from('memorial_records')
          .select('deceased_name, memorial_slug')
          .eq('id', memorialId)
          .single()

        if (customer && memorial) {
          // Extract the code from order number (remove MQR- prefix)
          const activationCode = orderNumber.replace('MQR-', '')
          try {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'order_confirmation',
                order_number: orderNumber,
                customer_email: customer.email,
                customer_name: customer.full_name,
                sender_name: 'MemoriQR',
                reply_to: 'memoriqr.global@gmail.com',
                deceased_name: memorial.deceased_name,
                memorial_slug: memorial.memorial_slug,
                product_type: order?.product_type,
                hosting_duration: order?.hosting_duration,
                amount_paid: session.amount_total ? session.amount_total / 100 : 0,
                currency: session.currency?.toUpperCase() || 'NZD',
                activation_url: `${process.env.NEXT_PUBLIC_APP_URL}/activate/${activationCode}`,
              }),
            })
          } catch (emailError) {
            console.error('Failed to send order confirmation:', emailError)
          }
        }
      }

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
