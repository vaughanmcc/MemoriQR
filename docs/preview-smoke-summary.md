# Preview-Smoke Branch Implementation Summary

This document summarizes all features and fixes implemented on the `preview-smoke` branch that are pending merge to `main` (production).

**Branch:** `preview-smoke`  
**Date:** February 1, 2026

---

## 1. Session Security & Trust Device

### 1.1 "Stay Signed In Longer" (Trust Device)
- Checkbox appears when entering verification code on partner login
- Warning modal on first use explaining:
  - Session extends to 24 hours (vs standard 1 hour)
  - Security risks (device access = account access)
  - Only use on personal, secure devices
- "Don't show again" checkbox - stores preference in localStorage
- If partner unchecks trust device, standard 1-hour session applies

### 1.2 Activity-Based Session Extension
- Only for standard 1-hour sessions (not trusted devices)
- Tracks activity: mouse movement, keyboard, clicks, scrolling
- Every 30 minutes, checks if user was active in last 5 minutes
- If active, extends session by 1 hour
- Partners can stay logged in indefinitely while actively working

### 1.3 Session Duration Changes
- Reduced default partner session from 7 days → 24 hours → 1 hour
- Trust device option extends to 24 hours
- New API endpoint: `/api/partner/session/extend`

### 1.4 Trusted Device Management
- **Partner Settings**: New "Security" section to view and revoke trusted device sessions
- **Admin Controls**: "Security" section in partner edit modal - admin can revoke all trusted sessions
- **Warning Re-display**: If partner or admin revokes trust, warning modal appears again on next login

**Files:** `src/app/partner/page.tsx`, `src/app/api/partner/verify/route.ts`, `src/app/api/partner/session/extend/route.ts`, `src/app/partner/settings/page.tsx`

**Migration:** `015_partner_trusted_device.sql`

---

## 2. Partner Email Notifications

### 2.1 Referral Redemption Notifications
- Partners receive email when their referral code is used
- Shows referral code, order number, commission earned
- Opt-out toggle in Partner Settings → Email Notifications
- One-click unsubscribe link in email (signed URL)
- Separate Pipedream workflow: `PIPEDREAM_REFERRAL_WEBHOOK_URL`

### 2.2 Partner Codes Generated Notifications
- Email sent when admin generates referral codes or activation codes for partner
- Lists generated codes, discount/commission percentages
- Separate Pipedream workflow: `PIPEDREAM_PARTNER_CODES_WEBHOOK_URL`

### 2.3 Notification Settings UI
- New "Email Notifications" section in Partner Settings
- Toggle for "Referral code redemption notifications"
- Defaults to enabled (opt-out model)

**Files:** `src/app/partner/settings/page.tsx`, `src/app/api/partner/settings/route.ts`, `src/app/api/partner/notifications/unsubscribe/route.ts`, `src/app/api/webhooks/stripe/route.ts`

**Migration:** `016_partner_referral_notifications.sql`

---

## 3. Partner FAQ

### 3.1 Comprehensive FAQ Page
- Created `/partner/faq` page with searchable FAQ
- Categories: Getting Started, Your Dashboard, Commissions & Payments, Sharing & Tracking, Account Management, Login & Security

**Files:** `src/app/partner/faq/page.tsx`

---

## 4. Partner Dashboard Enhancements

### 4.1 Display Partner Terms
- Show discount percentage, commission percentage, free shipping status

### 4.2 Partner Terms Update Notifications
- Email sent when admin updates discount, commission, or shipping terms
- Clear before/after comparison in email

### 4.3 Banking Details Reminder
- Prominent amber warning banner when banking details are missing
- Links directly to Settings page

**Files:** `src/app/partner/dashboard/page.tsx`, `src/app/api/partner/stats/route.ts`

---

## 5. Partner Application & Approval Flow

### 5.1 Duplicate Detection
- Prevents duplicate applications by email + business name + type

### 5.2 Rejection Handling
- Rejection reason field with modal for entering reason
- Auto-approve rejected partners when edited

### 5.3 Email Notifications
- Welcome email when approved
- Welcome back when reactivated
- Rejection notification with reason
- Suspension notification with reason

**Files:** `src/app/api/admin/partners/route.ts`, `src/app/api/admin/partners/[id]/route.ts`, `src/app/api/partner/apply/route.ts`

**Migration:** `014_add_rejection_reason.sql`

---

## 6. Admin Dashboard Improvements

### 6.1 Partner Management
- Edit partner functionality with modal
- View and update all partner fields
- Auto-approve pending partners when edited

### 6.2 Sortable Tables
- Click column headers to sort ascending/descending
- Visual indicator shows current sort column and direction

