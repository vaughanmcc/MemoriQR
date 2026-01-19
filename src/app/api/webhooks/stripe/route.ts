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
        .select('product_type, hosting_duration')
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
              qr_url: `${process.env.NEXT_PUBLIC_APP_URL}/memorial/${memorialId}`,
            },
            supplier_status: 'pending',
          })
        }
      }

      // Send order confirmation email via Pipedream
      const webhookUrl = process.env.PIPEDREAM_WEBHOOK_URL
      if (webhookUrl) {
        // Get customer details including shipping address
        const { data: customer } = await supabase
          .from('customers')
          .select('email, full_name, shipping_address')
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
          // Activation URL for customer to set up their memorial
          const activationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/activate/${activationCode}`
          // Memorial URL for viewing (and for NFC tag programming)
          const memorialUrl = `${process.env.NEXT_PUBLIC_APP_URL}/memorial/${memorial.memorial_slug}`
          const qrCodeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/qr/${memorial.memorial_slug}`
          
          // Debug: log shipping details
          console.log('Stripe session shipping_details:', JSON.stringify(session.shipping_details, null, 2))
          console.log('Stripe session customer_details:', JSON.stringify(session.customer_details, null, 2))
          
          try {
            // Send customer order confirmation
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
                activation_url: activationUrl,
                surface_preparation_note: 'Before attaching your NFC tag or QR plate, please ensure the surface is clean, flat, and properly prepared. Remove any dust, dirt, or moisture. The surface must be free of chemicals such as oils (including wood treatments), waxes, silicones, or other contaminants that may prevent proper adhesion.',
              }),
            })

            // Get shipping address - prefer Stripe's collected address, fall back to our DB
            const shippingAddress = session.shipping_details?.address 
              ? JSON.stringify(session.shipping_details.address)
              : (customer.shipping_address ? JSON.stringify(customer.shipping_address) : null)

            // Send admin notification for fulfillment
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'admin_order_notification',
                order_number: orderNumber,
                customer_email: customer.email,
                customer_name: customer.full_name,
                deceased_name: memorial.deceased_name,
                product_type: order?.product_type,
                hosting_duration: order?.hosting_duration,
                amount_paid: session.amount_total ? session.amount_total / 100 : 0,
                currency: session.currency?.toUpperCase() || 'NZD',
                activation_code: activationCode,
                nfc_url: memorialUrl,  // NFC should link to memorial viewing page
                memorial_url: memorialUrl,
                qr_code_url: qrCodeUrl,
                shipping_address: shippingAddress,
                shipping_name: session.shipping_details?.name || customer.full_name,
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
