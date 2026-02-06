# PetLegacy Migration Checklist

Complete these steps in order to set up PetLegacy.

---

## Phase 1: Repository Setup

### 1.1 Create GitHub Repository
- [ ] Go to github.com/new
- [ ] Create new repo: `PetLegacy` (private)
- [ ] Do NOT initialize with README (we'll push existing code)

### 1.2 Clone MemoriQR to New Location
```bash
# Clone MemoriQR as starting point
git clone https://github.com/vaughanmcc/MemoriQR.git PetLegacy
cd PetLegacy

# Remove MemoriQR git history and start fresh
rm -rf .git
git init
git branch -M main
```

### 1.3 Run Migration Script
```bash
# Make script executable
chmod +x migration/rename-to-petlegacy.sh

# Run the brand rename script
./migration/rename-to-petlegacy.sh

# Review changes
git diff
```

### 1.4 Push to New Repo
```bash
git add -A
git commit -m "Initial PetLegacy setup from MemoriQR"
git remote add origin https://github.com/vaughanmcc/PetLegacy.git
git push -u origin main
```

---

## Phase 2: Supabase Setup

### 2.1 Create PetLegacy Schema
- [ ] Open Supabase dashboard for your project
- [ ] Go to SQL Editor
- [ ] Open `migration/petlegacy-schema.sql`
- [ ] Run the SQL to create the `petlegacy` schema and tables

### 2.2 Verify Schema
```sql
-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'petlegacy';
```

### 2.3 Update Supabase Client Configuration
In your PetLegacy code, update the Supabase client to use the `petlegacy` schema:

```typescript
// src/lib/supabase/client.ts
const supabase = createClient(url, key, {
  db: {
    schema: 'petlegacy'
  }
})
```

---

## Phase 3: Vercel Setup

### 3.1 Create New Vercel Project
- [ ] Go to vercel.com/new
- [ ] Import the PetLegacy repository
- [ ] Configure project:
  - Framework: Next.js
  - Root Directory: ./
  - Build Command: `npm run build`
  - Output Directory: .next

### 3.2 Add Environment Variables
Copy all variables from `migration/env.local.template` to Vercel:
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] NEXT_PUBLIC_SITE_URL (set to https://petlegacy.co.nz)
- [ ] NEXT_PUBLIC_BRAND_NAME (set to PetLegacy)
- [ ] ADMIN_PASSWORD
- [ ] CLOUDINARY credentials (if using)

### 3.3 Configure Domains
- [ ] Add `petlegacy.co.nz` domain
- [ ] Add `dev.petlegacy.co.nz` for preview branch
- [ ] Configure DNS at your registrar

---

## Phase 4: Stripe Setup

### 4.1 Create PetLegacy Products
In your existing Stripe account, create new products:
- [ ] PetLegacy 5-Year Memorial - $49 NZD
- [ ] PetLegacy 10-Year Memorial - $79 NZD
- [ ] PetLegacy 25-Year Memorial - $129 NZD
- [ ] PetLegacy Lifetime Memorial - $199 NZD

Add metadata to each product:
```json
{
  "brand": "petlegacy",
  "hosting_duration": "5"
}
```

### 4.2 Update Webhook Endpoint
- [ ] Add new webhook endpoint: `https://petlegacy.co.nz/api/webhooks/stripe`
- [ ] Copy the webhook secret to Vercel env vars
- [ ] Enable events: `checkout.session.completed`, `payment_intent.succeeded`

---

## Phase 5: Codespace Setup

### 5.1 Create New Codespace
- [ ] Go to github.com/vaughanmcc/PetLegacy
- [ ] Click "Code" → "Codespaces" → "Create codespace on main"

### 5.2 Configure Codespace
- [ ] Copy `.env.local.template` to `.env.local`
- [ ] Fill in all environment variables
- [ ] Run `npm install`
- [ ] Run `npm run dev` to test

---

## Phase 6: Pipedream Updates

### 6.1 Update Existing Handlers
Modify your Pipedream handlers to check the `brand` field:

```javascript
// In each handler
const brand = event.body.brand || 'memoriqr';
const schema = brand === 'petlegacy' ? 'petlegacy' : 'public';

// Use schema in queries
const { data } = await supabase
  .schema(schema)
  .from('orders')
  .select('*');
```

### 6.2 Handlers to Update
- [ ] `commission-approved-handler.js` - Add brand check
- [ ] `email-handler.js` - Add brand check, update email templates
- [ ] `partner-codes-notification-handler.js` - May not be needed for PetLegacy
- [ ] `referral-redeemed-handler.js` - Add brand check
- [ ] `security-change-handler.js` - Add brand check

---

## Phase 7: Code Cleanup

### 7.1 Delete Unnecessary Files
See `FILES_TO_DELETE.md` for the full list. Key areas:
- [ ] Remove `/australia` routes (or rebrand for AU market)
- [ ] Remove QR/NFC activation pages
- [ ] Remove activation code management
- [ ] Remove human memorial options

### 7.2 Update Components
- [ ] Update Header/Footer with new branding
- [ ] Update color scheme in `tailwind.config.ts`
- [ ] Replace logos in `/public`
- [ ] Update favicon

### 7.3 Update Business Logic
- [ ] Simplify order flow (remove physical product tracking)
- [ ] Update partner flow (referral codes instead of activation codes)
- [ ] Update pricing logic

---

## Phase 8: Testing

### 8.1 Local Testing
- [ ] Run `npm run dev`
- [ ] Test homepage loads
- [ ] Test order flow with Stripe test mode
- [ ] Test partner registration
- [ ] Test memorial creation

### 8.2 Preview Deployment
- [ ] Create `preview` branch
- [ ] Push to trigger Vercel preview
- [ ] Test on preview URL

### 8.3 Production Deployment
- [ ] Merge to `main`
- [ ] Verify production deployment
- [ ] Test with real domain

---

## Phase 9: Go Live

### 9.1 Final Checks
- [ ] All pages load correctly
- [ ] Stripe webhook receiving events
- [ ] Emails sending (if configured)
- [ ] Partner portal working
- [ ] Memorial creation working

### 9.2 DNS Cutover
- [ ] Point petlegacy.co.nz to Vercel
- [ ] Verify SSL certificate
- [ ] Test all functionality on live domain

---

## Quick Reference

### Key URLs
- Production: https://petlegacy.co.nz
- Dev: https://dev.petlegacy.co.nz
- GitHub: https://github.com/vaughanmcc/PetLegacy
- Vercel: https://vercel.com/vaughanmcc/petlegacy

### Key Files
- `migration/rename-to-petlegacy.sh` - Brand rename script
- `migration/petlegacy-schema.sql` - Supabase schema
- `migration/env.local.template` - Environment variables
- `migration/FILES_TO_DELETE.md` - Cleanup list

### Support Emails
- support@petlegacy.co.nz
- partners@petlegacy.co.nz
- privacy@petlegacy.co.nz
