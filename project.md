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
- **Emails:** Pipedream → SendGrid
- **Hosting:** Vercel

## Development

```bash
npm install
npm run dev        # localhost:3000
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Key Paths

| Route | Purpose |
|-------|---------|
| `/order` | Customer checkout |
| `/activate/[code]` | Memorial activation wizard |
| `/memorial/[slug]` | Public memorial page |
| `/memorial/edit` | Edit existing memorial |
| `/partner/dashboard` | Partner portal |
| `/admin/codes` | Admin code generator |
| `/admin/referrals` | Lead gen card management |
| `/partners` | Public partner application |

## Documentation

- [Business Plan](docs/business-plan.md) - Pricing, costs, strategy
- [Session Log](docs/session-log.md) - Development progress
- [WordPress Integration](docs/wordpress-integration.md) - Embed instructions
- [Pipedream](pipedream/README.md) - Email handler reference

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
PIPEDREAM_WEBHOOK_URL=
NEXT_PUBLIC_BASE_URL=
```

## Migrations Pending

- [ ] 009: generation_batch_id columns
- [ ] 010: referral_codes + partner_commissions

## Current Branch

`preview-smoke` → deploys to dev.memoriqr.co.nz
