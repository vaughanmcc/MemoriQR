import { Check, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { DEFAULT_PRICING, formatPriceNZD, TIER_LIMITS } from '@/lib/pricing'
import { PRICING_LABELS, DURATION_LABELS, PRODUCT_DESCRIPTIONS } from '@/types'
import type { HostingDuration, ProductType } from '@/types/database'

const durations: HostingDuration[] = [5, 10, 25]
const productTypes: ProductType[] = ['nfc_only', 'qr_only', 'both']

// Features that vary by tier
const tierFeatures: Record<HostingDuration, string[]> = {
  5: [
    '20 curated photos',
    '2 videos*',
    '5 memorial themes',
    '5 photo frames',
    'Custom memorial URL',
    'Mobile-responsive design',
    'No advertisements',
    'Email support',
  ],
  10: [
    '40 curated photos',
    '3 videos*',
    '10 memorial themes',
    '10 photo frames',
    'Custom memorial URL',
    'Mobile-responsive design',
    'No advertisements',
    'Email support',
  ],
  25: [
    '60 curated photos',
    '5 videos*',
    '25 memorial themes',
    '25 photo frames',
    'Custom memorial URL',
    'Mobile-responsive design',
    'No advertisements',
    'Priority email support',
  ],
}

interface PricingCardProps {
  duration: HostingDuration
  isPopular?: boolean
}

function PricingCard({ duration, isPopular }: PricingCardProps) {
  const pricePerYear = Math.round(DEFAULT_PRICING[duration].both / duration)

  return (
    <div className={`relative bg-white rounded-2xl border-2 ${isPopular ? 'border-primary-500 shadow-xl' : 'border-gray-100 shadow-sm'} overflow-hidden`}>
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Most Popular
        </div>
      )}

      <div className="p-8">
        {/* Duration */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-serif text-gray-900 mb-2">
            {DURATION_LABELS[duration]}
          </h3>
          <p className="text-sm text-gray-500">
            Prepaid hosting
          </p>
        </div>

        {/* Pricing table */}
        <div className="space-y-3 mb-8">
          {productTypes.map((type) => (
            <div key={type} className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">{PRICING_LABELS[type]}</span>
              <span className="font-semibold text-gray-900">
                {formatPriceNZD(DEFAULT_PRICING[duration][type])}
              </span>
            </div>
          ))}
        </div>

        {/* Per year callout */}
        <div className="text-center mb-6 p-4 bg-memorial-cream rounded-lg">
          <p className="text-sm text-gray-600">
            Complete set from just
          </p>
          <p className="text-2xl font-bold text-primary-600">
            ${pricePerYear}/year
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {tierFeatures[duration].map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-gray-600">
              <Check className="h-5 w-5 text-memorial-sage flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href={`/order?duration=${duration}`}
          className={`block text-center w-full py-3 rounded-lg font-medium transition-colors ${
            isPopular
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          Select {DURATION_LABELS[duration]}
        </Link>
      </div>
    </div>
  )
}

export function PricingSection() {
  return (
    <section id="pricing" className="section bg-memorial-warm">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Choose the hosting duration that's right for you. Curated galleries 
            for fast-loading pages. Need more space? Upgrade anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard duration={5} />
          <PricingCard duration={10} isPopular />
          <PricingCard duration={25} />
        </div>

        {/* Renewal info */}
        <div className="text-center mt-12 text-gray-600 space-y-2">
          <p>
            After your prepaid period, renew for just <strong>$24/year</strong> 
            {' '}or add 10 more years for <strong>$99</strong>.
          </p>
          <p className="text-sm">
            Need more space? Add <strong>+20 photos for $10</strong> or <strong>+1 video for $15</strong> anytime.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            *Videos: Upload files up to 50MB each, or link YouTube videos (unlimited size, no extra cost).
          </p>
        </div>
      </div>
    </section>
  )
}
