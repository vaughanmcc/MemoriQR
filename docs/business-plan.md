# MemoriQR Business Plan

> Full business documentation. See project.md for quick reference.

## Executive Summary

MemoriQR creates lasting digital memorials for pets and people through NFC tags and QR-engraved Metalphoto® plates. Customers scan these physical items to access personalized memorial webpages with photos, videos, and stories - hosted for 5 or 10 years prepaid depending on package tier.

**Business Model:** Direct-to-consumer e-commerce + B2B2C (retail partners)
**Location:** Auckland, New Zealand - targeting NZ + Australia
**Unique Value:** Premium Metalphoto® plates (20+ year UV resistance), local NZ service, optional NFC technology

---

## Pricing Structure

### STANDARD - $149 NZD
- NFC Tag + 5 years hosting
- 20 photos, 2 videos
- 5 memorial themes, 5 photo frames

### HEADSTONE - $199 NZD (Most Popular)
- QR Plate only + 10 years hosting
- 40 photos, 3 videos
- 10 memorial themes, 10 photo frames

### PREMIUM - $279 NZD
- NFC Tag + QR Plate + 10 years hosting
- 40 photos, 3 videos
- 10 memorial themes, 10 photo frames

**Renewal:** $29/year | **Extensions:** 1 year $29, 5 years $99, 10 years $179

---

## Products

### Physical Products

**NFC Tags:** NFC215 stickers from Seritag ($5-10/unit, 2-day turnaround)

**QR Plates:** Metalphoto® anodised aluminium
- Sub-surface imaging under 8 micron protective layer
- 20+ years UV resistance, withstands 300°C+
- Cost: $40-50/unit, 5-7 day turnaround

### Digital Product

Memorial webpage with:
- Photo storage (20/40/60 by tier)
- Video hosting (2/3/5 by tier) via YouTube
- Custom URL: memoriqr.co.nz/memorial/[slug]
- Mobile-responsive, no ads

---

## Target Markets

### Primary (70% revenue): Pet Owners
- NZ/AU: 80% households have pets
- Price tolerance: $100-300
- Entry: 5-year NFC tags at vets

### Secondary (30% revenue): Human Memorials
- Funeral homes, crematoriums
- Higher tolerance: $249-349
- Cultural: Māori memorial traditions

### Distribution
- Direct online: 60%
- Retail partners: 40%

---

## Cost Analysis

### Fixed Costs

| Service | Cost | Notes |
|---------|------|-------|
| GitHub Copilot+ | $39/mo | AI coding assistant |
| GitHub Repo | $20/mo | Private repository |
| Vercel Pro | ~$20/mo | Next.js hosting |
| Supabase | $0-25/mo | Database (free tier initially) |
| Hostinger | $83.88 AUD/yr (~$7/mo) | Email hosting |
| DomainsDirect | $27.03/yr (~$2/mo) | memoriqr.co.nz domain |
| One NZ | $46/mo | Mobile plan (incl GST) |
| Cloudinary | $0 | Free tier (25GB) |
| YouTube | $0 | Video hosting (unlisted) |
| Pipedream | $0-19/mo | Email workflows |

**Monthly Fixed:** ~$134-176/mo (depending on tiers)

### Seritag NFC Tag Pricing (USD)

**Once-off artwork setup:** $84.50 USD

**Per Tag Cost (USD):**
| Quantity | Per Tag | + Logo ($0.20) | Total/Tag |
|----------|---------|----------------|-----------|
| 5-99 | $0.81 | $0.20 | $1.01 |
| 100-999 | $0.76 | $0.20 | $0.96 |
| 1,000-4,999 | $0.68 | $0.20 | $0.88 |
| 5,000-9,999 | $0.60 | $0.20 | $0.80 |
| 10,000-19,999 | $0.59 | $0.20 | $0.79 |

**Estimated NZD Cost (@ 1.70 USD/NZD):**
| Quantity | Per Tag (NZD) | Notes |
|----------|---------------|-------|
| 5-99 | ~$1.72 | Small batch |
| 100-999 | ~$1.63 | Medium batch |
| 1,000+ | ~$1.50 | Volume pricing |

