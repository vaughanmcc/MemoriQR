# Preview-Smoke Branch Implementation Summary

This document summarizes all features and fixes implemented on the `preview-smoke` branch that are pending merge to `main` (production).

**Branch:** `preview-smoke`  
**Commits pending:** 60  
**Date:** January 24, 2026

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
  - Shows if partner has active trusted device sessions
  - "Revoke All" button ends all 24-hour sessions
  - Converts current session to standard 1-hour if revoked
  - Clears localStorage acknowledgment so warning shows again next time
- **Admin Controls**: "Security" section in partner edit modal
  - Admin can revoke all trusted sessions for any active partner
  - Sends email notification to partner when admin revokes sessions
- **Warning Re-display**: If partner or admin revokes trust, warning modal appears again on next login when re-enabling "Stay signed in longer"

**Files:** `src/app/partner/page.tsx`, `src/app/api/partner/verify/route.ts`, `src/app/api/partner/session/extend/route.ts`, `src/app/partner/dashboard/page.tsx`, `src/app/partner/settings/page.tsx`, `src/app/api/partner/settings/route.ts`, `src/app/api/partner/settings/revoke-trust/route.ts`, `src/app/admin/partners/page.tsx`, `src/app/api/admin/partners/[id]/revoke-trust/route.ts`

**Migration:** `015_partner_trusted_device.sql` - Adds `is_trusted_device` column

---

## 2. Partner FAQ

### 2.1 Comprehensive FAQ Page
- Created `/partner/faq` page with searchable FAQ
- Categories: Getting Started, Your Dashboard, Commissions & Payments, Sharing & Tracking, Account Management, Login & Security

### 2.2 Login & Security Section
Added 5 Q&As covering:
- Session duration
- "Stay signed in longer" explanation
- Security recommendations
- Why verification codes are used
- How to log out

**Files:** `src/app/partner/faq/page.tsx`

---

## 3. Partner Dashboard Enhancements

### 3.1 Display Partner Terms
- Show discount percentage on dashboard
- Show commission percentage on dashboard
- Show free shipping status on dashboard

### 3.2 Partner Terms Update Notifications
- Email sent when admin updates discount, commission, or shipping terms
- Clear before/after comparison in email

### 3.3 Banking Details Reminder
- Prominent amber warning banner when banking details are missing
- Displays on dashboard login if bank_name, bank_account_name, or bank_account_number is empty
- Links directly to Settings page
- Ensures partners provide banking info before expecting payouts

**Files:** `src/app/partner/dashboard/page.tsx`, `src/app/api/partner/stats/route.ts`, `src/app/api/admin/partners/[id]/route.ts`

---

## 4. Partner Application & Approval Flow

### 4.1 Duplicate Detection
- Prevents duplicate applications by email + business name + type
- Exact business name matching (not substring)
- Duplicate checks for partner reactivation

### 4.2 Rejection Handling
- Added rejection reason field for partners
- Modal for entering rejection reason when rejecting
- Auto-approve rejected partners when their details are edited
- Rejection reason stored and displayed in admin

### 4.3 Email Notifications
- Welcome email when partner approved
- Welcome back email when partner reactivated
- Approval email when admin creates active partner
- Reminder to enter business address and banking details
- Direct link to pending applications in new application emails
- Dynamic baseUrl for admin links (uses request origin, not hardcoded)

### 4.4 Partner Types
- Added all partner types to validation: vet, pet_store, crematorium, groomer, breeder, shelter, etc.

**Files:** `src/app/api/admin/partners/route.ts`, `src/app/api/admin/partners/[id]/route.ts`, `src/app/api/partner/apply/route.ts`

**Migration:** `014_add_rejection_reason.sql`

---

## 5. Admin Dashboard Improvements

### 5.1 Partner Management
- Edit partner functionality with modal
- Display default_commission_percent (correct field)
- Display discount column
- Make Save Changes button more visible
- Auto-approve pending partners when edited

### 5.2 Commission Display
- Fixed commission table to show correct fields
- Improved error reporting

**Files:** `src/app/admin/partners/page.tsx`

---

## 6. Commission Payout Workflow (Phase 1)

### 6.1 Admin Commission Management
- View pending commissions by partner
- Approve/reject individual commission claims
- Mark commissions as paid
- Filter by status

### 6.2 Cookie/Session Fixes
- Fixed admin cookie path issue
- Use NextResponse.cookies pattern
- Fixed partner verify to use most recent code first

**Files:** `src/app/api/admin/commissions/route.ts`, `src/app/admin/commissions/page.tsx`

---

## 7. Retail Activation Code System

### 7.1 Admin Code Generator
- Generate activation codes for retail partners
- Batch tracking for admin-generated codes
- Expand batch to view individual codes
- Code management tab in admin

### 7.2 Scratch Card Fulfillment
- Retail scratch card workflow implementation
- Placeholder pages for orders and memorials

**Files:** `src/app/admin/codes/page.tsx`, `src/app/api/admin/codes/route.ts`

---

## 8. Lead Generation Cards

### 8.1 System Implementation
- Lead generation card system
- Admin partner creation
- Partner portal with self-service dashboard

**Files:** Various admin and partner files

---

## 9. Partner Suspension

### 9.1 Suspension Flow
- Store and show suspension reason
- Require suspension reason when suspending
- Email partner when suspended

**Files:** `src/app/api/admin/partners/[id]/route.ts`

---

## 10. Bug Fixes & Improvements

### 10.1 Partner Login
- Fixed email lookup in verify
- Fixed partner verify email lookup
- Added debug logging for troubleshooting
- Fixed missing webhook config surfacing

### 10.2 UI/UX
- Removed 'pre-made tags' from How It Works step 2
- Added Partners link to main Header navigation
- SimpleHeader on partners page (logo only)
- Various button visibility improvements

### 10.3 Database
- Fixed partner apply to use correct DB column names
- Map DB columns correctly in admin

---

## Database Migrations Required

The following migrations must be run in Supabase before deploying:

1. **015_partner_trusted_device.sql** (if not already run)
   ```sql
   ALTER TABLE public.partner_sessions 
   ADD COLUMN IF NOT EXISTS is_trusted_device boolean DEFAULT false;
   ```

2. **014_add_rejection_reason.sql** (if not already run)
   ```sql
   ALTER TABLE public.partners 
   ADD COLUMN IF NOT EXISTS rejection_reason text;
   ```

---

## Testing Checklist

Before merging to `main`, verify:

- [ ] Partner login with standard session (1 hour)
- [ ] Partner login with "Stay signed in longer" (24 hours)
- [ ] Trust device warning modal appears first time
- [ ] "Don't show again" works correctly
- [ ] Activity-based session extension (after 30 min of activity)
- [ ] Partner FAQ displays correctly
- [ ] Partner dashboard shows discount/commission/shipping
- [ ] Partner terms update email sends correctly
- [ ] New partner application → duplicate detection works
- [ ] Partner rejection with reason
- [ ] Rejected partner edit → auto-approval
- [ ] Admin commission payout workflow
- [ ] Admin code generator
- [ ] Partner suspension with reason and email

---

## Commit Count by Area

| Area | Commits |
|------|---------|
| Session/Security | 3 |
| Partner FAQ | 1 |
| Dashboard Enhancements | 2 |
| Application/Approval | 8 |
| Admin Dashboard | 4 |
| Commission Workflow | 5 |
| Code Generator | 6 |
| Bug Fixes | 29 |

---

*Generated: January 23, 2026*
