import { HostingDuration, ProductType, CurrentPricing } from '@/types/database'

// Fallback pricing if database is unavailable
export const DEFAULT_PRICING: Record<HostingDuration, Record<ProductType, number>> = {
  5: {
    nfc_only: 149,
    qr_only: 149,
    both: 199,
  },
  10: {
    nfc_only: 199,
    qr_only: 199,
    both: 279,
  },
  25: {
    nfc_only: 249,
    qr_only: 279,
    both: 349,
  },
}

// Simplified 3-tier pricing model
export type TierType = 'standard' | 'headstone' | 'premium'

export interface TierConfig {
  id: TierType
  name: string
  price: number
  productType: ProductType
  hostingDuration: HostingDuration
  contents: string
  description: string
  popular?: boolean
}

export const TIER_PRICING: Record<TierType, TierConfig> = {
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 149,
    productType: 'nfc_only',
    hostingDuration: 5,
    contents: 'NFC tag + 5 years',
    description: 'Tap-to-view NFC sticker. Ships in 2-3 days.',
  },
  headstone: {
    id: 'headstone',
    name: 'Headstone',
    price: 199,
    productType: 'qr_only',
    hostingDuration: 10,
    contents: 'QR plate only + 10 years',
    description: 'Weather-proof Metalphoto® anodised aluminium plate. Ships in 7-10 days.',
    popular: true,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 279,
    productType: 'both',
    hostingDuration: 10,
    contents: 'NFC + QR plate + 10 years',
    description: 'Complete set with both NFC tag and QR plate. Ships in 7-10 days.',
  },
}

export const TIER_OPTIONS: TierType[] = ['standard', 'headstone', 'premium']

export const RENEWAL_PRICING = {
  yearly: 24,
  fiveYear: 99,
  tenYear: 199,
}

// Extension pricing (as per business plan)
export const EXTENSION_PRICING = {
  '1_year': { price: 29, years: 1, label: '1 Year' },
  '5_year': { price: 99, years: 5, label: '5 Years' },
  '10_year': { price: 179, years: 10, label: '10 Years' },
} as const

export type ExtensionType = keyof typeof EXTENSION_PRICING

// Grace period settings
export const GRACE_PERIOD_DAYS = 30 // Memorial viewable but not editable
export const DATA_PRESERVATION_DAYS = 14 // Data kept after grace period before deletion
export const TOTAL_DAYS_BEFORE_DELETION = GRACE_PERIOD_DAYS + DATA_PRESERVATION_DAYS // 44 days total

// Reminder email schedule (days before expiry)
export const REMINDER_SCHEDULE = {
  first: 90,
  second: 30,
  final: 7,
} as const

// Upgrade pricing (Future Feature)
export const UPGRADE_PRICING = {
  additionalPhotos: 10,    // +20 photos for $10
  additionalVideos: 20,    // +10 videos for $20
  tierUpgradeFee: 10,      // Price difference + $10 fee
}

// Photo/video limits per tier
export const TIER_LIMITS: Record<HostingDuration, { photos: number; videos: number }> = {
  5: { photos: 20, videos: 2 },
  10: { photos: 40, videos: 3 },
  25: { photos: 60, videos: 5 },
}

// Calculate tier upgrade cost
export function getTierUpgradeCost(
  currentTier: HostingDuration,
  newTier: HostingDuration,
  productType: ProductType
): number {
  if (newTier <= currentTier) return 0
  const currentPrice = DEFAULT_PRICING[currentTier][productType]
  const newPrice = DEFAULT_PRICING[newTier][productType]
  return (newPrice - currentPrice) + UPGRADE_PRICING.tierUpgradeFee
}

export function getPrice(
  duration: HostingDuration,
  productType: ProductType,
  pricingData?: CurrentPricing[]
): number {
  if (pricingData) {
    const found = pricingData.find(
      (p) => p.hosting_duration === duration && p.product_type === productType
    )
    if (found) return found.price
  }
  return DEFAULT_PRICING[duration][productType]
}

export function getPricePerYear(duration: HostingDuration, productType: ProductType): number {
  const total = DEFAULT_PRICING[duration][productType]
  return Math.round((total / duration) * 100) / 100
}

export type Currency = 'NZD' | 'AUD'
export type Locale = 'nz' | 'au'

export function formatPriceNZD(amount: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPrice(amount: number, currency: Currency = 'NZD'): string {
  const locale = currency === 'AUD' ? 'en-AU' : 'en-NZ'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Get tier pricing for a specific locale (same prices, different currency display)
export function getTierPricingForLocale(locale: Locale = 'nz') {
  const currency: Currency = locale === 'au' ? 'AUD' : 'NZD'
  return {
    tiers: TIER_PRICING,
    currency,
    formatPrice: (amount: number) => formatPrice(amount, currency),
  }
}

export function calculateExpiryDate(orderDate: Date, durationYears: HostingDuration): Date {
  const expiry = new Date(orderDate)
  expiry.setFullYear(expiry.getFullYear() + durationYears)
  return expiry
}
