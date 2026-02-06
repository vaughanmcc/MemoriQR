# Files to Delete for PetLegacy

After running the rename script, delete or heavily modify these files/folders.
This list is organized by priority.

---

## 🔴 DELETE ENTIRELY (QR/NFC/Activation specific)

### Pages - Activation Flow
```
src/app/activate/              # Entire folder - activation code flow
src/app/api/activate/          # Activation API routes
```

### Pages - QR Code
```
src/app/api/qr/                # QR code generation API
```

### Admin - Activation Codes
```
src/app/admin/codes/           # Activation code management
```

### Components - Activation
```
src/components/activate/       # All activation components
```

---

## 🟠 DELETE OR REBRAND (Region-specific)

### Australia Routes
If not launching in Australia initially:
```
src/app/australia/             # Entire AU-specific marketing folder
src/app/au/                    # AU legal pages
```

Keep if planning AU launch, but update content for pet-only focus.

---

## 🟡 HEAVILY MODIFY (Core but needs changes)

### Order Flow
```
src/app/order/                 # Simplify - remove product_type options
src/components/order/          # Remove QR/NFC selection, physical product options
src/app/api/checkout/          # Simplify checkout - digital only
```

### Memorial Pages
```
src/app/memorial/              # Keep but review for pet-specific content
src/components/memorial/       # Keep but update for pets only
src/app/api/memorial/          # Keep - minimal changes
```

### Admin Pages
```
src/app/admin/orders/          # Remove physical fulfillment tracking
src/app/admin/inventory/       # DELETE - no physical inventory
src/app/admin/batches/         # DELETE - no batch fulfillment
src/app/admin/tools/           # Review - remove QR/NFC tools
```

### Partner Flow
```
src/app/partner/               # Keep but update for referral model
src/app/partners/              # Keep - application page
src/components/admin/          # Remove activation code components
```

### API Routes
```
src/app/api/admin/             # Review each - remove inventory/batch routes
src/app/api/partner/           # Modify for referral codes instead of activation
```

---

## 🟢 KEEP (Minimal changes needed)

### Core Pages
```
src/app/page.tsx               # Update hero content for pets
src/app/about/                 # Update content
src/app/contact/               # Keep as-is (branding auto-updated by script)
src/app/how-it-works/          # Update for digital-only flow
src/app/privacy/               # Legal pages (branding auto-updated)
src/app/privacy-summary/       # Keep
src/app/terms/                 # Keep
src/app/refunds/               # Keep
```

### Layout Components
```
src/components/layout/         # Keep all - update logo/colors
```

### Shared Components
```
src/components/shared/         # Keep all
src/components/home/           # Update for pet focus
src/components/contact/        # Keep
```

### Utilities
```
src/lib/                       # Keep all, update as needed
src/types/                     # Regenerate from new schema
```

### Config Files
```
next.config.js                 # Keep
tailwind.config.ts             # Update colors for pet brand
postcss.config.js              # Keep
tsconfig.json                  # Keep
package.json                   # Updated by script
```

---

## 📁 Specific Files to Delete

### Scripts (activation/QR related)
```
scripts/check-code.js          # Activation code checking
scripts/insert-test-code.js    # Test activation codes
```

### Public Assets (will need replacement)
```
public/images/                 # Replace with pet-focused images
public/materials/              # Replace with pet-focused materials
```

### Supabase Migrations (don't delete, but don't use)
```
supabase/migrations/           # Keep for reference, use petlegacy-schema.sql instead
```

---

## 🔧 Files Requiring Logic Changes

### Pricing
```
src/lib/pricing.ts             # Update for new pricing tiers (add lifetime)
```

### Memorial Options
```
src/lib/memorial-options.ts    # Remove human memorial options
```

### Types
```
src/types/database.ts          # Regenerate from petlegacy schema
src/types/index.ts             # Update as needed
```

### Stripe Integration
```
src/lib/stripe.ts              # Add brand metadata to requests
```

### Middleware
```
src/middleware.ts              # Update domain redirects for petlegacy.co.nz
```

---

## Quick Delete Commands

After reviewing, you can delete in bulk:

```bash
# High-priority deletions (QR/NFC/Activation)
rm -rf src/app/activate
rm -rf src/app/api/activate
rm -rf src/app/api/qr
rm -rf src/app/admin/codes
rm -rf src/app/admin/inventory
rm -rf src/app/admin/batches
rm -rf src/components/activate

# If not doing AU launch
rm -rf src/app/australia
rm -rf src/app/au

# Activation-related scripts
rm scripts/check-code.js
rm scripts/insert-test-code.js
```

---

## Post-Deletion Checklist

After deleting files:
- [ ] Run `npm run build` to check for broken imports
- [ ] Fix any TypeScript errors
- [ ] Update navigation menus (Header/Footer)
- [ ] Update sitemap if you have one
- [ ] Test all remaining routes
