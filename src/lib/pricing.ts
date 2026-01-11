import { HostingDuration, ProductType, CurrentPricing } from '@/types/database'

// Fallback pricing if database is unavailable
export const DEFAULT_PRICING: Record<HostingDuration, Record<ProductType, number>> = {
  5: {
    nfc_only: 99,
    qr_only: 149,
    both: 199,
  },
  10: {
    nfc_only: 149,
    qr_only: 199,
    both: 249,
  },
  25: {
    nfc_only: 199,
    qr_only: 279,
    both: 349,
  },
}

export const RENEWAL_PRICING = {
  yearly: 24,
  fiveYear: 99,
  tenYear: 199,
}

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

export function formatPriceNZD(amount: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateExpiryDate(orderDate: Date, durationYears: HostingDuration): Date {
  const expiry = new Date(orderDate)
  expiry.setFullYear(expiry.getFullYear() + durationYears)
  return expiry
}
