'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronRight, Loader2 } from 'lucide-react'
import { DEFAULT_PRICING, formatPriceNZD } from '@/lib/pricing'
import { PRICING_LABELS, DURATION_LABELS, PRODUCT_DESCRIPTIONS, SPECIES_OPTIONS } from '@/types'
import type { HostingDuration, ProductType } from '@/types/database'

const durations: HostingDuration[] = [5, 10, 25]
const productTypes: ProductType[] = ['nfc_only', 'qr_only', 'both']

export function OrderForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Change step and scroll to form section
  const goToStep = (newStep: number) => {
    setStep(newStep)
    // Scroll to form container so user sees the step heading, not the page header
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  // Ref to form container for scrolling
  const formRef = useRef<HTMLDivElement>(null)
  
  // Form state
  const [duration, setDuration] = useState<HostingDuration>(
    (parseInt(searchParams.get('duration') || '10') as HostingDuration) || 10
  )
  const [productType, setProductType] = useState<ProductType>('both')
  const [deceasedType, setDeceasedType] = useState<'pet' | 'human'>('pet')
  const [deceasedName, setDeceasedName] = useState('')
  const [species, setSpecies] = useState('')
  const [engravingText, setEngravingText] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  // Shipping address
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState<'NZ' | 'AU'>('NZ')

  const price = DEFAULT_PRICING[duration][productType]
  const needsEngraving = productType === 'qr_only' || productType === 'both'

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostingDuration: duration,
          productType,
          deceasedType,
          deceasedName,
          species: deceasedType === 'pet' ? species : null,
          engravingText: needsEngraving ? engravingText : null,
          email,
          fullName,
          phone,
          shippingAddress: {
            line1: addressLine1,
            line2: addressLine2 || undefined,
            city,
            state: region,
            postal_code: postalCode,
            country,
          },
        }),
      })

      const data = await response.json()
      
      if (data.url) {
        // If in iframe (embed mode), open Stripe in new tab
        // Stripe doesn't allow being loaded inside iframes
        // Cross-origin iframes can't access parent window.location
        if (window.self !== window.top) {
          // We're in an iframe - open Stripe checkout in new tab
          window.open(data.url, '_blank')
        } else {
          // Normal navigation
          window.location.href = data.url
        }
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={formRef} className="max-w-3xl mx-auto">
      {/* Progress steps */}
      <div className="flex items-center justify-center mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                step >= s
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > s ? <Check className="h-5 w-5" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-20 h-1 mx-2 ${
                  step > s ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
        {/* Step 1: Select Package */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif text-gray-900 mb-6">
                Choose Your Package
              </h2>
              
              {/* Duration selection */}
              <div className="mb-8">
                <label className="label">Hosting Duration</label>
                <div className="grid grid-cols-3 gap-4">
                  {durations.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`p-4 rounded-lg border-2 text-center transition-colors ${
                        duration === d
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">
                        {DURATION_LABELS[d]}
                      </div>
                      <div className="text-sm text-gray-500">prepaid</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Product type selection */}
              <div>
                <label className="label">Product Type</label>
                <div className="space-y-3">
                  {productTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setProductType(type)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                        productType === type
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {PRICING_LABELS[type]}
                          </div>
                          <div className="text-sm text-gray-500">
                            {PRODUCT_DESCRIPTIONS[type]}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-primary-600">
                          {formatPriceNZD(DEFAULT_PRICING[duration][type])}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => goToStep(2)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Step 2: Memorial Details */}
        {step === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif text-gray-900 mb-6">
                Memorial Details
              </h2>

              {/* Memorial type */}
              <div className="mb-6">
                <label className="label">This memorial is for a:</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDeceasedType('pet')}
                    className={`p-4 rounded-lg border-2 text-center ${
                      deceasedType === 'pet'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Beloved Pet
                  </button>
                  <button
                    onClick={() => setDeceasedType('human')}
                    className={`p-4 rounded-lg border-2 text-center ${
                      deceasedType === 'human'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Loved One
                  </button>
                </div>
              </div>

              {/* Name */}
              <div className="mb-6">
                <label className="label">
                  {deceasedType === 'pet' ? "Pet's Name" : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={deceasedName}
                  onChange={(e) => setDeceasedName(e.target.value)}
                  placeholder={deceasedType === 'pet' ? 'e.g., Max' : 'e.g., John Smith'}
                  className="input"
                  required
                />
              </div>

              {/* Species (for pets) */}
              {deceasedType === 'pet' && (
                <div className="mb-6">
                  <label className="label">Species</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="input"
                  >
                    <option value="">Select species</option>
                    {SPECIES_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Engraving text */}
              {needsEngraving && (
                <div className="mb-6">
                  <label className="label">Engraving Text (optional)</label>
                  <input
                    type="text"
                    value={engravingText}
                    onChange={(e) => setEngravingText(e.target.value.slice(0, 50))}
                    placeholder="e.g., Forever in our hearts"
                    className="input"
                    maxLength={50}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {engravingText.length}/50 characters. Appears on the QR plate.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => goToStep(1)}
                className="btn-outline flex-1"
              >
                Back
              </button>
              <button
                onClick={() => goToStep(3)}
                disabled={!deceasedName}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Your Details */}
        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif text-gray-900 mb-6">
                Your Details
              </h2>

              <div className="mb-6">
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  We'll send your activation link and order updates here.
                </p>
              </div>

              <div className="mb-6">
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="input"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="label">Phone (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+64 21 123 4567"
                  className="input"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Shipping Address
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Where should we send your memorial tag?
              </p>

              <div className="mb-4">
                <label className="label">Street Address</label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="123 Main Street"
                  className="input"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="label">Apartment, suite, etc. (optional)</label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apt 4B"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Auckland"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Region / State</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Auckland"
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="1010"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value as 'NZ' | 'AU')}
                    className="input"
                  >
                    <option value="NZ">New Zealand</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-memorial-cream rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Package</span>
                  <span className="font-medium">{DURATION_LABELS[duration]} - {PRICING_LABELS[productType]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Memorial for</span>
                  <span className="font-medium">{deceasedName || '—'}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary-600">{formatPriceNZD(price)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => goToStep(2)}
                className="btn-outline flex-1"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!email || !fullName || !addressLine1 || !city || !region || !postalCode || loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
