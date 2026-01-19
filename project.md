# MemoriQR Business Overview - Updated January 2026

## Executive Summary
MemoriQR creates lasting digital memorials for pets and people through NFC tags and QR-engraved Metalphoto® plates. Customers scan these physical items to access personalized memorial webpages with photos, videos, and stories - hosted for 5, 10, or 25 years prepaid.

**Business Model:** Direct-to-consumer e-commerce (online orders) + B2B2C (retail partners like vets/crematoriums selling pre-made tags)

**Location:** Auckland, New Zealand - targeting NZ + Australia markets

**Unique Value:** Premium Metalphoto® anodised aluminium plates with 20+ year UV resistance, local NZ service with fast shipping, optional NFC technology, prepaid hosting with clear guarantees

---

## Development Environment - Hybrid Architecture (January 2026)

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│           WORDPRESS (Marketing Layer)                       │
│           PROD: Hostinger | DEV: LocalWP                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Elementor Pro Pages                                 │   │
│  │  • Home, About, How It Works, Contact, FAQ          │   │
│  │  • Pricing, Terms, Privacy, Testimonials            │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│              ┌────────────┴────────────┐                   │
│              │  iframe / embed links   │                   │
│              └────────────┬────────────┘                   │
└───────────────────────────│─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           NEXT.JS (Application Engine)                      │
│  PROD: Vercel (app.memoriqr.com) | DEV: localhost:3000 /     │
│                   Vercel Preview (*.vercel.app)             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Complex Application Features                        │   │
│  │  • /memorial/[slug] - Memorial Viewer               │   │
│  │  • /activate/[code] - Activation Wizard             │   │
│  │  • /order - Checkout Flow                           │   │
│  │  • /api/* - All API Routes                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
           ┌────────────────┼────────────────┐
           ▼                ▼                ▼
    ┌────────────┐   ┌────────────┐   ┌────────────┐
    │  SUPABASE  │   │  PIPEDREAM │   │   STRIPE   │
    │  Database  │   │  Webhooks  │   │  Payments  │
    │  Storage   │   │  Emails    │   │            │
    └────────────┘   └────────────┘   └────────────┘
```

### Why Hybrid Architecture?

| Concern | WordPress Handles | Next.js Handles |
|---------|------------------|-----------------|
| Marketing pages | ✅ Elementor drag-and-drop | |
| SEO | ✅ RankMath/Yoast | |
| Content updates | ✅ No code needed | |
| Complex forms | | ✅ Multi-step wizard |
| File uploads | | ✅ Supabase Storage |
| Theme/frame selection | | ✅ 25 themes, 25 frames |
| Payment processing | | ✅ Stripe integration |
| Memorial display | | ✅ Dynamic React components |

### DEV Environment Components

| Component | Technology | URL/Port |
|-----------|-----------|----------|
| WordPress | LocalWP | `localhost:10003` (varies) |
| Next.js (local) | npm run dev | `localhost:3000` |
| Next.js (preview) | Vercel Preview | `*.vercel.app` |
| Supabase | Cloud (dev project) | Shared instance |
| Stripe | Test mode + CLI | Webhook forwarding |

### PROD Environment Components

| Component | Technology | URL |
|-----------|-----------|-----|
| WordPress | Hostinger Managed | `memoriqr.com` or `memoriqr.co.nz` |
| Next.js | Vercel (Production) | `app.memoriqr.com` |
| Supabase | Cloud (prod project) | API |
| Stripe | Live mode | Webhooks |

---

## Next.js Application Status (January 2026)

### Completed Features ✅
- **Full Next.js App:** Modern React-based frontend with server-side rendering
- **Supabase Integration:** Database with customers, orders, memorials, retail codes, activity logs
- **Stripe Payments:** Test mode working, checkout flow complete with webhooks
- **Order Confirmation Emails:** Via Pipedream webhook integration
- **Memorial Activation Flow:**
  - Supports both online orders (order number-based) and retail activation codes
  - Pre-populates form with existing data (name, species, type) when available
  - 3-step wizard: Details → Photos → Story/Videos
  - Passing date constrained to today or earlier (no future dates)
- **Photo Upload:** Drag-and-drop with previews, max 50 photos, 10MB each
  - Rejection messages for video files and oversized images
- **Video Upload:** Multiple videos per plan limit (2/3/5):
  - Direct upload via drag-and-drop or file picker (max 50MB per file)
  - YouTube URL link (unlimited size, free)
  - Dynamic + button to add videos up to plan limit
- **Photo & Video Storage:** Real uploads to Supabase Storage buckets
  - `memorial-photos` bucket (10MB limit per file, public)
  - `memorial-videos` bucket (50MB limit per file, public)
- **Profile Photo Selection:** Click any uploaded photo to set as main profile image
- **Theme Selection:** 25 memorial themes with color schemes
  - 5-year plan: 5 themes (Classic, Garden, Ocean, Sunset, Starlight)
  - 10-year plan: 10 themes (above + Rose Garden, Meadow, Autumn, Lavender, Blue Sky)
  - 25-year plan: All 25 themes (including Forest, Dawn, Cherry Blossom, Eternal, etc.)
- **Contact Form:** Integrated with Pipedream for email notifications
- **Pricing Page:** Dynamic display with video footnotes
- **FAQ Section:** Comprehensive questions including video hosting details

### In Progress 🚧
- Memorial page display: Basic structure with theme support (using Supabase Storage URLs)
- Renewal flow: Database schema ready, payment flow not yet implemented

### Pending 📋
- Admin dashboard for order management
- Partner portal for retail activation code management
- Analytics dashboard for memorial views
- Email templates for renewal reminders
- Production deployment (Vercel)
- Cloudinary integration for actual photo storage

### Recent Updates
- **Theme System:** Added 25 memorial themes with color schemes, tied to plan duration (5/10/25 themes)
- **Profile Photo Selection:** Click-to-select any photo as the main profile image
- **Real Storage:** Photos and videos now upload to Supabase Storage (memorial-photos, memorial-videos buckets)
- **Video Player:** Supports both uploaded videos and YouTube embeds
- **Memorial Page Styling:** Theme-aware design with "Beloved [species]" badge, decorative quotes, gradient accents
- Updated all references from stainless steel to Metalphoto® anodised aluminium
- Added FAQ about Metalphoto® technology (20+ year UV, 8 micron protection, 300°C+ rated)

---

## Pricing Structure

All packages include prepaid hosting, Cloudinary image optimization, and YouTube video embedding.

### 5-YEAR MEMORIAL
- **20 photos, 2 videos***
- NFC Tag only: $99 NZD
- QR Plate only: $149 NZD
- Both (NFC + Plate): $199 NZD

### 10-YEAR MEMORIAL
- **40 photos, 3 videos***
- NFC Tag only: $149 NZD
- QR Plate only: $199 NZD
- Both (NFC + Plate): $249 NZD

### 25-YEAR MEMORIAL
- **60 photos, 5 videos***
- NFC Tag only: $199 NZD
- QR Plate only: $279 NZD
- Both (NFC + Plate): $349 NZD

***Videos:** YouTube links (unlisted for privacy). Direct upload option available in DEV environment (50MB max per file).

**Renewal:** $24/year after prepaid hosting period ends  
**Bulk Renewal:** Additional 10 years anytime: $99  
**Add-ons:** Extra 20 photos $10 | Extra video $15 (available after initial purchase)

### Pricing Positioning

**5-year tier:** Budget-conscious pet owners, first-time buyers  
**10-year tier:** Sweet spot - "less than $20/year for a decade of memories"  
**25-year tier:** Premium customers, human memorials, multi-generational legacy

**Value Messaging:**
- NFC option: "Tap to remember - no app required" (younger, tech-savvy audience)
- QR Plate: "Weather-proof permanent memorial" (traditional preference)
- Both: "Future-proof - works with any smartphone" (complete solution)

---

## Products

### Physical Products

**NFC Tags:**
- NFC215 stickers from Seritag
- Cost: $5-10 per unit
- Delivery: 2-day turnaround
- Use case: Quick delivery, lower price point, modern "tap to view"

**QR Plates:**
- Metalphoto® anodised aluminium plates with sub-surface printed QR codes
- Technology: Sub-surface imaging sealed under 8 micron protective anodic layer
- UV resistance: 20+ years outdoor durability
- Temperature resistance: Withstands 300°C+
- Meets or exceeds military specifications
- Cost: $40-50 per unit
- Production: 5-7 day turnaround
- Use case: Premium physical memorial, weather-resistant, permanent outdoor display

**Product Combinations:**
- **NFC only:** Fast delivery (2-3 days), lower price point
- **QR Plate only:** Premium physical memorial for traditional preferences
- **Both:** Complete solution (QR for permanence, NFC for easy scanning)

### Digital Product

**Hosting:** Digital memorial webpage with prepaid hosting (5/10/25 year options)
- Photo storage with limits (20/40/60 photos by tier)
- Video hosting (2/3/5 videos per tier) via YouTube (unlisted for privacy)
- All photos compressed to WebP via Cloudinary for fast loading
- Custom memorial URL: memoriqr.co.nz/memorial/[unique-slug]
- Mobile-responsive gallery design
- No advertisements

---

## Target Markets

### Primary Markets
1. **Pet Owners (70% of revenue target)**
   - NZ/AU households: 80% have pets
   - Emotional connection, willing to spend $100-300
   - Entry point: 5-year NFC tags at vets

2. **Human Memorials (30% of revenue target)**
   - Funeral homes, crematoriums
   - Higher price tolerance ($249-349)
   - Cultural consideration: Māori memorial traditions

### Distribution Channels
1. **Direct Online (memoriqr.co.nz):** 60% of sales
2. **Retail Partners:** 40% of sales
   - Veterinary clinics
   - Pet crematoriums
   - Funeral homes
   - Pet supply stores

---

## Technical Architecture

### Current Tech Stack (Application)

**Frontend/App:**
- Next.js 14 (App Router)
- Tailwind CSS

**Hosting:**
- Vercel (production: app.memoriqr.com)
- Vercel Preview for staging/test builds
- Local dev via `npm run dev` on `localhost:3000`

**Backend/Database:**
- Supabase (PostgreSQL database)
- Stores all memorial data, customer info, activation codes
- Real-time updates, authentication, file storage coordination

**Automation:**
- Pipedream for workflow automation
- Connects WordPress, Supabase, email, payment webhooks
- Handles order processing, renewals, notifications

**File Storage:**
- Cloudinary for image optimization
- YouTube for video hosting (unlisted)
- Automatic WebP conversion, responsive images

**Payments:**
- Stripe for payment processing
- Supports NZD/AUD directly
- Handles one-time purchases and renewals

**Email:**
- SendGrid for transactional emails
- Order confirmations, upload links, renewal reminders

### Marketing Site Stack (Production)

**Frontend/Public Site:**
- WordPress on Hostinger Business Plan
- Elementor Pro for page building

- WooCommerce for e-commerce
- Custom memorial page templates

### Why This Stack?

**WordPress + Supabase Hybrid:**
- WordPress: Easy content management, SEO, public-facing pages
- Supabase: Robust database for complex logic (retail codes, renewals)
- Pipedream: Bridges them without custom backend code

**Cost at Scale:**
- 100 memorials: ~$3-10/month
- 500 memorials: ~$50-65/month
- 2000 memorials: ~$100-120/month

---

## Database Schema (Supabase)

### Tables

**customers**
```sql
id UUID PRIMARY KEY
email TEXT UNIQUE NOT NULL
full_name TEXT NOT NULL
phone TEXT
shipping_address JSONB
created_at TIMESTAMP DEFAULT NOW()
customer_type TEXT -- 'direct' or 'retail'
```

**memorial_records**
```sql
id UUID PRIMARY KEY
customer_id UUID REFERENCES customers(id)
memorial_slug TEXT UNIQUE NOT NULL
deceased_name TEXT NOT NULL
deceased_type TEXT -- 'pet' or 'human'
birth_date DATE
death_date DATE
memorial_text TEXT
photos_json JSONB -- array of Cloudinary URLs
videos_json JSONB -- array of YouTube IDs or video URLs
photo_count INTEGER DEFAULT 0
video_count INTEGER DEFAULT 0
photo_limit INTEGER NOT NULL -- 20, 40, or 60 based on hosting_duration
video_limit INTEGER NOT NULL -- 2, 3, or 5 based on hosting_duration
is_published BOOLEAN DEFAULT false
hosting_duration INTEGER NOT NULL -- 5, 10, or 25 years
product_type TEXT NOT NULL -- 'nfc_only', 'qr_only', 'both'
base_price DECIMAL(10,2) NOT NULL
order_date TIMESTAMP NOT NULL
hosting_expires_at TIMESTAMP NOT NULL -- computed: order_date + hosting_duration
renewal_status TEXT DEFAULT 'active' -- 'active', 'expired', 'renewed'
is_hosting_active BOOLEAN GENERATED -- computed: NOW() < hosting_expires_at
days_until_expiry INTEGER GENERATED -- computed for renewal reminders
views_count INTEGER DEFAULT 0
last_viewed TIMESTAMP
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

**orders**
```sql
id UUID PRIMARY KEY
customer_id UUID REFERENCES customers(id)
order_number TEXT UNIQUE NOT NULL
order_type TEXT -- 'online' or 'retail_activation'
product_type TEXT -- 'nfc_only', 'qr_only', 'both'
hosting_duration INTEGER -- 5, 10, or 25
total_amount DECIMAL(10,2)
stripe_payment_id TEXT
order_status TEXT -- 'pending', 'paid', 'processing', 'shipped', 'completed'
engraving_text TEXT
qr_code_url TEXT
nfc_tag_id TEXT
tracking_number TEXT
created_at TIMESTAMP DEFAULT NOW()
shipped_at TIMESTAMP
```

**retail_activation_codes**
```sql
activation_code TEXT PRIMARY KEY
memorial_id UUID REFERENCES memorial_records(id)
partner_id UUID REFERENCES partners(id)
is_used BOOLEAN DEFAULT false
used_at TIMESTAMP
created_at TIMESTAMP DEFAULT NOW()
expires_at TIMESTAMP -- optional expiry for codes
```

**partners**
```sql
id UUID PRIMARY KEY
partner_name TEXT NOT NULL
partner_type TEXT -- 'vet', 'crematorium', 'funeral_home', 'pet_store'
contact_email TEXT
contact_phone TEXT
address JSONB
commission_rate DECIMAL(5,2) DEFAULT 20.00 -- percentage
api_key TEXT UNIQUE -- for partner portal access
is_active BOOLEAN DEFAULT true
created_at TIMESTAMP DEFAULT NOW()
```

**supplier_orders**
```sql
id UUID PRIMARY KEY
order_id UUID REFERENCES orders(id)
supplier_name TEXT -- 'Metal Image NZ' or 'Seritag'
order_details JSONB -- specs, quantity, etc.
supplier_status TEXT -- 'pending', 'sent', 'in_production', 'shipped', 'received'
cost DECIMAL(10,2)
created_at TIMESTAMP DEFAULT NOW()
completed_at TIMESTAMP
```

**activity_log**
```sql
id UUID PRIMARY KEY
memorial_id UUID REFERENCES memorial_records(id)
activity_type TEXT -- 'created', 'viewed', 'updated', 'renewal_reminder', 'expired'
details JSONB
ip_address TEXT
user_agent TEXT
created_at TIMESTAMP DEFAULT NOW()
```

**pricing_history**
```sql
id UUID PRIMARY KEY
hosting_duration INTEGER NOT NULL -- 5, 10, or 25
product_type TEXT NOT NULL -- 'nfc_only', 'qr_only', 'both'
price DECIMAL(10,2) NOT NULL
effective_from TIMESTAMP NOT NULL
effective_to TIMESTAMP -- null = current pricing
created_at TIMESTAMP DEFAULT NOW()
```

---

## Workflows

### 1. Online Purchase Flow (New Order)

**Customer Journey:**
1. Customer visits memoriqr.co.nz
2. Selects hosting duration (5/10/25 years)
3. Selects product type (NFC/QR/Both)
4. Completes checkout via Stripe

**Automation Flow:**
1. Payment success → Stripe webhook to Pipedream
2. Pipedream creates entry in Supabase:
   - `customers` table (if new customer)
   - `orders` table (order details)
   - `memorial_records` table (pre-create record, is_published=false)
   - Sets `hosting_duration`, `product_type`, `base_price`
   - Calculates `hosting_expires_at` = order_date + hosting_duration
3. Generate unique activation code and memorial slug
4. **IF product_type includes QR plate** (qr_only or both):
   - Create `supplier_orders` entry for Metal Image NZ
   - Send automated email to Metal Image NZ with:
     - Order number
     - QR code image (generated via API, points to memorial URL)
     - Shipping address
5. **IF product_type is nfc_only:**
   - Skip Metal Image NZ order
   - Mark for immediate NFC programming and shipping
6. Send confirmation email to customer via SendGrid:
   - Order details
   - Upload link with activation code
   - What happens next
   - Timeline (2-3 days for NFC, 7-10 days for plates)

### 2. Content Upload & Memorial Activation

**Customer uploads content:**
1. Customer clicks link in email → lands on WordPress upload page
2. Enters activation code (validates against `memorial_records`)
3. Fills in memorial details:
   - Deceased name, dates, story/text
   - Upload photos (max based on tier: 20/40/60)
   - Upload videos (max based on tier: 2/3/5) OR provide YouTube links

**Automation:**
1. Form submission → Pipedream webhook
2. Photos uploaded to Cloudinary:
   - Auto-compress to WebP
   - Generate thumbnails
   - Return Cloudinary URLs
3. Videos uploaded to YouTube (customer's account or MemoriQR channel):
   - Set to "unlisted" for privacy
   - Generate embed codes
4. Pipedream updates `memorial_records` in Supabase:
   - Populate `photos_json` and `videos_json`
   - Update `photo_count` and `video_count`
   - Verify counts don't exceed `photo_limit` and `video_limit`
   - Save `memorial_text`
   - Set `is_published = true` (makes memorial live)
5. Memorial page generated at: memoriqr.co.nz/memorial/[slug]
6. Send confirmation email with memorial URL

### 3. Physical Product Fulfillment

**For QR Plates:**
1. Metal Image NZ receives order email
2. Produces engraved plate (5-7 days)
3. Ships to MemoriQR or directly to customer
4. MemoriQR receives tracking number → updates `orders.tracking_number`
5. Customer receives shipping notification via SendGrid

**For NFC Tags:**
1. Program NFC tag with memorial URL using NFC Tools app
2. Attach to backing card with instructions
3. Package and ship via NZ Post
4. Generate tracking → update database

**For Both:**
1. Wait for QR plate from Metal Image NZ
2. Program NFC tag
3. Package both together
4. Ship with combined instructions

### 4. Retail Partner Flow

**Setup:**
1. Partner (vet/crematorium) signs up via partner portal
2. MemoriQR creates `partners` entry in Supabase
3. Generate batch of activation codes:
   - Insert 50-100 codes into `retail_activation_codes`
   - Link to `partner_id`
   - Print codes on physical tags or cards
4. Ship pre-made tags to partner with instructions

**Customer Activation:**
1. Customer receives tag from partner (e.g., with pet's ashes)
2. Scans QR code → redirects to memoriqr.co.nz/activate?code=XXXXX
3. Enter activation code on WordPress activation page
4. Supabase validates code:
   - Check `retail_activation_codes.is_used = false`
   - Check code hasn't expired
5. If valid, proceed to upload flow (same as online purchase #2)
6. Mark code as used: `is_used = true`, `used_at = NOW()`
7. Create `memorial_records` entry with partner attribution
8. Partner earns commission (tracked for monthly payout)

### 5. Renewal Flow

**Automated Renewal Reminders:**
1. **Pipedream scheduled trigger** runs daily at 9am NZST
2. Query Supabase for memorials where:
   - `days_until_expiry IN (30, 7, 1)`
   - `renewal_status = 'active'`
3. For each memorial, send personalized email via SendGrid:
   - **30 days:** Friendly reminder with renewal link
   - **7 days:** Urgent reminder with consequences of expiry
   - **1 day:** Final notice with same-day renewal option
4. Email includes Stripe payment link:
   - 1 year renewal: $24
   - 5 year bulk: $99
   - 10 year bulk: $199
5. Log in `activity_log`: renewal_reminder sent

**Payment & Extension:**
1. Customer clicks renewal link → Stripe checkout
2. Payment success → Stripe webhook to Pipedream
3. Pipedream identifies memorial from payment metadata
4. Update Supabase `memorial_records`:
   - `hosting_expires_at` += renewal duration (1/5/10 years)
   - `renewal_status = 'renewed'`
   - `updated_at = NOW()`
5. Send confirmation email: "Your memorial is renewed until [new date]"
6. Log in `activity_log`: renewal completed

**Grace Period (No Payment):**
1. **Day 0** (expiry date): Memorial still live but shows banner:
   - "Hosting expired on [date]. Renew now to keep your memorial online."
2. **Days 1-30:** Banner remains, memorial accessible
3. **Day 30 post-expiry:**
   - Set `is_published = false` (memorial goes offline)
   - Redirect memorial URL to: "This memorial's hosting has expired. Renew to restore."
4. Send "final warning" email:
   - Memorial is now offline
   - Can still renew within 90 days
   - After 90 days, content will be archived
5. **Day 121 (90 days post-expiry):**
   - Archive memorial data to cold storage (optional)
   - Send final email with data export link (photos/videos zip)
   - Customer has 30 days to download

### 6. Memorial Page Views (Analytics)

**Every page view:**
1. JavaScript on memorial page triggers on load
2. Fetch request to Pipedream webhook with:
   - Memorial ID
   - Timestamp
   - IP address (anonymized)
   - User agent
3. Pipedream updates Supabase:
   - Increment `memorial_records.views_count`
   - Update `last_viewed`
   - Insert record in `activity_log` (type: 'viewed')
4. Optional: Generate weekly/monthly analytics reports for customer

---

## Important Business Rules

1. **Memorial URLs are permanent:** Once a slug is assigned (memoriqr.co.nz/memorial/fluffy-2024), it never changes, even if content is updated

2. **Orders with QR plates** (qr_only or both) trigger automatic email to Metal Image NZ with QR code specifications. NFC-only orders skip this step

3. **Hosting expiry grace period:** 30 days after hosting expires, memorial remains accessible with renewal banner. After 30 days, goes offline but can be restored within 90 days

4. **Retail activation codes** can only be used once. If a customer tries to reuse a code, show error and provide support contact

5. **Video hosting privacy:** All videos uploaded to YouTube must be set to "unlisted" (not private, not public). Unlisted means only people with the link can view, which is appropriate for memorial pages

6. **Hosting expiry reminders** sent at 30 days, 7 days, and 1 day before expiry via automated Pipedream workflow

7. **Grace period** of 30 days after hosting expires before memorial goes offline, then 90-day data export window

8. **NFC-only orders** ship immediately (2-3 days) as no engraving wait time required

9. **Renewal pricing locked** at $24/year regardless of inflation, since customer acquisition cost already paid upfront

10. **Content moderation:** All memorials reviewed within 24 hours of publishing. Inappropriate content flagged for manual review

11. **Media limits enforced:** Upload forms validate photo/video counts against tier limits (20/40/60 photos, 2/3/5 videos). Customers can purchase add-ons after initial upload.

12. **Video privacy:** All uploaded videos (non-YouTube) are hosted as unlisted. YouTube-linked videos must be set to unlisted by customer.

---

## Development Scripts (DEV Environment Only)

> **Note:** These scripts are for the Next.js development environment. Production uses Pipedream workflows.

Utility scripts for local development and debugging are located in `/scripts/`:

### Available Scripts

**check-code.js** - Check if an activation code exists in the database
```bash
node scripts/check-code.js ABC123
# Searches both retail_activation_codes and orders tables
```

**insert-test-code.js** - Insert a test activation code for development
```bash
node scripts/insert-test-code.js
# Creates retail activation code with predefined values for testing
```

**list-orders.js** - List recent orders from the database
```bash
node scripts/list-orders.js
# Shows last 10 orders with customer details
```

**check-order-status.js** - Check specific order details
```bash
node scripts/check-order-status.js MQ-12345678
# Returns full order record for debugging
```

**run-migration.ts** - Run database migrations
```bash
npx ts-node scripts/run-migration.ts
# Applies pending Supabase migrations
```

### Running Scripts

All scripts require `.env.local` with Supabase credentials:
```bash
# Load environment variables
node --require dotenv/config scripts/check-code.js ABC123

# Or with explicit path
node scripts/check-code.js ABC123  # (scripts load dotenv internally)
```

---

## Cost Analysis

### Assumptions
- Average memorial based on tier mix (30% 5yr, 50% 10yr, 20% 25yr)
- Average photos: ~35 photos per memorial (weighted average)
- Photo size after WebP compression: 1.5MB each
- Average storage per memorial: ~52MB
- Videos hosted on YouTube = $0 storage/bandwidth
- Average views: 100 visits/year
- Bandwidth per visit: Photos only (videos via YouTube)
- Total bandwidth per memorial per year: ~5.2GB

### Hosting Costs by Scale

**Year 1 (100 memorials):**
- Storage: 5.2GB (photos only, videos on YouTube)
- Bandwidth: 520GB/year (~43GB/month)
- Hostinger Business: $3/month (includes unlimited bandwidth)
- Cloudinary: Free tier (25GB storage, 25 credits) - need upgrade
- Cloudinary Plus: $89/month (225GB storage, 225 credits)
- Supabase: Free tier (500MB database)
- **Total: ~$90-95/month**

**Year 2 (500 memorials):**
- Storage: 26GB
- Bandwidth: 2.6TB/year (~217GB/month)
- Hostinger Business: $3/month
- Cloudinary Plus: $89/month (sufficient)
- Supabase: Pro $25/month (database >500MB)
- Pipedream: Core $9/month (>10k ops/month)
- SendGrid: Free tier (300 emails/day)
- **Total: ~$125-130/month**

**Year 3 (2000 memorials):**
- Storage: 104GB
- Bandwidth: 10.4TB/year (~867GB/month)
- Hostinger Business: $3/month (still unlimited bandwidth)
- Cloudinary Plus: $89/month (225GB sufficient)
- Supabase: Pro $25/month
- Pipedream: Core $9/month
- SendGrid: Essentials $15/month (if >300 emails/day)
- **Total: ~$140-145/month**

### Key Cost Drivers

**Bandwidth:** Mitigated by YouTube video hosting ($0) and Hostinger's unlimited bandwidth. With media limits, bandwidth is predictable and manageable.
**Storage:** Cloudinary Plus tier ($89/month) covers up to 2000+ memorials with photo limits enforced.
**Database:** Supabase free tier sufficient until ~500 memorials, then Pro $25/month.
**Email:** SendGrid free tier covers ~10 emails/day; upgrade to Essentials at scale.
**Media limits:** Critical cost control - without limits, storage could exceed 300GB requiring Advanced tier ($224/month).

### Transaction Costs

**Stripe fees:** 2.9% + $0.30 NZD per transaction
- Average order $200: Fee = $6.10
- Net revenue: $193.90

**No currency conversion:** Stripe supports NZD and AUD directly, avoiding 1% conversion fees

---

## Break-Even Analysis

### Revenue Model Assumptions
- Average order value: $220 (mix of 5/10/25 year tiers, mix of NFC/QR/Both)
- Product mix: 30% NFC-only, 40% QR-only, 30% Both
- Renewal rate: 70% (30% churn after initial period)

### Variable Costs per Memorial
- NFC tag: $7
- QR plate: $45 (when applicable)
- Shipping: $10
- Platform fees (Stripe): ~$6
- Storage/bandwidth (amortized): $1-2/year
- **Average variable cost: $45-65 depending on product type**

### Fixed Costs
- Hosting/tools: $50-140/month (scales with volume)
- Domain: $10/year
- Business registration: $50/year
- Marketing: $500-1000/month (variable, treat as semi-fixed)

### Break-Even Calculation

**Year 1 (targeting 100 memorials):**
- Revenue: 100 × $220 = $22,000
- Variable costs: 100 × $55 (avg) = $5,500
- Fixed costs: $90/month × 12 = $1,080 hosting + $1,000 other = $2,080
- Gross profit: $22,000 - $5,500 - $2,080 = **$14,420**
- **Break-even: ~35 memorials**

**Year 2 (targeting 500 memorials):**
- New memorials: 400 (cumulative 500)
- Renewals: 70 × $24 = $1,680
- Revenue: 400 × $220 + $1,680 = $89,680
- Variable costs: 400 × $55 = $22,000
- Fixed costs: $125/month × 12 = $1,500 + $1,000 = $2,500
- Gross profit: $89,680 - $22,000 - $2,500 = **$65,180**

**Year 3 (targeting 2000 cumulative):**
- New memorials: 1500
- Renewals: ~350 × $24 = $8,400 (assumes 70% renewal from Year 1-2)
- Revenue: 1500 × $220 + $8,400 = $338,400
- Variable costs: 1500 × $55 = $82,500
- Fixed costs: $145/month × 12 = $1,740 + $1,000 = $2,740
- Gross profit: $338,400 - $82,500 - $2,740 = **$253,160**

### Profitability Timeline
- **Month 3-4:** Break-even (35-40 orders)
- **Month 12:** $14k+ profit (100 orders)
- **Year 2:** $65k+ profit (500 cumulative)
- **Year 3:** $253k+ profit (2000 cumulative)

---

## Risk Analysis

### Technical Risks

**1. Bandwidth Spikes**
- **Risk:** If video views exceed assumptions or customers upload 4K videos
- **Impact:** Could add $50-100/month in overages
- **Mitigation:** YouTube for ALL videos (unlimited free bandwidth), enforce file size limits

**2. Storage Abuse**
- **Risk:** Customers upload maximum allowed photos repeatedly or use large file sizes
- **Impact:** Storage costs increase faster than projected
- **Mitigation:** 
  - Enforce hard limits: 20/40/60 photos max by tier, 2/3/5 videos max
  - Max file size: 10MB per photo, 100MB per video
  - Automatic compression via Cloudinary (WebP format reduces size 25-35%)
  - Form validation prevents oversized uploads
  - Add-on pricing for extra capacity ($10/20 photos) discourages abuse

**3. Platform Outages**
- **Risk:** Hostinger, Supabase, or YouTube downtime
- **Impact:** Memorials inaccessible during grief period
- **Mitigation:**
  - Choose providers with 99.9%+ uptime SLAs
  - Monitor with UptimeRobot (free)
  - Display status page during outages

**4. Security Breaches**
- **Risk:** WordPress hacks, database leaks
- **Impact:** Customer data exposed, GDPR violations
- **Mitigation:**
  - WordPress security plugins (Wordfence free tier)
  - Supabase Row Level Security (RLS) policies
  - Regular backups (daily via Hostinger)
  - SSL certificates (free via Let's Encrypt)

### Business Risks

**5. Renewal Churn**
- **Risk:** 30-40% of customers don't renew after initial period
- **Impact:** Lost recurring revenue
- **Mitigation:**
  - Emotional reminder emails: "Keep [pet name]'s memory alive"
  - Offer bulk renewals at discount (10 years for $99)
  - Grace period encourages late renewals

**6. Competitor Pricing**
- **Risk:** $99 USD (~$160 NZD) lifetime competitors
- **Impact:** Price-sensitive customers choose them
- **Mitigation:**
  - Emphasize local NZ service, faster delivery
  - Superior materials (Metalphoto® 20+ year UV vs unknown)
  - NFC option (competitors don't offer)
  - Better support and understanding of NZ/Māori culture

**7. Retail Partner Friction**
- **Risk:** Vets/crematoriums don't want to sell tags
- **Impact:** B2B2C channel fails
- **Mitigation:**
  - 20% commission (strong incentive)
  - Zero effort: pre-made tags, customer activates themselves
  - Co-marketing materials provided
  - Trial with 2-3 partners before scaling

**8. Supplier Dependency**
- **Risk:** Metal Image NZ goes out of business or raises prices
- **Impact:** Can't fulfill QR plate orders
- **Mitigation:**
  - Identify backup supplier (LaserMaster NZ, GraphicGuru)
  - Negotiate annual price lock
  - Keep 20-30 blank plates in stock for emergencies

### Financial Risks

**9. Unsustainable Lifetime Hosting**
- **Risk:** If offering "true lifetime," costs accumulate indefinitely
- **Impact:** Unprofitable after 1500+ memorials
- **Mitigation:**
  - Use "prepaid hosting" (5/10/25 years) instead of "lifetime"
  - Clearly state hosting duration in terms
  - Renewal model ensures ongoing revenue

**10. Cash Flow Gaps**
- **Risk:** Upfront costs (inventory, marketing) before revenue
- **Impact:** Can't fulfill orders
- **Mitigation:**
  - Start with 50 orders (minimal inventory)
  - Pre-orders before bulk inventory purchase
  - Line of credit or personal savings buffer ($5k)

### Scaling Risks

**11. Customer Support Overwhelm**
- **Risk:** At 500+ customers, support requests exceed capacity
- **Impact:** Poor reviews, churn
- **Mitigation:**
  - Comprehensive FAQ page
  - Video tutorials for upload process
  - Hire part-time VA at 500+ memorials
  - Ticketing system (Freshdesk free tier)

**12. Manufacturing Bottlenecks**
- **Risk:** Metal Image NZ can't keep up with 50+ orders/month
- **Impact:** Delivery delays, angry customers
- **Mitigation:**
  - Communicate lead times clearly (7-10 days)
  - Order batching: weekly batch to Metal Image
  - Identify second supplier as backup

---

## Marketing Strategy

### Target Channels

**1. SEO/Content Marketing (Highest ROI)**
- Blog on memoriqr.co.nz:
  - "Coping with Pet Loss: A Guide for NZ Families"
  - "10 Ways to Honor Your Pet's Memory"
  - "QR vs NFC Memorial Tags: Which is Right for You?"
- Target keywords: "pet memorial NZ", "QR code memorial", "pet loss tribute"
- Aim: 10 posts in first 3 months, then 4/month
- Use Yoast SEO plugin for optimization
- Goal: Rank page 1 for 5 keywords by Month 6

**2. Social Media (Brand Building)**
- Instagram: @memoriqr_nz
  - User-generated content: Customer memorial photos (with permission)
  - Stories: Behind-the-scenes, customer testimonials
  - Reels: How to activate your tag, memorial ideas
- Facebook: MemoriQR NZ
  - Pet loss support group (free value, builds community)
  - Share blog posts, memorial spotlights
- Posting frequency: 3-4x/week
- Budget: $200/month on Facebook Ads targeting "recent pet loss" in NZ/AU

**3. Partnership Marketing (B2B2C)**
- Approach 10 vets/crematoriums in Auckland
- Offer:
  - 20% commission on every activation
  - Free starter kit: 20 pre-made tags, display stand, brochures
  - Co-branded marketing materials
- Host lunch-and-learn: "How to offer memorial services"
- Goal: 3 partners by Month 3, 10 by Month 12

**4. Google Ads (High Intent Traffic)**
- Budget: $100-200/month
- Target keywords:
  - "pet memorial NZ" (CPC ~$2-4)
  - "QR memorial tag" (CPC ~$1-3)
  - "pet cremation memorial" (CPC ~$3-5)
- Landing page: Direct to product selector
- Goal: 5-10 conversions/month, CAC <$50

**5. Email Marketing (Nurture & Upsell)**
- Build list via blog opt-ins: "Free Pet Loss Guide"
- Segments:
  - Recent loss (nurture sequence: grief resources → introduce product)
  - Existing customers (renewal reminders, upsell to longer plans)
- Tool: SendGrid (free tier, 300 emails/day)
- Frequency: 1-2 emails/week to active segments

**6. Influencer/Affiliate Marketing**
- Identify NZ pet bloggers/Instagram influencers:
  - @nzpetlovers, @kiwipets, etc.
- Offer: Free memorial tag + $20 per referral sale
- Request: Authentic review post/video
- Goal: 3-5 influencers by Month 6

**7. Offline/Events**
- Pet expos (e.g., Auckland Pet & Animal Expo)
  - Booth cost: ~$500-1000
  - Demo live QR scanning, hand out brochures
- Vet clinic waiting rooms: Leave brochures/business cards
- Funeral home partnerships: Display materials

### Budget (Year 1)

| Channel | Monthly | Annual |
|---------|---------|--------|
| Facebook Ads | $200 | $2,400 |
| Google Ads | $150 | $1,800 |
| Content/SEO Tools | $50 | $600 |
| Influencer/Affiliates | $100 | $1,200 |
| Events/Offline | $100 | $1,200 |
| Email Marketing | $0-15 | $0-180 |
| **TOTAL** | **$600-650** | **$7,200-7,800** |

### Metrics to Track

- **Website traffic:** Google Analytics (free)
- **Conversion rate:** WooCommerce analytics (goal: 3-5%)
- **Customer acquisition cost (CAC):** Marketing spend / new customers (target: <$40)
- **Lifetime value (LTV):** Average order + renewals (target: $250+)
- **Renewal rate:** % of customers who renew (target: 70%+)
- **Partner activations:** Retail tags activated per partner (target: 5-10/month each)

---

## Legal & Compliance

### Required Policies

**1. Privacy Policy (GDPR/Privacy Act 2020 Compliance)**
- What data is collected: Names, emails, photos, videos, memorial text
- How it's used: Memorial page display, email communications
- How it's stored: Cloudinary (images), YouTube (videos), Supabase (database)
- User rights: Access, deletion, portability (GDPR)
- Data retention: Duration of hosting period + 90 days grace
- Third-party sharing: Only processors (Stripe, Cloudinary, etc.)
- Cookie policy: Analytics cookies (Google Analytics)

**2. Terms of Service**
- Hosting duration clearly stated (5/10/25 years prepaid)
- Renewal terms and grace periods
- Content ownership: Customer retains all rights to uploaded content
- Acceptable use: No illegal, hateful, or inappropriate content
- Takedown policy: MemoriQR reserves right to remove offensive content
- Refund policy: 30-day money-back if product not shipped
- Limitation of liability: Not responsible for data loss (backups encouraged)

**3. Content Moderation Policy**
- All memorials reviewed within 24 hours of publishing
- Prohibited content: Illegal material, hate speech, graphic violence
- Process: Automated flagging + manual review
- Takedown: Immediate for illegal content, 48-hour notice for borderline
- Appeal process: Email support@memoriqr.co.nz

**4. Consumer Guarantees Act (NZ)**
- Products must be fit for purpose (physical tags work as described)
- Services must be carried out with care (hosting uptime >99%)
- Refunds if product defective or service fails
- Clear communication of hosting duration limits

### Data Security Measures

- SSL/TLS encryption (HTTPS) on all pages
- Supabase Row Level Security (RLS) policies
- WordPress security plugins (Wordfence, limit login attempts)
- Regular backups (daily automated via Hostinger)
- Password hashing (bcrypt) for any user accounts
- Two-factor authentication for admin access
- PCI compliance via Stripe (MemoriQR never stores card data)

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Database Setup:**
- [ ] Sign up for Supabase (free tier)
- [ ] Execute SQL schema (all tables from Database Schema section)
- [ ] Set up Row Level Security policies
- [ ] Create initial pricing_history entries (current prices)

**Hosting & Domain:**
- [ ] Purchase Hostinger Business plan ($144/year)
- [ ] Register memoriqr.co.nz domain ($10/year)
- [ ] Install WordPress + WooCommerce
- [ ] Install SSL certificate (free via Let's Encrypt)

**Essential Plugins:**
- [ ] Elementor Pro ($59/year) - page builder
- [ ] Advanced Custom Fields Pro ($49/year) - memorial templates
- [ ] WPForms ($39/year) - upload forms
- [ ] Yoast SEO (free) - SEO optimization
- [ ] Wordfence (free) - security

### Phase 2: E-Commerce Setup (Weeks 3-4)

**WooCommerce Configuration:**
- [ ] Set up Stripe payment gateway (NZD + AUD)
- [ ] Create variable product: "MemoriQR Memorial"
  - Attribute 1: Hosting Duration (5/10/25)
  - Attribute 2: Product Type (NFC/QR/Both)
  - Prices auto-calculate based on selection
- [ ] Add product images and descriptions
- [ ] Configure shipping zones (NZ flat rate $10, AU $15)
- [ ] Set up tax rules (15% GST in NZ)

**Custom Fields for Orders:**
- [ ] Add "Deceased Name" field (pre-fill memorial)
- [ ] Add "Memorial Type" field (Pet/Human)

### Phase 3: Automation (Weeks 5-6)

**Pipedream Setup:**
- [ ] Sign up for Pipedream (free tier)
- [ ] Create workflow: Stripe Payment → Supabase Insert
  - Trigger: Stripe webhook (payment.succeeded)
  - Action: Insert into customers, orders, memorial_records
  - Action: Generate activation code
- [ ] Create workflow: Order → Metal Image NZ Email
  - Trigger: New order in Supabase (product_type includes 'qr')
  - Action: Generate QR code via API
  - Action: Send email to Metal Image NZ with specs
- [ ] Create workflow: Upload Form → Memorial Creation
  - Trigger: WPForms webhook
  - Action: Upload images to Cloudinary
  - Action: Update memorial_records in Supabase
  - Action: Set is_published = true
- [ ] Create workflow: Daily Renewal Reminder
  - Trigger: Scheduled (daily 9am NZST)
  - Action: Query memorials with days_until_expiry in (30,7,1)
  - Action: Send emails via SendGrid

**SendGrid Setup:**
- [ ] Sign up for SendGrid (free tier)
- [ ] Create email templates:
  - Order confirmation with upload link
  - Upload received confirmation
  - Renewal reminder (30/7/1 day versions)
  - Hosting expired notice
  - Final data export notice
- [ ] Verify sender domain (memoriqr.co.nz)

### Phase 4: Memorial Pages (Weeks 7-8)

**WordPress Template:**
- [ ] Create custom page template: memorial-template.php
- [ ] Use ACF to create fields:
  - Deceased name, dates, type (pet/human)
  - Memorial text/story
  - Photos gallery (pull from Cloudinary URLs in DB)
  - Video embeds (YouTube unlisted)
- [ ] Design with Elementor:
  - Clean, minimal design
  - Mobile-responsive
  - Share buttons (Facebook, Email)
  - View counter display
- [ ] Add memorial navigation: /memorial/[slug]
- [ ] Set up 404 redirect for expired memorials

**Cloudinary Integration:**
- [ ] Sign up for Cloudinary (free tier)
- [ ] Install WordPress plugin
- [ ] Configure auto-upload and WebP conversion
- [ ] Set up responsive image transformations

### Phase 5: Testing (Week 9)

**End-to-End Tests:**
- [ ] Test online purchase flow (all 9 product combinations)
- [ ] Verify Stripe payments work (test mode)
- [ ] Confirm email automations trigger correctly
- [ ] Test upload form and memorial generation
- [ ] Verify QR codes redirect to correct memorial URLs
- [ ] Test renewal reminder workflow (manually trigger)
- [ ] Test grace period and expiry logic

**User Acceptance Testing:**
- [ ] Recruit 3-5 friends/family as beta testers
- [ ] Have them complete full flow: order → upload → view memorial
- [ ] Gather feedback on UX, clarity, emotional tone
- [ ] Fix critical bugs

### Phase 6: Content & Marketing (Week 10)

**Website Content:**
- [ ] Write homepage copy (value proposition, how it works)
- [ ] Create "How It Works" page with video/images
- [ ] Write FAQ page (15-20 common questions)
- [ ] Create blog with 3-5 initial posts (SEO keywords)
- [ ] Write About Us page (story, mission)
- [ ] Create Privacy Policy and Terms of Service pages

**Marketing Assets:**
- [ ] Design product brochures (for retail partners)
- [ ] Create social media templates (Canva)
- [ ] Set up Instagram and Facebook pages
- [ ] Create Google My Business listing
- [ ] Film product demo video (2-3 minutes)

### Phase 7: Soft Launch (Week 11)

**Beta Launch:**
- [ ] Announce to personal network (email, social media)
- [ ] Offer 20% discount to first 20 customers (promo code: BETA20)
- [ ] Monitor orders and support requests closely
- [ ] Fix any issues immediately
- [ ] Collect testimonials from happy customers

**Retail Partner Pilot:**
- [ ] Approach 2-3 vet clinics or crematoriums
- [ ] Present partnership proposal (20% commission)
- [ ] Create batch of 20 activation codes per partner
- [ ] Ship pre-made NFC tags with instructions
- [ ] Track activations weekly

### Phase 8: Public Launch (Week 12)

**Go Live:**
- [ ] Remove beta discount
- [ ] Launch Facebook/Instagram ad campaigns ($200/month)
- [ ] Start Google Ads ($150/month)
- [ ] Publish launch announcement on blog
- [ ] Email personal network with official launch news
- [ ] Submit to NZ startup directories (NZ Entrepreneur, etc.)

**Ongoing Operations:**
- [ ] Monitor Pipedream workflows daily
- [ ] Respond to customer support emails within 24 hours
- [ ] Review new memorials for content policy compliance
- [ ] Track key metrics: orders, conversion rate, CAC, LTV
- [ ] Publish 1-2 blog posts per week
- [ ] Post to social media 3-4x per week

---

## Next Steps (Immediate Actions)

1. **Finalize product decisions:**
   - Confirm Metalphoto® plate pricing
   - Order sample NFC tags from Seritag to test

2. **Set up accounts:**
   - Supabase (database)
   - Hostinger (hosting)
   - Stripe (payments)
   - Pipedream (automation)
   - SendGrid (email)
   - Cloudinary (image storage)

3. **Execute database schema:**
   - Run SQL scripts in Supabase
   - Test inserts/queries

4. **Build WooCommerce product:**
   - Variable product with 9 variations
   - Test checkout flow

5. **Create first automation:**
   - Stripe → Supabase workflow in Pipedream
   - Test with Stripe test mode

6. **Design memorial template:**
   - Sketch wireframe
   - Build in Elementor
   - Test with dummy data

7. **Write essential content:**
   - Homepage copy
   - Terms of Service
   - Privacy Policy

8. **Recruit beta testers:**
   - 5 people willing to test full flow
   - Offer free or heavily discounted memorial

---

## Key Success Metrics

### Year 1 Goals
- **100 memorials sold** (avg $220 = $22k revenue)
- **3 retail partners** activated
- **70% renewal rate** (for any expirations)
- **Website traffic:** 1,000 visits/month by Month 12
- **CAC < $40** (customer acquisition cost)
- **Net profit:** $10k+ after costs

### Year 2 Goals
- **500 cumulative memorials**
- **10 retail partners**
- **Email list:** 500+ subscribers
- **Blog traffic:** 2,000 visits/month
- **Net profit:** $50k+

### Year 3 Goals
- **2,000 cumulative memorials**
- **25 retail partners**
- **Expansion to Australia market** (dedicated .com.au site)
- **Net profit:** $200k+

---

## Business Viability Summary

**Market Opportunity:**
- QR memorial market growing 7.5% CAGR globally, projected $125M by 2026
- NZ/AU pet ownership: 80% of households (3.2M+ pets in NZ)
- Human memorials digitalizing, especially among younger generations
- Māori cultural trends toward incorporating technology in memorials

**Competitive Advantage:**
- Local NZ service (faster delivery, timezone support)
- Premium materials (Metalphoto® anodised aluminium, 20+ year UV resistance)
- Optional NFC technology (unique differentiator)
- Prepaid hosting model (more sustainable than "lifetime")
- Understanding of NZ/Māori cultural context

**Financial Viability:**
- Break-even: 30-40 orders (achievable Month 3-4)
- Gross margins: 70-80% after variable costs
- Recurring revenue: 70% renewal rate provides stability
- Scalable: Costs grow sub-linearly with volume
- Low capital requirements: <$5k to start

**Challenges:**
- Price-sensitive market (competing with $160 NZD lifetime option)
- Emotional product (requires sensitive marketing)
- Renewal friction (need strong automation and messaging)
- Physical product dependency (supplier risk)

**Recommendation:** Viable and promising. Strong market fundamentals, sustainable business model with clear path to profitability. Focus on:
1. Exceptional customer experience (grief-sensitive)
2. Local service quality (beat international competitors on delivery/support)
3. Retail partnerships (B2B2C distribution)
4. Content marketing (SEO for long-term low-CAC growth)

Start small (50-100 orders Year 1), validate product-market fit, then scale marketing spend based on proven unit economics.
---

## Session Progress Log (Auto-saved)

### January 18, 2026 - Latest Session

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
