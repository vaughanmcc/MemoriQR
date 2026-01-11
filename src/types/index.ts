import { HostingDuration, ProductType } from './database'

export interface CartItem {
  hostingDuration: HostingDuration
  productType: ProductType
  engravingText?: string
  deceasedName: string
  deceasedType: 'pet' | 'human'
  species?: string
}

export interface ShippingAddress {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  region: string
  postalCode: string
  country: 'NZ' | 'AU'
  phone?: string
}

export interface CheckoutData {
  customer: {
    email: string
    fullName: string
    phone?: string
  }
  shipping: ShippingAddress
  items: CartItem[]
}

export interface MemorialPhoto {
  id: string
  url: string
  publicId: string
  width: number
  height: number
  caption?: string
  order: number
}

export interface MemorialVideo {
  id: string
  youtubeId: string
  title?: string
  order: number
}

export interface MemorialContent {
  deceasedName: string
  deceasedType: 'pet' | 'human'
  species?: string
  birthDate?: string
  deathDate?: string
  memorialText?: string
  photos: MemorialPhoto[]
  videos: MemorialVideo[]
}

export interface PricingOption {
  hostingDuration: HostingDuration
  productType: ProductType
  price: number
  currency: string
  label: string
  description: string
}

export const PRICING_LABELS: Record<ProductType, string> = {
  nfc_only: 'NFC Tag Only',
  qr_only: 'QR Plate Only',
  both: 'NFC Tag + QR Plate',
}

export const DURATION_LABELS: Record<HostingDuration, string> = {
  5: '5 Years',
  10: '10 Years',
  25: '25 Years',
}

export const PRODUCT_DESCRIPTIONS: Record<ProductType, string> = {
  nfc_only: 'Tap-to-view NFC sticker. Ships in 2-3 days.',
  qr_only: 'Weather-proof laser-engraved stainless steel plate. Ships in 7-10 days.',
  both: 'Complete set with both NFC tag and QR plate. Ships in 7-10 days.',
}

export const SPECIES_OPTIONS = [
  'Dog',
  'Cat',
  'Bird',
  'Rabbit',
  'Guinea Pig',
  'Hamster',
  'Fish',
  'Horse',
  'Reptile',
  'Other',
] as const
