# MemoriQR

Digital memorial service with QR plates and NFC tags for pets and people.

## Quick Links

- **DEV Site:** https://dev.memoriqr.co.nz (preview-smoke branch)
- **PROD Site:** https://memoriqr.co.nz (main branch)
- **Supabase DEV:** pmabwrnhbkmtiusiqmjt
- **Supabase PROD:** gzrgrjtjgmrhdgbcsrlf

## Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Emails:** Pipedream → Gmail SMTP
- **Hosting:** Vercel

## Development Workflow

**⚠️ IMPORTANT: Always push to Vercel after making changes. Do NOT use local dev server.**

- All testing is done on Vercel preview deployments
- After any code changes, immediately `git add`, `git commit`, and `git push`
- Wait for Vercel deployment before testing

```bash
# Local commands (only if needed)
npm install
npm run dev        # localhost:3000
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Key Paths

### Customer Routes
| Route | Purpose |
|-------|---------|
| `/order` | Customer checkout flow |
| `/activate/[code]` | Memorial activation wizard |
| `/memorial/[slug]` | Public memorial page |
| `/memorial/edit` | Edit existing memorial (requires verification) |
| `/renew` | Hosting renewal flow |

### Partner Routes
| Route | Purpose |
|-------|---------|
| `/partners` | Public partner application form |
| `/partner/login` | Partner login (email verification) |
| `/partner/dashboard` | Partner portal with stats, codes, commissions |
| `/partner/settings` | Partner profile and notification settings |
| `/partner/faq` | Partner FAQ |
| `/partner/codes` | View and manage assigned activation codes |
| `/partner/referrals` | View referral codes, request new codes |
| `/partner/commissions` | View commission history and payouts |
| `/partner/materials` | Download marketing materials (brochures, logos, etc.) |

### Admin Routes
| Route | Purpose |
|-------|---------|
| `/admin` | Admin login |
| `/admin/dashboard` | Admin dashboard overview |
| `/admin/orders` | Order management |
| `/admin/codes` | Activation code generator (wholesale) |
| `/admin/referrals` | Referral code management (lead gen) |
| `/admin/partners` | Partner management |
| `/admin/commissions` | Commission payout workflow |
| `/admin/tools` | Search orders, resend emails, memorial management |
| `/admin/memorials` | Memorial management || `/admin/purchases` | Business purchases from suppliers |
| `/admin/invoices` | Customer invoice management |
| `/admin/inventory` | Stock/inventory management |
## Partner System

### Partner Types
- `vet` - Veterinary clinics
- `pet_store` - Pet stores
- `crematorium` - Pet crematoriums
- `groomer` - Pet groomers
- `breeder` - Breeders
- `shelter` - Animal shelters
- `funeral_home` - Human funeral homes
- `cemetery` - Cemeteries
- `hospice` - Hospices
- `other` - Other businesses

### Partner Code Types
1. **Wholesale Activation Codes** - Partner buys codes at wholesale, sells to customers
   - Format: `MQR-5N-XXXXXX` (5 year), `MQR-10N-XXXXXX` (10 year), etc.
   - Generated via Admin → Codes tab
   - Partner pays upfront, keeps markup

2. **Lead Generation Referral Codes** - Customer gets discount, partner gets commission
   - Format: `REF-XXXXX`
   - Generated via Admin → Referrals tab
   - No upfront cost to partner
   - Commission paid after customer purchases

### Partner Email Notifications
Partners can receive emails for:
- Welcome/approval emails
- Referral code redemption (with opt-out toggle in Settings)
- Codes generated notifications
- Terms update notifications
- Suspension notifications

## Pipedream Email Workflows

| Workflow | Env Var | Purpose |
|----------|---------|--------|
| Main Handler | `PIPEDREAM_WEBHOOK_URL` | Contact form, order emails, memorial emails, partner emails |
| Referral Redeemed | `PIPEDREAM_REFERRAL_WEBHOOK_URL` | Commission notification when referral used |
| Partner Codes | `PIPEDREAM_PARTNER_CODES_WEBHOOK_URL` | Codes generated notification |
| Commission Approved | `PIPEDREAM_COMMISSION_WEBHOOK_URL` | Notify partner when commissions approved |
| Security Change | `PIPEDREAM_SECURITY_WEBHOOK_URL` | Alert partner when bank/email changed |
| Low Stock Alert | `PIPEDREAM_LOW_STOCK_WEBHOOK_URL` | Alert admin when inventory is low |
| Renewal Reminders | `PIPEDREAM_RENEWAL_WEBHOOK_URL` | Expiry reminders & renewal confirmations (uses main handler) |
## Documentation

- [Business Plan](docs/business-plan.md) - Pricing, costs, strategy
- [Preview Branch Summary](docs/preview-smoke-summary.md) - Feature implementation details
- [Session Log](docs/session-log.md) - Development progress
- [WordPress Integration](docs/wordpress-integration.md) - Embed instructions
- [Pipedream](pipedream/README.md) - Email handler reference

## Environment Variables

Required in `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Pipedream Webhooks
PIPEDREAM_WEBHOOK_URL=https://eo7epxu5aypc0vj.m.pipedream.net
PIPEDREAM_REFERRAL_WEBHOOK_URL=https://eo5xpf69y0qbaul.m.pipedream.net
PIPEDREAM_PARTNER_CODES_WEBHOOK_URL=https://eop33i8rs8xu5av.m.pipedream.net
PIPEDREAM_RENEWAL_WEBHOOK_URL=https://eo7epxu5aypc0vj.m.pipedream.net  # Same as main
PIPEDREAM_COMMISSION_WEBHOOK_URL=<your-webhook-url>
PIPEDREAM_SECURITY_WEBHOOK_URL=<your-webhook-url>

