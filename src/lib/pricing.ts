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
