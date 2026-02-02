import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { generateOptOutToken } from '@/lib/utils'
import { SupabaseClient } from '@supabase/supabase-js'

// Force dynamic rendering for webhook
export const dynamic = 'force-dynamic'

const PIPEDREAM_WEBHOOK_URL = process.env.PIPEDREAM_WEBHOOK_URL
// Separate webhook for referral redemption emails (to avoid Pipedream code size limits)
const PIPEDREAM_REFERRAL_WEBHOOK_URL = process.env.PIPEDREAM_REFERRAL_WEBHOOK_URL || PIPEDREAM_WEBHOOK_URL
// Webhook for partner code notifications
const PIPEDREAM_PARTNER_CODES_WEBHOOK_URL = process.env.PIPEDREAM_PARTNER_CODES_WEBHOOK_URL || PIPEDREAM_WEBHOOK_URL

// Generate a unique activation code
function generateActivationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluded I, O, 0, 1
  let code = 'MQR-'
  for (let i = 0; i < 2; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  code += '-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Handle partner code purchase payment completion
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePartnerCodePurchase(session: Stripe.Checkout.Session, supabase: SupabaseClient<any, 'public', any>) {
  const batchId = session.metadata?.batch_id
  const partnerId = session.metadata?.partner_id
  const partnerName = session.metadata?.partner_name
  const batchNumber = session.metadata?.batch_number
  const quantity = parseInt(session.metadata?.quantity || '0')
  const productType = session.metadata?.product_type
  const hostingDuration = parseInt(session.metadata?.hosting_duration || '10')

  if (!batchId || !partnerId) {
    console.error('Missing batch_id or partner_id in partner code purchase metadata')
    return
  }

  console.log(`Processing partner code purchase: batch ${batchNumber}, ${quantity} codes for ${partnerName}`)

  // Update batch with payment info and mark as approved
  const { error: updateError } = await supabase
    .from('code_batches')
    .update({
      stripe_payment_intent_id: session.payment_intent as string,
      paid_at: new Date().toISOString(),
      status: 'approved',
      approved_at: new Date().toISOString(),
    })
    .eq('id', batchId)

  if (updateError) {
    console.error('Failed to update batch with payment info:', updateError)
    return
  }

  // Generate activation codes with database uniqueness check
  const codes: string[] = []
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 2) // Codes expire in 2 years

  for (let i = 0; i < quantity; i++) {
    let newCode: string
    let attempts = 0
    let isUnique = false

    do {
      newCode = generateActivationCode()
      attempts++
      if (attempts > 100) {
        console.error('Too many attempts generating unique code')
        break
      }
      
      // Check if code already exists in this batch
      if (codes.includes(newCode)) {
        continue
      }
      
      // Check if code already exists in database
      const { data: existing } = await supabase
        .from('retail_activation_codes')
        .select('activation_code')
        .eq('activation_code', newCode)
        .single()
      
      isUnique = !existing
    } while (!isUnique && attempts <= 100)

    if (isUnique && attempts <= 100) {
      codes.push(newCode)
    }
  }

  // Insert activation codes
  const codeInserts = codes.map(code => ({
    activation_code: code,
    partner_id: partnerId,
    batch_id: batchId,
    product_type: productType,
    hosting_duration: hostingDuration,
    is_used: false,
    expires_at: expiresAt.toISOString(),
  }))

  const { error: insertError } = await supabase
    .from('retail_activation_codes')
    .insert(codeInserts)

  if (insertError) {
    console.error('Failed to insert activation codes:', insertError)
    console.error('Insert data sample:', JSON.stringify(codeInserts[0]))
    console.error('Batch ID:', batchId, 'Partner ID:', partnerId)
    // Don't return - try to update batch status to show there was an issue
    await supabase
      .from('code_batches')
      .update({ notes: `Code generation failed: ${insertError.message}` })
      .eq('id', batchId)
    return
  }

  // Update batch status to generated
  await supabase
    .from('code_batches')
    .update({
      status: 'generated',
      generated_at: new Date().toISOString(),
    })
    .eq('id', batchId)

  console.log(`Generated ${codes.length} activation codes for batch ${batchNumber}`)

  // Get partner email for notification
  const { data: partner } = await supabase
    .from('partners')
    .select('contact_email')
    .eq('id', partnerId)
    .single()

  // Send email notification to partner
  if (PIPEDREAM_PARTNER_CODES_WEBHOOK_URL && partner?.contact_email) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.com'
    
    try {
      await fetch(PIPEDREAM_PARTNER_CODES_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'partner_codes_generated',
          partner_email: partner.contact_email,
          partner_name: partnerName,
          batch_number: batchNumber,
          quantity: codes.length,
          product_type: productType,
          hosting_duration: hostingDuration,
          codes_list: codes.join('\n'),
          portal_url: `${baseUrl}/partner/codes`,
        }),
      })
      console.log(`Partner codes email sent to ${partner.contact_email}`)
    } catch (emailError) {
      console.error('Failed to send partner codes email:', emailError)
    }
  }
}