# App URLs
NEXT_PUBLIC_BASE_URL=https://dev.memoriqr.co.nz
NEXT_PUBLIC_APP_URL=https://dev.memoriqr.co.nz

# Admin
ADMIN_PASSWORD=
```

## Database Migrations

Applied migrations (in order):
1. `001_initial_schema.sql` - Base tables
2. `002_add_frame_column.sql` - Profile frame options
3. `003_add_contact_email.sql` - Customer contact email
4. `004_add_stripe_customer_id.sql` - Stripe integration
5. `005_partner_portal.sql` - Partner system base
6. `005_edit_verification_codes.sql` - Memorial edit verification
7. `006_optional_hosting_duration.sql` - Flexible hosting
8. `007_partner_application_fields.sql` - Partner application
9. `008_retail_fulfillment.sql` - Retail activation codes
10. `009_admin_batch_tracking.sql` - Batch tracking
11. `010_referral_system.sql` - Referral codes + commissions
12. `011_partner_expected_sales.sql` - Sales forecasting
13. `012_partner_status_constraint.sql` - Status validation
14. `012_code_activity_log.sql` - Code usage tracking
15. `013_partner_suspension_reason.sql` - Suspension workflow
16. `014_partner_rejection_reason.sql` - Rejection workflow
17. `015_partner_trusted_device.sql` - Session security
18. `016_partner_referral_notifications.sql` - Notification preferences
19. `017_pii_encryption_audit.sql` - Security audit
20. `018_partner_batch_stripe_payment.sql` - Batch payments
21. `019_referral_codes_order_fk.sql` - Foreign key fix
22. `020_partner_contact_name.sql` - Contact name field
23. `021_referral_code_requests.sql` - Partner referral code requests
24. `022_partner_activity_log.sql` - Partner activity tracking
25. `022_partner_referral_invites.sql` - Partner referral invites
26. `023_memorial_renewal_system.sql` - Memorial renewal handling
27. `027_business_purchases.sql` - Business purchase tracking
28. `028_invoice_system.sql` - Customer invoice system
29. `029_admin_files_storage.sql` - Admin file storage
30. `030_inventory_system.sql` - Stock/inventory management

## Current Branch

`preview-smoke` → deploys to dev.memoriqr.co.nz

*Last updated: February 4, 2026*
