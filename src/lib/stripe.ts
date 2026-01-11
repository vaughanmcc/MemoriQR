import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const SHIPPING_RATES = {
  NZ: 1000, // $10 NZD in cents
  AU: 1500, // $15 NZD in cents
}

export const CURRENCY = 'nzd'

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
  }).format(cents / 100)
}

export function getPriceInCents(price: number): number {
  return Math.round(price * 100)
}
