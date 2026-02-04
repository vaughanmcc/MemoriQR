# MemoriQR Production Migration Checklist

**Date:** February 3, 2026  
**Migration:** `preview-smoke` → `main`  
**Commits:** 272  
**Files changed:** 152

---

## Pre-Migration Checklist

- [ ] **Optional backup** (free tier doesn't have auto-backup, but migration is safe - uses IF NOT EXISTS)
- [ ] Verify dev.memoriqr.co.nz is working correctly
- [ ] No critical issues in preview-smoke branch

> **Note:** The migration SQL uses `IF NOT EXISTS` and `IF EXISTS` clauses, making it idempotent and safe to run. No data is deleted or modified (only new tables/columns added).

---

## Step 1: Database Migration (5 minutes)

> ⚠️ **Do this FIRST before deploying code**

1. Go to **Supabase Dashboard** → Select **PRODUCTION** project
2. Navigate to **SQL Editor**
3. Click **New query**
4. Open and copy contents of: `scripts/prod-migration/PROD_MIGRATION.sql`
5. Paste into SQL Editor
6. Click **Run**
7. Verify output shows: `Migration completed successfully!`

**New tables created:**
- `referral_code_activity_log`
- `activation_code_activity_log`
- `partner_security_audit`
- `referral_code_requests`
- `partner_activity_log`
- `referral_code_shares`
- `memorial_renewals`
- `expiry_reminder_log`
- `memorial_deletion_log`

**New views:**
- `memorials_needing_reminders`
- `memorials_ready_for_deletion`

- [ ] **Database migration complete**

---

## Step 2: Deploy Code (2 minutes)

**Option A: Run script**
```bash
cd /workspaces/MemoriQR
chmod +x scripts/prod-migration/migrate-to-prod.sh
./scripts/prod-migration/migrate-to-prod.sh
```

**Option B: Manual git commands**
```bash
git checkout main
git pull origin main
git merge origin/preview-smoke -m "Merge preview-smoke: Production release"
git push origin main
```

- [ ] **Code deployed** (Vercel will auto-deploy)

---

## Step 3: Create Pipedream Workflows (10 minutes)

### 3a. Commission Approved Email

1. Go to **Pipedream** → **Projects** → **MemoriQR Supabase webhook**
2. Click **New Workflow**
3. Name: `Commission Approved Email`
4. Trigger: **HTTP / Webhook** → **New Requests**
5. Add step: **Node.js** → **Run Node Code**
6. Copy code from: `pipedream/commission-approved-handler.js`
7. Add step: **Gmail** → **Send Email**
   - To: `{{steps.code.$return_value.to}}`
   - Subject: `{{steps.code.$return_value.subject}}`
   - Body: `{{steps.code.$return_value.htmlBody}}`
   - Reply-To: `info@memoriqr.co.nz`
8. **Deploy**
9. Copy webhook URL

- [ ] Webhook URL: `https://eo_______________.m.pipedream.net`

### 3b. Security Change Email

1. **New Workflow**
2. Name: `Security Change Alert`
3. Trigger: **HTTP / Webhook**
4. Add step: **Node.js** → Copy from: `pipedream/security-change-handler.js`
5. Add step: **Gmail** → Send Email (same config as above)
6. **Deploy**
7. Copy webhook URL

- [ ] Webhook URL: `https://eo_______________.m.pipedream.net`

### 3c. Renewal Reminder Email (if not already created)

1. **New Workflow**
2. Name: `Renewal Reminder`
3. Trigger: **HTTP / Webhook**
4. Configure for renewal reminder emails
5. **Deploy**
6. Copy webhook URL

- [ ] Webhook URL: `https://eo_______________.m.pipedream.net`

---

## Step 4: Add Environment Variables (3 minutes)

Go to **Vercel** → **MemoriQR** → **Settings** → **Environment Variables**

**Add these for PRODUCTION only:**

| Variable | Value |
|----------|-------|
| `PIPEDREAM_COMMISSION_WEBHOOK_URL` | (from step 3a) |
| `PIPEDREAM_SECURITY_WEBHOOK_URL` | (from step 3b) |
| `PIPEDREAM_RENEWAL_WEBHOOK_URL` | (from step 3c) |

- [ ] **Environment variables added**

---

## Step 5: Redeploy (1 minute)

Trigger a redeploy to pick up new env vars:

1. Vercel → MemoriQR → **Deployments**
2. Find latest production deployment
3. Click **⋮** → **Redeploy**

- [ ] **Redeployed with new env vars**

---

## Post-Migration Verification

### Test Core Flows

- [ ] Homepage loads: https://memoriqr.co.nz
- [ ] Place test order (use test card)
- [ ] Partner login works: https://memoriqr.co.nz/partner
- [ ] Admin login works: https://memoriqr.co.nz/admin
- [ ] Memorial pages load

### Test New Features

- [ ] Partner can request referral codes
- [ ] Admin can approve referral requests
- [ ] Partner commissions page loads
- [ ] Renewal page loads: https://memoriqr.co.nz/renew

### Verify Emails

- [ ] Order confirmation email sends
- [ ] Commission approved email sends (test via admin)
- [ ] Security alert email sends (change bank details to test)

---

## Rollback Plan

If issues occur:

### Code Rollback
```bash
git checkout main
git revert HEAD
git push origin main
```

### Database Rollback
The migration uses `IF NOT EXISTS` and `IF EXISTS` clauses, so tables won't be duplicated. If needed, manually drop new tables via SQL Editor:

```sql
DROP TABLE IF EXISTS referral_code_shares CASCADE;
DROP TABLE IF EXISTS partner_activity_log CASCADE;
DROP TABLE IF EXISTS referral_code_requests CASCADE;
DROP TABLE IF EXISTS partner_security_audit CASCADE;
DROP TABLE IF EXISTS referral_code_activity_log CASCADE;
DROP TABLE IF EXISTS activation_code_activity_log CASCADE;
DROP TABLE IF EXISTS memorial_renewals CASCADE;
DROP TABLE IF EXISTS expiry_reminder_log CASCADE;
DROP TABLE IF EXISTS memorial_deletion_log CASCADE;
DROP VIEW IF EXISTS memorials_needing_reminders;
DROP VIEW IF EXISTS memorials_ready_for_deletion;
```

---

## Summary

| Component | Time | Manual Steps |
|-----------|------|--------------|
| Database | 5 min | Copy/paste SQL |
| Code | 2 min | Run script or git commands |
| Pipedream | 10 min | Create 2-3 workflows |
| Env vars | 3 min | Add in Vercel |
| Verify | 5 min | Test key flows |
| **Total** | **~25 min** | |

---

**Migration completed:** [ ] Yes / [ ] No  
**Completed by:** _______________  
**Date/Time:** _______________
