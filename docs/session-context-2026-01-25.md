# Chat Session Context - January 25, 2026

This file provides context for continuing the MemoriQR development session.

## Current Work: Referral Redemption Email Notifications

### What Was Implemented

1. **Database Migration** (`supabase/migrations/016_partner_referral_notifications.sql`)
   - Added `notify_referral_redemption` boolean column to partners table (default: true)
   - **Already run in production**

2. **Stripe Webhook Update** (`src/app/api/webhooks/stripe/route.ts`)
   - When a referral code is redeemed and payment completes, sends email to partner via Pipedream
   - Only sends if `notify_referral_redemption !== false`
   - Includes opt-out URL with secure token

3. **Opt-out API** (`src/app/api/partner/notifications/unsubscribe/route.ts`)
   - GET endpoint with signed URL for one-click unsubscribe from emails
   - Renders a nice HTML page confirming unsubscription

4. **Partner Settings Update** (`src/app/api/partner/settings/route.ts` and `src/app/partner/settings/page.tsx`)
   - Added `notify_referral_redemption` to the settings API and UI
   - Toggle switch in "Email Notifications" section of partner settings

5. **Pipedream Email Handler** (`pipedream/email-handler.js`)
   - Added `referral_redeemed` email type handler
   - Green-themed email showing commission earned, order details, unsubscribe link

### NEW Pipedream Workflow for Referral Emails

The user created a **separate Pipedream workflow** specifically for referral redemption emails:
- **Webhook URL:** `https://eo5xpf69y0qbaul.m.pipedream.net`
- Uses code from `pipedream/referral_redeemed-handler.js` (or the referral section from `email-handler.js`)
- Has Gmail action step configured to send emails

### IMPORTANT: Update Stripe Webhook to Use New URL

The current Stripe webhook (`src/app/api/webhooks/stripe/route.ts`) sends to the main Pipedream webhook URL (`PIPEDREAM_WEBHOOK_URL` env var). 

**The referral_redeemed emails need to go to the NEW webhook URL:** `https://eo5xpf69y0qbaul.m.pipedream.net`

Options:
1. Add a new env var `PIPEDREAM_REFERRAL_WEBHOOK_URL` and update the webhook to use it for referral emails
2. Or add the `referral_redeemed` handler to the main Pipedream workflow instead

### Testing Commands

Test the referral email manually:
```bash
curl -X POST "https://eo5xpf69y0qbaul.m.pipedream.net" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "referral_redeemed",
    "to": "vaughanmcc.nz@gmail.com",
    "businessName": "TRYER",
    "referralCode": "REF-53QVD",
    "orderNumber": "MQR-TEST123",
    "discountPercent": 10,
    "commissionAmount": "16.35",
    "orderTotal": "109.00",
    "optOutUrl": "https://memoriqr.co.nz/api/partner/notifications/unsubscribe?partner=test&token=test",
    "dashboardUrl": "https://memoriqr.co.nz/partner/settings"
  }'
```

### Other Fixes in This Session

1. **Partner name column fix** - The `partners` table uses `partner_name` NOT `business_name` (column doesn't exist)
   - Fixed in: `/api/admin/codes/assign`, `/api/admin/codes/generate`, `/api/admin/referrals/generate`, `/api/referral/validate`, `/api/admin/partners`

2. **Referral code validation** - Fixed to use `partner_name` column with join

3. **Courtesy message** - Shows only business name (strips contact name in parentheses)

## Environment & Ports

- **Local dev server:** Port 3000
- **Forwarded URL:** `https://glowing-journey-7pg5wpv47gq3pgrx-3000.app.github.dev/`
- **Branch:** `preview-smoke`
- **Commits ahead of main:** 85+

## Key Database Tables

- `partners` - has `notify_referral_redemption` column
- `referral_codes` - has `is_used`, `used_at`, `order_id`, `partner_id`
- `partner_commissions` - tracks commissions from referral redemptions

## Next Steps

1. Either:
   - Update Stripe webhook to send referral emails to new Pipedream URL, OR
   - Add `referral_redeemed` handler to main Pipedream workflow
2. Test end-to-end with a real order using a new referral code
3. Update preview-smoke summary document
