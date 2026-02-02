import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { REMINDER_SCHEDULE, GRACE_PERIOD_DAYS } from '@/lib/pricing'
import crypto from 'crypto'

// This endpoint should be called by Vercel Cron daily at 6am NZ time
// Secured by CRON_SECRET environment variable

const PIPEDREAM_WEBHOOK_URL = process.env.PIPEDREAM_WEBHOOK_URL

// Generate a secure renewal token
function generateRenewalToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz'
  const now = new Date()
  
  const results = {
    processed: 0,
    reminders_sent: {
      '90_days': 0,
      '30_days': 0,
      '7_days': 0,
      'grace_period': 0,
    },
    errors: [] as string[],
  }

// Type for memorial records with the reminder tracking fields (from migration 023)
interface MemorialWithReminders {
  id: string
  memorial_slug: string
  deceased_name: string
  hosting_expires_at: string | null
  hosting_duration: number
  renewal_token: string | null
  reminder_sent_90_days_at: string | null
  reminder_sent_30_days_at: string | null
  reminder_sent_7_days_at: string | null
  grace_period_reminder_sent_at: string | null
  customers: { id: string; email: string; full_name: string } | null
}

  try {
    // Fetch memorials that might need reminders
    // Exclude lifetime (999) and memorials without customer email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: fetchError } = await (supabase as any)
      .from('memorial_records')
      .select(`
        id,
        memorial_slug,
        deceased_name,
        hosting_expires_at,
        hosting_duration,
        renewal_token,
        reminder_sent_90_days_at,
        reminder_sent_30_days_at,
        reminder_sent_7_days_at,
        grace_period_reminder_sent_at,
        customers(id, email, full_name)
      `)
      .neq('hosting_duration', 999)
      .eq('is_published', true)
      .not('hosting_expires_at', 'is', null)
    
    const memorials = data as MemorialWithReminders[] | null

    if (fetchError) {
      console.error('Failed to fetch memorials:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    for (const memorial of memorials || []) {
      const customerEmail = memorial.customers?.email
      const customerName = memorial.customers?.full_name
      
      if (!customerEmail || !memorial.hosting_expires_at) continue

      const expiresAt = new Date(memorial.hosting_expires_at)
      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const isExpired = expiresAt < now
      const daysIntoGrace = isExpired ? Math.ceil((now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60 * 24)) : 0

      results.processed++

      // Determine which reminder to send
      let reminderType: '90_days' | '30_days' | '7_days' | 'grace_period' | null = null
      let reminderSentField: string | null = null

      if (!isExpired) {
        // 90-day reminder: between 89-91 days
        if (daysUntilExpiry >= 89 && daysUntilExpiry <= 91 && !memorial.reminder_sent_90_days_at) {
          reminderType = '90_days'
          reminderSentField = 'reminder_sent_90_days_at'
        }
        // 30-day reminder: between 29-31 days
        else if (daysUntilExpiry >= 29 && daysUntilExpiry <= 31 && !memorial.reminder_sent_30_days_at) {
          reminderType = '30_days'
          reminderSentField = 'reminder_sent_30_days_at'
        }
        // 7-day reminder: between 6-8 days
        else if (daysUntilExpiry >= 6 && daysUntilExpiry <= 8 && !memorial.reminder_sent_7_days_at) {
          reminderType = '7_days'
          reminderSentField = 'reminder_sent_7_days_at'
        }
      } else if (daysIntoGrace <= GRACE_PERIOD_DAYS) {
        // Grace period reminder: only once, within first 3 days of grace period
        if (daysIntoGrace <= 3 && !memorial.grace_period_reminder_sent_at) {
          reminderType = 'grace_period'
          reminderSentField = 'grace_period_reminder_sent_at'
        }
      }

      if (!reminderType || !reminderSentField) continue

      try {
        // Generate/refresh renewal token
        const renewalToken = generateRenewalToken()
        const tokenExpiresAt = new Date()
        tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30) // Token valid for 30 days

        // Update memorial with new token and mark reminder as sent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: Record<string, unknown> = {
          renewal_token: renewalToken,
          renewal_token_expires_at: tokenExpiresAt.toISOString(),
          [reminderSentField]: now.toISOString(),
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('memorial_records')
          .update(updateData)
          .eq('id', memorial.id)

        // Build one-click renewal URL
        const renewUrl = `${baseUrl}/renew?token=${renewalToken}`
        const memorialUrl = `${baseUrl}/memorial/${memorial.memorial_slug}`

        // Send reminder via Pipedream
        if (PIPEDREAM_WEBHOOK_URL) {
          const emailData = {
            type: 'expiry_reminder',
            reminder_type: reminderType,
            to: customerEmail,
            customer_name: customerName || 'there',
            deceased_name: memorial.deceased_name,
            memorial_slug: memorial.memorial_slug,
            memorial_url: memorialUrl,
            renew_url: renewUrl,
            days_until_expiry: isExpired ? 0 : daysUntilExpiry,
            is_grace_period: isExpired,
            grace_days_remaining: isExpired ? GRACE_PERIOD_DAYS - daysIntoGrace : null,
          }

          const response = await fetch(PIPEDREAM_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData),
          })

          if (!response.ok) {
            results.errors.push(`Failed to send ${reminderType} reminder for ${memorial.memorial_slug}`)
          } else {
            results.reminders_sent[reminderType]++
          }
        }

        // Log the reminder (tables added in migration 023)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('expiry_reminder_log').insert({
          memorial_id: memorial.id,
          reminder_type: reminderType,
          sent_to_email: customerEmail,
          renewal_token: renewalToken,
          pipedream_response: 'sent',
        })

        // Also log to activity_log
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('activity_log').insert({
          memorial_id: memorial.id,
          activity_type: 'renewal_reminder',
          details: {
            reminder_type: reminderType,
            days_until_expiry: daysUntilExpiry,
            sent_to: customerEmail,
          },
        })
      } catch (err) {
        console.error(`Error processing reminder for ${memorial.memorial_slug}:`, err)
        results.errors.push(`Error processing ${memorial.memorial_slug}: ${err}`)
      }
    }

    console.log('Expiry reminders processed:', results)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Cron expiry-reminders error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
