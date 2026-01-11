# MemoriQR

Digital memorial service creating lasting tributes for pets and people through NFC tags and QR-engraved stainless steel plates.

## 🌟 Features

- **NFC Tags** - Tap-to-view technology, no app required
- **QR Plates** - 316 marine-grade stainless steel, laser-engraved
- **Digital Memorials** - Unlimited photos, YouTube video hosting
- **Flexible Hosting** - 5, 10, or 25-year prepaid plans
- **Local Service** - Based in Auckland, NZ with fast shipping

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- Stripe account

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your environment variables in .env.local
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Cloudinary (for image hosting)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SendGrid (for email)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=hello@memoriqr.co.nz

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. Create a new Supabase project
2. Run the migration script:

```bash
# In Supabase SQL Editor, run:
# supabase/migrations/001_initial_schema.sql
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── checkout/      # Stripe checkout
│   │   ├── webhooks/      # Stripe webhooks
│   │   ├── activate/      # Activation validation
│   │   ├── memorial/      # Memorial CRUD
│   │   └── renew/         # Renewal handling
│   ├── memorial/[slug]/   # Memorial display page
│   ├── order/             # Order flow
│   ├── activate/          # Tag activation
│   └── renew/             # Renewal flow
├── components/            # React components
│   ├── layout/           # Header, Footer
│   ├── home/             # Homepage sections
│   ├── memorial/         # Memorial display
│   ├── order/            # Order form
│   ├── activate/         # Activation form
│   └── renew/            # Renewal form
├── lib/                  # Utility functions
│   ├── supabase/        # Supabase clients
│   ├── stripe.ts        # Stripe config
│   ├── pricing.ts       # Pricing logic
│   └── utils.ts         # Helpers
└── types/               # TypeScript types
    ├── database.ts      # Supabase types
    └── index.ts         # App types
```

## 🔧 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Styling:** Tailwind CSS
- **Image Hosting:** Cloudinary
- **Video Hosting:** YouTube (unlisted)
- **Email:** SendGrid

## 📊 Database Schema

See [supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql) for the complete schema including:

- `customers` - Customer information
- `memorial_records` - Memorial data and content
- `orders` - Purchase orders
- `retail_activation_codes` - Partner activation codes
- `partners` - Retail partners (vets, crematoriums)
- `supplier_orders` - Production orders
- `activity_log` - Analytics and tracking
- `pricing_history` - Price management

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Stripe Webhooks

Set up webhook endpoint in Stripe Dashboard:
- URL: `https://your-domain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `checkout.session.expired`

## 📄 License

Proprietary - All rights reserved

## 📞 Support

- Email: hello@memoriqr.co.nz
- Location: Auckland, New Zealand
