# MemoriQR Session Progress Log

> Auto-saved development session notes. Reference this file when needed for session context.

---

## January 30, 2026 - Date/Time Display Formatting & Partner Notifications

**Completed:**
- ✅ **Date/Time Display Standardization:**
  - All dates in admin and partner portals now show time with timezone (e.g., "30/01/2026" + "07:25 am NZDT")
  - Multi-line display: date on first line, time with timezone below (for compact views)
  - Added utility functions: `formatDateOnly()`, `formatTimeWithZone()`, `formatDateTimeParts()`
  - Updated across: partner/codes, partner/referrals, partner/dashboard, admin/codes, admin/referrals, admin/partners, admin/tools

- ✅ **Partner Codes Page UI Fix:**
  - Moved Download + Transfer buttons to table header (matching referral codes page layout)
  - Users no longer need to scroll up to access selection/transfer controls
  - Filter tabs, Download All, and Transfer controls now in one header row

- ✅ **Partner Order Notification Workflow:**
  - Created Pipedream workflow for partner code notifications
  - Handles `referral_codes_generated` and `partner_codes_generated` events
  - Env var: `PIPEDREAM_PARTNER_CODES_WEBHOOK_URL`

- ✅ **Type Definition Fix:**
  - Added `activityHistory` to `CodeLookupResult` interface in admin/tools

**Key Files Modified:**
- `src/lib/utils.ts` - Added `formatTimeWithZone()` and `formatDateTimeParts()` utilities
- `src/app/partner/codes/page.tsx` - UI restructure + date formatting
- `src/app/partner/referrals/page.tsx` - Date formatting
- `src/app/partner/dashboard/page.tsx` - Date formatting
- `src/app/admin/codes/page.tsx` - Date formatting
- `src/app/admin/referrals/page.tsx` - Date formatting
- `src/app/admin/partners/page.tsx` - Date formatting
- `src/app/admin/tools/page.tsx` - Date formatting + type fix
- `pipedream/partner-codes-notification-handler.js` - Partner notification emails

---

## January 29, 2026 - Order Fulfillment & Admin Enhancements

**Completed:**
- ✅ **Order Fulfillment Page** (`/admin/orders`):
  - Full orders list with filter tabs: Needs Fulfillment, Shipped, Completed, All
  - Order detail modal with complete customer/product info (same as email notification)
  - Action checklist with interactive checkboxes (green checkmarks when done)
  - Status workflow: Mark as Shipped → Mark as Completed
  - Tracking number and carrier input for shipments
  - Internal notes field
  - Badge counts on filter tabs

- ✅ **Code Lookup Feature** (`/admin/codes` - Lookup tab):
  - Quick activation code validation
  - Shows partner attribution and usage status
  - Links to partner details if applicable

- ✅ **Partners Page Enhancements**:
  - Auto-select partner with `?id=` query parameter
  - Added partner types: Photo Studio, Photographer, Videographer

- ✅ **UI/UX Improvements**:
  - "Lead Generation Cards" renamed to "Referral Codes" across all pages
  - Admin header links to main MemoriQR site (environment-aware dev/prod URL)
  - Fixed trailing space bug in `NEXT_PUBLIC_APP_URL` with `.trim()`

- ✅ **Bug Fixes**:
  - Fixed dashboard Total Revenue showing $0.00 (wrong column names in stats API)
  - Changed `amount_total` → `total_amount`, `status` → `order_status`
  - Removed confusing activation code from online order fulfillment emails

**Key Files Created/Modified:**
- `src/app/admin/orders/page.tsx` (NEW) - Order fulfillment page
- `src/app/api/admin/orders/route.ts` (NEW) - List orders API
- `src/app/api/admin/orders/[id]/route.ts` (NEW) - Order detail/update API
- `src/app/api/admin/stats/route.ts` - Fixed column names for revenue
- `src/app/admin/codes/page.tsx` - Added Code Lookup tab
- `src/app/admin/partners/page.tsx` - Auto-select with ?id= param
- `src/components/admin/AdminHeader.tsx` - Link to main site
- `pipedream/email-handler.js` - Removed activation code from online orders

---

## January 21, 2026 - Lead Generation Cards System

**Completed:**
- ✅ **Partner Application Flow Fixed:**
  - /partners page now uses /api/partner/apply (creates DB record)
  - Fixed column names to match schema (partner_name, contact_email, contact_phone)
  - Added Partners link to main Header navigation
  - Migration 011 applied: expected_qr_sales, expected_nfc_sales columns

- ✅ **Lead Generation Cards / Referral System** - Full implementation for partner referral cards:
  - Migration 010: referral_codes table, partner_commissions updates, partner default rates
  - REF-XXXXX code format (distinct from MQR-XXX-XXXXXX activation codes)
  - Configurable per-batch: discount %, commission %, free shipping
  