*Note: Previously estimated $7/tag included shipping + handling*

### Lead Generation / Referral Cards (USD)

| Item | Cost |
|------|------|
| 1,500 cards | $180 USD |
| Shipping | $180 USD |
| **Total** | **$360 USD (~$612 NZD)** |

**Per Card Cost:** $0.24 USD (~$0.41 NZD) incl shipping

### Metal Image NZ Pricing

**Once-off artwork setup:** $241.50 incl GST

**Base Plate Cost (incl GST):**
| Quantity | Per Plate |
|----------|-----------|
| 28 | $5.46 |
| 56 | $3.86 |
| 120 | $2.63 |

**QR Etching (incl GST):**
| Quantity | Per Plate |
|----------|-----------|
| 1 | $42.67 |
| 2 | $28.44 |
| 3-4 | $21.33 |
| 5-9 | $14.22 |
| 10-19 | $10.04 |
| 20-29 | $8.53 |
| 30-39 | $6.10 |
| 40+ | $4.27 |

**Total Plate Cost (Base + QR Etching):**
| Quantity | Per Plate | Notes |
|----------|-----------|-------|
| 1 | ~$48.13 | Single order |
| 28 | ~$13.99 | $5.46 + $8.53 |
| 56 | ~$8.13 | $3.86 + $4.27 |
| 120 | ~$6.90 | $2.63 + $4.27 |

### Variable Costs per Memorial
- NFC tag: $1.50-1.75 (Seritag, volume dependent) + shipping
- QR plate: $7-48 (volume dependent, see above)
- Shipping: $10
- Stripe fees: 2.9% + $0.30 (~$6 avg)
- **Average: $20-65** (lower at volume)

### Projected Monthly Costs by Scale
| Year | Memorials | Est. Monthly |
|------|-----------|--------------|
| Year 1 | 100 | ~$90-95/mo |
| Year 2 | 500 | ~$125-130/mo |
| Year 3 | 2,000 | ~$140-145/mo |

### Break-Even: ~35 memorials (Month 3-4)

---

## Key Business Rules

1. Memorial URLs are permanent
2. QR orders trigger Metal Image NZ email
3. 30-day grace period after expiry
4. Retail codes single-use only
5. Videos must be YouTube unlisted
6. Renewal reminders at 90/30/7 days before expiry
7. NFC-only ships immediately (2-3 days)
8. $29/year renewal pricing

---

## Australia Locale Support

MemoriQR uses a subfolder strategy (`/australia/*`) for SEO targeting of the Australian market.

### Implementation
- **URL Structure:** `/australia`, `/australia/order`, `/australia/how-it-works`, `/australia/about`
- **Currency Display:** Prices shown in AUD (A$149, A$199, A$279)
- **Charging Currency:** Transactions processed in NZD (same numeric values)
- **hreflang Tags:** Implemented for en-NZ, en-AU, x-default
- **Default Country:** AU pre-selected in order form for `/australia/*` pages

### SEO Keywords (Australia)
- pet memorial Australia
- QR pet tag Australia
- NFC pet tag Australia
- memorial tag Melbourne / Sydney / Brisbane
- pet remembrance gift Australia
- dog memorial tag
- cat memorial Australia

### Shipping to Australia
- 7-10 business days delivery
- Ships from Auckland, New Zealand
- All Australian states and territories covered

---

## Risk Summary

**Technical:** Bandwidth spikes, storage abuse, platform outages
**Business:** Renewal churn, competitor pricing, retail partner friction
**Financial:** Unsustainable lifetime hosting, cash flow gaps
**Scaling:** Support overwhelm, manufacturing bottlenecks

---

## Year 1 Goals

- 100 memorials sold ($22k revenue)
- 3 retail partners
- 70% renewal rate
- 1,000 visits/month
- CAC < $40
- Net profit: $10k+
