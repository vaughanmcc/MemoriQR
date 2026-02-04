# MemoriQR Developer Guide

Digital memorial service creating lasting tributes for pets and people through NFC tags and QR-engraved Metalphoto® plates.

## 🌟 Product Features

- **NFC Tags** - Tap-to-view technology, no app required
- **QR Plates** - Metalphoto® anodised aluminium, sub-surface printed
- **Digital Memorials** - Curated photo galleries (20/40/60 photos by tier)
- **Flexible Hosting** - 5, 10, or 25-year prepaid plans
- **Partner Program** - Wholesale and lead-gen referral options

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (2 projects: dev + prod)
- Stripe account (test + live keys)
- Vercel account
- Pipedream account (for email workflows)

### Installation

```bash
npm install
cp .env.example .env.local
# Fill in environment variables
```

### Development Workflow

**⚠️ IMPORTANT: Push to Vercel for testing - avoid local dev server**

```bash
git add . && git commit -m "your changes" && git push
# Wait for Vercel deployment, then test at dev.memoriqr.co.nz
```

If local testing needed:
```bash
npm run dev                    # localhost:3000
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 🔧 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Payments | Stripe |
| Styling | Tailwind CSS |
| Images | Cloudinary |
| Videos | YouTube (unlisted) |
| Email | Pipedream → Gmail SMTP |
| Hosting | Vercel |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── checkout/      # Stripe checkout
│   │   ├── webhooks/      # Stripe webhooks
│   │   ├── activate/      # Code activation
│   │   ├── memorial/      # Memorial CRUD
│   │   ├── partner/       # Partner portal APIs
│   │   ├── admin/         # Admin APIs
│   │   └── renew/         # Renewal handling
│   ├── memorial/[slug]/   # Public memorial pages
│   ├── partner/           # Partner portal pages
│   ├── admin/             # Admin dashboard pages
│   ├── order/             # Customer checkout
│   ├── activate/          # Code activation flow
│   └── renew/             # Renewal flow
├── components/            # React components
│   ├── layout/           # Header, Footer
│   ├── home/             # Homepage sections
│   ├── memorial/         # Memorial display
│   ├── order/            # Order form
│   ├── activate/         # Activation wizard
│   └── renew/            # Renewal form
├── lib/                  # Utilities
│   ├── supabase/        # Supabase clients
│   ├── stripe.ts        # Stripe config
│   ├── pricing.ts       # Pricing logic
│   └── utils.ts         # Helpers
└── types/               # TypeScript types

pipedream/               # Email handler code (copy to Pipedream)
├── email-handler.js     # Main workflow handler
├── referral-redeemed-handler.js
├── partner-codes-notification-handler.js
└── README.md            # Pipedream setup guide

supabase/
└── migrations/          # SQL migrations (001-020)

scripts/                 # Utility scripts
```

## 🔑 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Stripe (use sk_test_ for dev)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Pipedream Webhooks
PIPEDREAM_WEBHOOK_URL=https://eo7epxu5aypc0vj.m.pipedream.net
PIPEDREAM_REFERRAL_WEBHOOK_URL=https://eo5xpf69y0qbaul.m.pipedream.net
PIPEDREAM_PARTNER_CODES_WEBHOOK_URL=https://eop33i8rs8xu5av.m.pipedream.net

# App URLs
NEXT_PUBLIC_SITE_URL=https://dev.memoriqr.co.nz
NEXT_PUBLIC_BASE_URL=https://dev.memoriqr.co.nz
NEXT_PUBLIC_APP_URL=https://dev.memoriqr.co.nz