- ✅ **Order Page Referral Code Support:**
  - Referral code input in checkout Step 1 with validation
  - Auto-detection from URL param (`?ref=REF-XXXXX`)
  - Real-time discount calculation and display in order summary
  - Partner name shown on successful validation
  
- ✅ **Stripe Checkout Integration:**
  - Discounted pricing in checkout session
  - Free shipping option when enabled
  - Referral metadata passed to webhook
  
- ✅ **Commission Tracking:**
  - Webhook records commission in partner_commissions table
  - Marks referral code as used with order link
  - Updates order with commission ID
  
- ✅ **Partner Portal - Lead Gen Cards Tab:**
  - /partner/referrals page with batches and individual codes views
  - Summary cards (total, available, redeemed, conversion rate)
  - Copy code / copy order link buttons
  - Download CSV for available codes
  
- ✅ **Admin Referral Management:**
  - /admin/referrals page with generate and manage tabs
  - Partner selection with default rate pre-fill
  - Configurable discount %, commission %, free shipping, expiry
  - Batch view with expand to see codes and usage stats
  - Margin warning when discount + commission > 30%

- ✅ **Partners Page & Application:**
  - /partners public page with program info and application form
  - SimpleHeader component (no customer nav)
  - Contact API updated for partner applications
  - Pipedream email-handler.js updated for partner_application type

**Key Files Created/Modified:**
- `supabase/migrations/010_referral_system.sql`
- `src/app/api/admin/referrals/generate/route.ts`
- `src/app/api/admin/referrals/batch/[batchId]/route.ts`
- `src/app/api/referral/validate/route.ts`
- `src/app/api/partner/referrals/route.ts`
- `src/components/order/OrderForm.tsx` - referral code support
- `src/app/api/checkout/route.ts` - discount handling
- `src/app/api/webhooks/stripe/route.ts` - commission recording
- `src/app/partner/referrals/page.tsx`
- `src/app/partner/dashboard/page.tsx` - Lead Gen Cards nav link
- `src/app/admin/referrals/page.tsx`
- `src/app/partners/page.tsx` - public partner info page
- `src/components/layout/SimpleHeader.tsx`
- `src/app/api/contact/route.ts` - partner application handling
- `pipedream/email-handler.js` - partner_application email
- `src/types/database.ts` - referral_codes, partner_commissions updates

**Pending:**
- [ ] Apply migration 010 to Supabase DEV
- [ ] Test full referral flow end-to-end
- [ ] Partner commission payout workflow
- [ ] Update Pipedream with latest email-handler.js

---

## January 20, 2026 - Retail Code Generator & Batches

**Completed:**
- ✅ Admin code generator page with tabs (Generate / Manage / Batches)
- ✅ Admin code management (search, filters, bulk delete unused)
- ✅ Batch tracking for admin-generated codes (migration 009)
- ✅ Generate API now stores batch ID + batch name
- ✅ Batches API endpoints (list + delete unused in batch)
- ✅ Batches tab UI with expand-to-view codes and copy-all

**Pending:**
- [ ] Apply migration 009 to Supabase (generation_batch_id + generation_batch_name)

---

## January 18, 2026 - Vercel Deployment & Environment Setup

**Completed:**
- ✅ Vercel deployment with GitHub integration (main → Production, preview-smoke → Preview)
- ✅ Separate DEV Supabase project (pmabwrnhbkmtiusiqmjt)
- ✅ PROD Supabase wiped clean
- ✅ Stripe webhooks configured for Preview (disabled Vercel Auth protection)
- ✅ Pipedream webhook URL added to Preview env
- ✅ NEXT_PUBLIC_BASE_URL=https://dev.memoriqr.co.nz for Preview
- ✅ Custom domains configured:
  - memoriqr.co.nz → Production (main)
  - dev.memoriqr.co.nz → Preview (preview-smoke)
- ✅ Order form autofill detection fixes
- ✅ Stripe redirect URL fix (uses request origin)
- ✅ Species "Other" custom input + recall on activation/edit
- ✅ Edit page theme/frame options aligned with activation form
- ✅ Memorial created email template with QR code, links, edit URL
- ✅ Photos/videos API routes updated

**Environment Summary:**
- PROD Supabase: gzrgrjtjgmrhdgbcsrlf (memoriqr.co.nz)
- DEV Supabase: pmabwrnhbkmtiusiqmjt (dev.memoriqr.co.nz)
- Stripe: Test mode, webhook → dev.memoriqr.co.nz/api/webhooks/stripe
- Pipedream: https://eo7epxu5aypc0vj.m.pipedream.net

**Pending:**
- [ ] Stripe LIVE keys (waiting on business verification)
- [ ] Merge preview-smoke → main after full smoke test
- [ ] Re-enable Vercel Authentication for Preview (after testing)
- [ ] Domain transfer: memoriqr.co.nz from DomainZ to DomainsDirect (in progress)
