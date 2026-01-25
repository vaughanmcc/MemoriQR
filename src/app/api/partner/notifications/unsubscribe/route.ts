import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET - Opt out of referral redemption emails via signed link
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const partnerId = searchParams.get('partner')
  const token = searchParams.get('token')

  if (!partnerId || !token) {
    return new Response(renderPage('Invalid Link', 'This opt-out link is invalid or has expired.', false), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  // Verify token (simple hash of partner ID + secret)
  const expectedToken = generateOptOutToken(partnerId)
  if (token !== expectedToken) {
    return new Response(renderPage('Invalid Link', 'This opt-out link is invalid or has expired.', false), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const supabase = createAdminClient()

  // Get partner info
  const { data: partner, error: fetchError } = await supabase
    .from('partners')
    .select('id, partner_name, notify_referral_redemption')
    .eq('id', partnerId)
    .single()

  if (fetchError || !partner) {
    return new Response(renderPage('Partner Not Found', 'Could not find your partner account.', false), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  // Update preference
  const { error: updateError } = await supabase
    .from('partners')
    .update({ notify_referral_redemption: false })
    .eq('id', partnerId)

  if (updateError) {
    console.error('Failed to update notification preference:', updateError)
    return new Response(renderPage('Error', 'Failed to update your preferences. Please try again or update in your dashboard.', false), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const businessName = partner.partner_name?.replace(/\s*\([^)]+\)\s*$/, '') || 'Partner'

  return new Response(
    renderPage(
      'Unsubscribed Successfully',
      `You have been unsubscribed from referral code redemption emails for ${businessName}. You can re-enable these notifications in your Partner Dashboard settings at any time.`,
      true
    ),
    { headers: { 'Content-Type': 'text/html' } }
  )
}

// Generate a simple opt-out token
export function generateOptOutToken(partnerId: string): string {
  const secret = process.env.ADMIN_PASSWORD || 'memori-secret'
  // Simple hash - in production you'd use a proper HMAC
  const str = `${partnerId}-${secret}-optout`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

function renderPage(title: string, message: string, success: boolean): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - MemoriQR</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      padding: 48px;
      max-width: 480px;
      text-align: center;
    }
    .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 28px;
    }
    .icon.success { background: #d1fae5; color: #059669; }
    .icon.error { background: #fee2e2; color: #dc2626; }
    h1 {
      color: #1f2937;
      font-size: 24px;
      margin-bottom: 16px;
    }
    p {
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    a {
      display: inline-block;
      background: #059669;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.2s;
    }
    a:hover { background: #047857; }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #059669;
      margin-bottom: 32px;
      font-family: Georgia, serif;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">MemoriQR</div>
    <div class="icon ${success ? 'success' : 'error'}">
      ${success ? '✓' : '✗'}
    </div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/partner">Go to Partner Dashboard</a>
  </div>
</body>
</html>
`
}