// Handle memorial renewal/extension payment completion
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleMemorialRenewal(session: Stripe.Checkout.Session, supabase: SupabaseClient<any, 'public', any>) {
  const memorialId = session.metadata?.memorial_id
  const extensionType = session.metadata?.extension_type
  const yearsAdded = session.metadata?.years_added
  const previousExpiresAt = session.metadata?.previous_expires_at
  const newExpiresAt = session.metadata?.new_expires_at
  const wasExpired = session.metadata?.was_expired === 'true'
  const wasInGracePeriod = session.metadata?.was_in_grace_period === 'true'
  const daysRemaining = parseInt(session.metadata?.days_remaining || '0')
  const customerId = session.metadata?.customer_id

  if (!memorialId) {
    console.error('Missing memorial_id in renewal metadata')
    return
  }

  console.log(`Processing memorial renewal: ${memorialId}, type: ${extensionType}`)

  const isLifetime = extensionType === 'lifetime' || yearsAdded === 'lifetime'

  // Update memorial record
  const updateData: Record<string, unknown> = {
    renewal_status: 'renewed',
    updated_at: new Date().toISOString(),
    // Clear reminder tracking for new period
    reminder_sent_90_days_at: null,
    reminder_sent_30_days_at: null,
    reminder_sent_7_days_at: null,
    grace_period_reminder_sent_at: null,
    data_deletion_scheduled_at: null,
    // Rotate renewal token for security
    renewal_token: null, // Will be regenerated on next reminder
    renewal_token_expires_at: null,
  }

  if (isLifetime) {
    updateData.hosting_duration = 999
    updateData.hosting_expires_at = null
  } else if (newExpiresAt && newExpiresAt !== 'lifetime') {
    updateData.hosting_expires_at = newExpiresAt
  }

  const { error: updateError } = await supabase
    .from('memorial_records')
    .update(updateData)
    .eq('id', memorialId)

  if (updateError) {
    console.error('Failed to update memorial:', updateError)
    return
  }

  // Create renewal record
  const { error: renewalError } = await supabase
    .from('memorial_renewals')
    .insert({
      memorial_id: memorialId,
      customer_id: customerId || null,
      renewal_type: extensionType,
      years_added: isLifetime ? null : parseInt(yearsAdded || '1'),
      amount_paid: session.amount_total ? session.amount_total / 100 : 0,
      stripe_payment_id: session.payment_intent as string,
      stripe_session_id: session.id,
      previous_expires_at: previousExpiresAt || new Date().toISOString(),
      new_expires_at: isLifetime ? null : newExpiresAt,
      was_expired: wasExpired,
      was_in_grace_period: wasInGracePeriod,
      days_remaining: daysRemaining,
    })

  if (renewalError) {
    console.error('Failed to create renewal record:', renewalError)
  }

  // Log activity
  await supabase.from('activity_log').insert({
    memorial_id: memorialId,
    activity_type: 'renewed',
    details: {
      extension_type: extensionType,
      years_added: yearsAdded,
      amount_paid: session.amount_total ? session.amount_total / 100 : 0,
      was_expired: wasExpired,
      was_in_grace_period: wasInGracePeriod,
      new_expires_at: newExpiresAt,
    },
  })

  // Send confirmation email via Pipedream
  const webhookUrl = process.env.PIPEDREAM_WEBHOOK_URL
  if (webhookUrl) {
    const { data: memorial } = await supabase
      .from('memorial_records')
      .select('deceased_name, memorial_slug, hosting_expires_at, customers(email, full_name)')
      .eq('id', memorialId)
      .single()

    if (memorial) {
      const customerEmail = (memorial.customers as { email?: string } | null)?.email
      const customerName = (memorial.customers as { full_name?: string } | null)?.full_name
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz'

      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'renewal_confirmation',
            customer_email: customerEmail,
            customer_name: customerName,
            deceased_name: memorial.deceased_name,
            memorial_slug: memorial.memorial_slug,
            memorial_url: `${baseUrl}/memorial/${memorial.memorial_slug}`,
            extension_type: extensionType,
            is_lifetime: isLifetime,
            new_expires_at: isLifetime ? null : memorial.hosting_expires_at,
            amount_paid: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency?.toUpperCase() || 'NZD',
          }),
        })
        console.log(`Renewal confirmation email sent to ${customerEmail}`)
      } catch (emailError) {
        console.error('Failed to send renewal confirmation:', emailError)
      }
    }
  }

  console.log(`Memorial ${memorialId} renewed successfully: ${extensionType}`)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

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

      // Check if this is a partner code purchase
      if (session.metadata?.type === 'partner_code_purchase') {
        await handlePartnerCodePurchase(session, supabase)
        break
      }

      // Check if this is a memorial renewal/extension
      if (session.metadata?.type === 'memorial_renewal') {
        await handleMemorialRenewal(session, supabase)
        break
      }

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

      // Handle referral commission if this order used a referral code
      const referralCodeId = session.metadata?.referral_code_id
      const referralCode = session.metadata?.referral_code
      const referralDiscount = parseFloat(session.metadata?.referral_discount || '0')
      const referralCommissionPercent = parseFloat(session.metadata?.referral_commission_percent || '0')

      if (referralCodeId && referralCode) {
        // Get the referral code details to find the partner
        const { data: refCodeData } = await supabase
          .from('referral_codes')
          .select('partner_id')
          .eq('id', referralCodeId)
          .single()

        if (refCodeData) {
          // Get the order ID for the commission record
          const { data: orderData } = await supabase
            .from('orders')
            .select('id')
            .eq('order_number', orderNumber)
            .single()

          if (orderData) {
            const orderTotal = session.amount_total ? session.amount_total / 100 : 0
            const commissionAmount = Math.round((orderTotal + referralDiscount) * (referralCommissionPercent / 100) * 100) / 100

            // Create commission record (includes both old activation-style and new referral-style fields)
            const { data: commission, error: commissionError } = await supabase
              .from('partner_commissions')
              .insert({
                partner_id: refCodeData.partner_id,
                // New referral-based fields
                order_id: orderData.id,
                referral_code_id: referralCodeId,
                order_total: orderTotal + referralDiscount, // Original price before discount
                discount_amount: referralDiscount,
                commission_percent: referralCommissionPercent,
                // Old activation-based fields (for backward compatibility)
                order_value: orderTotal + referralDiscount,
                commission_rate: referralCommissionPercent,
                // Common fields
                commission_amount: commissionAmount,
                status: 'pending',
              })
              .select('id')
              .single()

            if (commissionError) {
              console.error('Failed to create commission record:', commissionError)
            } else if (commission) {
              // Update order with commission ID
              await supabase
                .from('orders')
                .update({ partner_commission_id: commission.id })
                .eq('id', orderData.id)

              // Mark referral code as used
              await supabase
                .from('referral_codes')
                .update({
                  is_used: true,
                  used_at: new Date().toISOString(),
                  order_id: orderData.id,
                })
                .eq('id', referralCodeId)

              // Log referral code redemption activity
              await supabase
                .from('referral_code_activity_log')
                .insert({
                  referral_code_id: referralCodeId,
                  code: referralCode,
                  activity_type: 'redeemed',
                  performed_by_admin: false,
                  from_partner_id: refCodeData.partner_id,
                  to_partner_id: refCodeData.partner_id,
                  notes: `Used on order ${orderNumber}`,
                  metadata: { 
                    order_number: orderNumber,
                    order_id: orderData.id,
                    order_total: orderTotal,
                    commission_amount: commissionAmount,
                    redeemed_at: new Date().toISOString()
                  }
                })

              console.log(`Commission of $${commissionAmount} recorded for partner ${refCodeData.partner_id}`)

              // Send email notification to partner if they haven't opted out
              if (PIPEDREAM_REFERRAL_WEBHOOK_URL) {
                const { data: partnerData } = await supabase
                  .from('partners')
                  .select('id, partner_name, contact_email, notify_referral_redemption, bank_name, bank_account_number')
                  .eq('id', refCodeData.partner_id)
                  .single()

                if (partnerData && partnerData.notify_referral_redemption !== false && partnerData.contact_email) {
                  const businessName = partnerData.partner_name?.replace(/\s*\([^)]+\)\s*$/, '') || 'Partner'
                  const optOutToken = generateOptOutToken(partnerData.id)
                  // Use NEXT_PUBLIC_APP_URL for dev/staging, fall back to BASE_URL for prod
                  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.com'
                  const optOutUrl = `${baseUrl}/api/partner/notifications/unsubscribe?partner=${partnerData.id}&token=${optOutToken}`
                  const hasBankingDetails = !!(partnerData.bank_name && partnerData.bank_account_number)

                  try {
                    await fetch(PIPEDREAM_REFERRAL_WEBHOOK_URL, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'referral_redeemed',
                        to: partnerData.contact_email,
                        businessName,
                        referralCode,
                        orderNumber,
                        discountPercent: referralDiscount > 0 ? Math.round((referralDiscount / (orderTotal + referralDiscount)) * 100) : 0,
                        commissionAmount: commissionAmount.toFixed(2),
                        orderTotal: (orderTotal + referralDiscount).toFixed(2),
                        optOutUrl,
                        dashboardUrl: `${baseUrl}/partner/settings`,
                        hasBankingDetails,
                        settingsUrl: `${baseUrl}/partner/settings`,
                      }),
                    })
                    console.log(`Referral redemption email sent to ${partnerData.contact_email}`)
                  } catch (emailError) {
                    console.error('Failed to send referral redemption email:', emailError)
                  }
                }
              }
            }
          }
        }
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
          const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz').trim()
          // Activation URL for customer to set up their memorial
          const activationUrl = `${baseUrl}/activate/${activationCode}`
          // Memorial URL for viewing (and for NFC tag programming)
          const memorialUrl = `${baseUrl}/memorial/${memorial.memorial_slug}`
          const qrCodeUrl = `${baseUrl}/api/qr/${memorial.memorial_slug}`
          
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
      
      // Handle partner code purchase expiry
      if (session.metadata?.type === 'partner_code_purchase') {
        const batchId = session.metadata?.batch_id
        if (batchId) {
          await supabase
            .from('code_batches')
            .update({ status: 'cancelled' })
            .eq('id', batchId)
          console.log(`Partner code batch ${batchId} checkout expired`)
        }
        break
      }

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