### 6.3 Navigation
- "← Back to Dashboard" link on all admin pages

**Files:** `src/app/admin/partners/page.tsx`

---

## 7. Commission Payout Workflow

### 7.1 Admin Commission Management
- View pending commissions by partner
- Approve/reject individual commission claims
- Mark commissions as paid
- Filter by status

**Files:** `src/app/api/admin/commissions/route.ts`, `src/app/admin/commissions/page.tsx`

---

## 8. Retail Activation Code System

### 8.1 Admin Code Generator (`/admin/codes`)
- Generate wholesale activation codes for partners
- Batch tracking with expand to view individual codes
- Partner assignment at generation time

### 8.2 Bulk Assign/Unassign
- Select codes → assign to partner
- Select assigned codes → unassign

**Files:** `src/app/admin/codes/page.tsx`, `src/app/api/admin/codes/route.ts`, `src/app/api/admin/codes/assign/route.ts`

---

## 9. Lead Generation Referral System

### 9.1 Referral Code Generator (`/admin/referrals`)
- Generate referral codes (REF-XXXXX format)
- Set discount %, commission %, free shipping, expiry
- Partner gets commission when code is redeemed

### 9.2 Commission Tracking
- Automatic commission record when referral code used
- Partner dashboard shows earned commissions

**Files:** `src/app/admin/referrals/page.tsx`, `src/app/api/admin/referrals/generate/route.ts`

**Migration:** `010_referral_system.sql`

---

## 10. Admin Tools Page (`/admin/tools`)

### 10.1 Search Orders
- Search by customer name or email
- Returns matching orders with quick "View Details" link

### 10.2 Order Lookup
- Enter order number for full details
- Shows memorial URLs with copy buttons

### 10.3 Resend Emails
- Retail activations: search by business name, partner type, email
- Online orders: resend by order number
- One-click resend of confirmation/memorial emails

### 10.4 Memorial Management
- Search by slug, name, or email
- View full memorial details in modal
- Toggle publish/unpublish
- Extend hosting duration
- Reset view count

**Files:** `src/app/admin/tools/page.tsx`, `src/app/api/admin/tools/*`

---

## 11. Pipedream Email Workflows

### 11.1 Workflow Architecture
Three separate Pipedream workflows:

| Workflow | Env Var | Email Types |
|----------|---------|-------------|
| Main | `PIPEDREAM_WEBHOOK_URL` | contact_form, order_confirmation, memorial_created, partner_welcome, partner_approved, partner_suspended, partner_terms_updated, admin_new_order, admin_new_partner_application |
| Referral Redeemed | `PIPEDREAM_REFERRAL_WEBHOOK_URL` | referral_redeemed |
| Partner Codes | `PIPEDREAM_PARTNER_CODES_WEBHOOK_URL` | referral_codes_generated, partner_codes_generated |

### 11.2 Handler Files
- `pipedream/email-handler.js` - Main workflow (all email types)
- `pipedream/referral-redeemed-handler.js` - Referral redemption emails
- `pipedream/partner-codes-notification-handler.js` - Codes generated emails

**Files:** `pipedream/*.js`, `pipedream/README.md`

---

## 12. Bug Fixes & Improvements

### 12.1 Partner Login
- Fixed email lookup in verify (use most recent code)
- Debug logging for troubleshooting

### 12.2 Database Column Fixes
- Fixed `partner_name` vs `business_name` confusion
- All queries now use correct column names

### 12.3 UI/UX
- Removed 'pre-made tags' from How It Works
- Partners link in Header navigation
- SimpleHeader on partners page

---

## Database Migrations Required

Run these in Supabase SQL Editor before deploying to production:

```sql
-- Run migrations 014-020 in order
-- Check supabase/migrations/ folder for each file
```

---

## Testing Checklist

Before merging to `main`, verify:

- [ ] Partner login with standard session (1 hour)
- [ ] Partner login with "Stay signed in longer" (24 hours)
- [ ] Partner notification toggle works
- [ ] Referral code redemption sends email to partner
- [ ] Codes generated sends email to partner
- [ ] Admin tools: search, lookup, resend emails
- [ ] Admin tools: memorial management
- [ ] Activation codes: generate, assign, unassign
- [ ] Referral codes: generate, track redemption
- [ ] Commission payout workflow

---

*Last updated: February 1, 2026*
| Dashboard Enhancements | 2 |
| Application/Approval | 8 |
| Admin Dashboard | 4 |
| Commission Workflow | 5 |
| Code Generator | 8 |
| Admin Tools | 10 |
| Bug Fixes | 41 |

---

*Generated: January 25, 2026*
