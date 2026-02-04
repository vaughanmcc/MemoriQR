import { Check, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { formatPrice, TIER_PRICING, TIER_OPTIONS, TierType, Locale, Currency } from '@/lib/pricing'

// Features that vary by tier
const tierFeatures: Record<TierType, string[]> = {
  standard: [
    '20 curated photos',
    '2 videos*',
    '5 memorial themes',
    '5 photo frames',
    'Custom memorial URL',
    'Mobile-responsive design',
    'No advertisements',
    'Email support',
  ],
  headstone: [
    '40 curated photos',
    '3 videos*',
    '10 memorial themes',
    '10 photo frames',
    'Custom memorial URL',
    'Mobile-responsive design',
    'No advertisements',
    'Email support',
  ],
  premium: [
    '40 curated photos',
    '3 videos*',
    '10 memorial themes',
    '10 photo frames',
    'Custom memorial URL',
    'Mobile-responsive design',
    'No advertisements',
    'Priority email support',
  ],
}

interface PricingCardProps {
  tier: TierType
  isPopular?: boolean
  locale?: Locale
  orderPath?: string
}

function PricingCard({ tier, isPopular, locale = 'nz', orderPath = '/order' }: PricingCardProps) {
  const config = TIER_PRICING[tier]
  const pricePerYear = Math.round(config.price / config.hostingDuration)
  const currency: Currency = locale === 'au' ? 'AUD' : 'NZD'

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
        {/* Tier name */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-serif text-gray-900 mb-2">
            {config.name}
          </h3>
          <p className="text-sm text-primary-600 font-medium">
            {config.contents}
          </p>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-gray-900">
            {formatPrice(config.price, currency)}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {config.description}
          </p>
        </div>

        {/* Per year callout */}
        <div className="text-center mb-6 p-4 bg-memorial-cream rounded-lg">
          <p className="text-sm text-gray-600">
            Just
          </p>
          <p className="text-2xl font-bold text-primary-600">
            ${pricePerYear}/year
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {tierFeatures[tier].map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-gray-600">
              <Check className="h-5 w-5 text-memorial-sage flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href={orderPath}
          className={`block text-center w-full py-3 rounded-lg font-medium transition-colors ${
            isPopular
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          Select {config.name}
        </Link>
      </div>
    </div>
  )
}

interface PricingSectionProps {
  locale?: Locale
}

export function PricingSection({ locale = 'nz' }: PricingSectionProps) {
  const orderPath = locale === 'au' ? '/australia/order' : '/order'
  
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
          <PricingCard tier="standard" locale={locale} orderPath={orderPath} />
          <PricingCard tier="headstone" isPopular locale={locale} orderPath={orderPath} />
          <PricingCard tier="premium" locale={locale} orderPath={orderPath} />
        </div>

        {/* Renewal info */}
        <div className="text-center mt-12 text-gray-600 space-y-2">
          <p>
            After your prepaid period, renew for just <strong>$29/year</strong> 
            {' '}or add 5 more years for <strong>$99</strong>.
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