# Admin
ADMIN_PASSWORD=your-admin-password
```

## 📧 Email System (Pipedream)

Three Pipedream workflows handle emails:

### 1. Main Workflow (`PIPEDREAM_WEBHOOK_URL`)
Handles most emails:
- `contact_form` - Website contact submissions
- `order_confirmation` - Order placed
- `memorial_created` - Memorial ready notification
- `partner_welcome` - New partner approved
- `partner_terms_updated` - Discount/commission changed
- `admin_new_order` - Alert admin of new order
- `admin_new_partner_application` - New partner application

### 2. Referral Redeemed (`PIPEDREAM_REFERRAL_WEBHOOK_URL`)
- `referral_redeemed` - Partner commission notification

### 3. Partner Codes (`PIPEDREAM_PARTNER_CODES_WEBHOOK_URL`)
- `referral_codes_generated` - Lead gen codes ready
- `partner_codes_generated` - Wholesale codes ready

### 4. Commission Approved (`PIPEDREAM_COMMISSION_WEBHOOK_URL`)
- `commission_approved` - Partner commission approved for payout

### 5. Security Change (`PIPEDREAM_SECURITY_WEBHOOK_URL`)
- `security_change` - Bank account or email changed alert

### 6. Low Stock Alert (`PIPEDREAM_LOW_STOCK_WEBHOOK_URL`)
- `low_stock_alert` - Alert admin when inventory drops below threshold

See [pipedream/README.md](pipedream/README.md) for setup instructions.

## 💼 Partner System

### Partner Types
`vet`, `pet_store`, `crematorium`, `groomer`, `breeder`, `shelter`, `funeral_home`, `cemetery`, `hospice`, `other`

### Code Types
1. **Wholesale Activation Codes** (`MQR-5N-XXXXXX`)
   - Partner buys at wholesale, sells to customers
   - Generated via Admin → Codes

2. **Lead Gen Referral Codes** (`REF-XXXXX`)
   - Customer gets discount, partner gets commission
   - Generated via Admin → Referrals

### Partner Portal Routes
- `/partner/login` - Email verification login
- `/partner/dashboard` - Stats, codes, commissions
- `/partner/settings` - Profile, banking, notifications
- `/partner/faq` - Help documentation
- `/partner/codes` - View assigned codes
- `/partner/referrals` - View referral codes, request more
- `/partner/commissions` - Commission history and payouts
- `/partner/materials` - Download marketing materials

## 🛠️ Admin Routes

- `/admin` - Login
- `/admin/dashboard` - Overview
- `/admin/orders` - Order management
- `/admin/codes` - Generate wholesale codes
- `/admin/referrals` - Generate referral codes
- `/admin/partners` - Partner management
- `/admin/commissions` - Payout workflow
- `/admin/tools` - Search, resend emails, memorial management
- `/admin/memorials` - Memorial management
- `/admin/purchases` - Business purchases from suppliers
- `/admin/invoices` - Customer invoice management
- `/admin/inventory` - Stock/inventory management

## 📊 Database Schema

Key tables:
- `customers` - Customer info
- `memorial_records` - Memorial content
- `orders` - Purchase orders
- `retail_activation_codes` - Wholesale codes
- `referral_codes` - Lead gen codes
- `referral_code_requests` - Partner code requests
- `partners` - Partner accounts
- `partner_sessions` - Login sessions
- `partner_commissions` - Commission tracking
- `business_purchases` - Supplier purchase orders
- `business_purchase_items` - Items in each purchase
- `customer_invoices` - Customer invoice records
- `inventory` - Stock by purchase batch
- `inventory_movements` - Stock in/out log

See `supabase/migrations/` for full schema.

## 🚢 Deployment

### Vercel Setup
1. Connect GitHub repo
2. Set environment variables (separate for Preview vs Production)
3. Preview deploys from `preview-smoke` branch
4. Production deploys from `main` branch

### Stripe Webhooks
Configure in Stripe Dashboard:
- **Dev:** `https://dev.memoriqr.co.nz/api/webhooks/stripe`
- **Prod:** `https://memoriqr.co.nz/api/webhooks/stripe`
- Events: `checkout.session.completed`, `checkout.session.expired`

## 🧪 Testing

### Test Stripe Payments
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Test Email Workflows
```bash
# Test referral code notification
curl -X POST https://eop33i8rs8xu5av.m.pipedream.net \
  -H "Content-Type: application/json" \
  -d '{"type":"referral_codes_generated","to":"test@example.com",...}'
```

## 📝 Current Development

**Branch:** `preview-smoke` → https://dev.memoriqr.co.nz

See [docs/preview-smoke-summary.md](docs/preview-smoke-summary.md) for pending features.

---

*Last updated: February 4, 2026*
