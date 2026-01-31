'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronRight, Loader2, Tag, X } from 'lucide-react'
import { DEFAULT_PRICING, formatPriceNZD } from '@/lib/pricing'
import { PRICING_LABELS, DURATION_LABELS, PRODUCT_DESCRIPTIONS, SPECIES_OPTIONS } from '@/types'
import type { HostingDuration, ProductType } from '@/types/database'
import { AddressAutocomplete } from '@/components/shared/AddressAutocomplete'

const durations: HostingDuration[] = [5, 10, 25]
const productTypes: ProductType[] = ['nfc_only', 'qr_only', 'both']

interface ReferralInfo {
  valid: boolean;
  referralCode: string;
  discountPercent: number;
  freeShipping: boolean;
  partnerName?: string;
  message?: string;
}

export function OrderForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Referral code state
  const [referralCode, setReferralCode] = useState('')
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null)
  const [referralLoading, setReferralLoading] = useState(false)
  const [referralError, setReferralError] = useState('')

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
  const [speciesOther, setSpeciesOther] = useState('')
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
  
  // Calculate discount if referral code is applied
  const discountAmount = referralInfo?.valid && referralInfo.discountPercent > 0
    ? Math.round(price * (referralInfo.discountPercent / 100) * 100) / 100
    : 0
  const finalPrice = price - discountAmount

  // Validate referral code
  const validateReferralCode = useCallback(async (code: string) => {
    if (!code.trim()) {
      setReferralInfo(null)
      setReferralError('')
      return
    }

    setReferralLoading(true)
    setReferralError('')

    try {
      const response = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: code.trim() }),
      })

      const data = await response.json()

      if (data.valid) {
        setReferralInfo(data)
        setReferralError('')
      } else {
        setReferralInfo(null)
        setReferralError(data.error || 'Invalid code')
      }
    } catch {
      setReferralError('Failed to validate code')
    } finally {
      setReferralLoading(false)
    }
  }, [])

  // Check for referral code in URL on mount
  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setReferralCode(refCode.toUpperCase())
      validateReferralCode(refCode)
    }
  }, [searchParams, validateReferralCode])

  // Clear referral code
  const clearReferralCode = () => {
    setReferralCode('')
    setReferralInfo(null)
    setReferralError('')
  }

  // Refs for autofill detection and validation
  const emailRef = useRef<HTMLInputElement>(null)
  const fullNameRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLInputElement>(null)
  const regionRef = useRef<HTMLInputElement>(null)
  const postalCodeRef = useRef<HTMLInputElement>(null)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validate form and scroll to first error
  const validateAndSubmit = () => {
    const newErrors: Record<string, string> = {}
    
    if (!email) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email'
    if (!fullName) newErrors.fullName = 'Name is required'
    if (!addressLine1) newErrors.addressLine1 = 'Street address is required'
    if (!city) newErrors.city = 'City is required'
    if (!postalCode) newErrors.postalCode = 'Postal code is required'
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      // Scroll to first error field
      const fieldRefs: Record<string, React.RefObject<HTMLInputElement>> = {
        email: emailRef,
        fullName: fullNameRef,
        addressLine1: addressRef,
        city: cityRef,
        postalCode: postalCodeRef,
      }
      const firstErrorField = Object.keys(newErrors)[0]
      const ref = fieldRefs[firstErrorField]
      if (ref?.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        ref.current.focus()
      }
      return
    }
    
    handleSubmit()
  }

  // Sync autofilled values on step 3
  useEffect(() => {
    if (step === 3) {
      const syncAutofill = () => {
        if (emailRef.current?.value && !email) setEmail(emailRef.current.value)
        if (fullNameRef.current?.value && !fullName) setFullName(fullNameRef.current.value)
        if (addressRef.current?.value && !addressLine1) setAddressLine1(addressRef.current.value)
        if (cityRef.current?.value && !city) setCity(cityRef.current.value)
        if (regionRef.current?.value && !region) setRegion(regionRef.current.value)
        if (postalCodeRef.current?.value && !postalCode) setPostalCode(postalCodeRef.current.value)
      }
      // Check after a short delay for autofill
      const timer = setTimeout(syncAutofill, 200)
      return () => clearTimeout(timer)
    }
  }, [step, email, fullName, addressLine1, city, region, postalCode])

  const resolvedSpecies = deceasedType === 'pet'
    ? (species === 'Other' ? speciesOther.trim() : species)
    : ''
  const isSpeciesMissing = deceasedType === 'pet' && (!species || (species === 'Other' && !speciesOther.trim()))

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
          species: deceasedType === 'pet' ? resolvedSpecies || null : null,
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
          // Referral code info
          referralCode: referralInfo?.valid ? referralInfo.referralCode : null,
          discountPercent: referralInfo?.valid ? referralInfo.discountPercent : 0,
          freeShipping: referralInfo?.valid ? referralInfo.freeShipping : false,
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

            {/* Referral Code */}
            <div className="border-t pt-6">
              <label className="label flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Referral Code (Optional)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g., REF-XXXXX)"
                    className={`input pr-10 ${referralInfo?.valid ? 'border-green-500 bg-green-50' : ''} ${referralError ? 'border-red-500' : ''}`}
                    disabled={referralInfo?.valid}
                  />
                  {referralInfo?.valid && (
                    <button
                      onClick={clearReferralCode}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      title="Remove code"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {!referralInfo?.valid && (
                  <button
                    onClick={() => validateReferralCode(referralCode)}
                    disabled={referralLoading || !referralCode.trim()}
                    className="btn-outline px-4"
                  >
                    {referralLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </button>
                )}
              </div>
              {referralInfo?.valid && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  {referralInfo.message}
                  {referralInfo.partnerName && (
                    <span className="text-gray-500">
                      — Courtesy of {referralInfo.partnerName}
                    </span>
                  )}
                </p>
              )}
              {referralError && (
                <p className="text-sm text-red-500 mt-2">{referralError}</p>
              )}
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
                    onChange={(e) => {
                      const nextValue = e.target.value
                      setSpecies(nextValue)
                      if (nextValue !== 'Other') {
                        setSpeciesOther('')
                      }
                    }}
                    className="input"
                  >
                    <option value="">Select species</option>
                    {SPECIES_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {species === 'Other' && (
                    <div className="mt-3">
                      <label className="label">Please specify</label>
                      <input
                        type="text"
                        value={speciesOther}
                        onChange={(e) => setSpeciesOther(e.target.value)}
                        placeholder="e.g., Ferret"
                        className="input"
                        required
                      />
                    </div>
                  )}
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
                disabled={!deceasedName || isSpeciesMissing}
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
                <label className="label">Email Address <span className="text-red-500">*</span></label>
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })) }}
                  onBlur={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`input ${errors.email ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                  required
                />
                {errors.email ? (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    We'll send your activation link and order updates here.
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="label">Full Name <span className="text-red-500">*</span></label>
                <input
                  ref={fullNameRef}
                  type="text"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setErrors(prev => ({ ...prev, fullName: '' })) }}
                  onBlur={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className={`input ${errors.fullName ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                  required
                />
                {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
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
                <label className="label">Street Address <span className="text-red-500">*</span></label>
                <AddressAutocomplete
                  inputRef={addressRef as React.RefObject<HTMLInputElement>}
                  value={addressLine1}
                  onChange={(value) => { setAddressLine1(value); setErrors(prev => ({ ...prev, addressLine1: '' })) }}
                  onAddressSelect={(address) => {
                    setAddressLine1(address.line1)
                    if (address.line2) setAddressLine2(address.line2)
                    setCity(address.city)
                    setRegion(address.region)
                    setPostalCode(address.postalCode)
                    if (address.country === 'AU') setCountry('AU')
                    else if (address.country === 'NZ') setCountry('NZ')
                    setErrors(prev => ({ ...prev, addressLine1: '', city: '', postalCode: '' }))
                  }}
                  placeholder="Start typing your address..."
                  required
                  error={errors.addressLine1}
                  countries={['nz', 'au']}
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
                  <label className="label">City <span className="text-red-500">*</span></label>
                  <input
                    ref={cityRef}
                    type="text"
                    value={city}
                    onChange={(e) => { setCity(e.target.value); setErrors(prev => ({ ...prev, city: '' })) }}
                    onBlur={(e) => setCity(e.target.value)}
                    placeholder="Auckland"
                    className={`input ${errors.city ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                    required
                  />
                  {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="label">Region / State <span className="text-gray-400 text-sm font-normal">(optional)</span></label>
                  <input
                    ref={regionRef}
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    onBlur={(e) => setRegion(e.target.value)}
                    placeholder="e.g. Auckland"
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Postal Code <span className="text-red-500">*</span></label>
                  <input
                    ref={postalCodeRef}
                    type="text"
                    value={postalCode}
                    onChange={(e) => { setPostalCode(e.target.value); setErrors(prev => ({ ...prev, postalCode: '' })) }}
                    onBlur={(e) => setPostalCode(e.target.value)}
                    placeholder="1010"
                    className={`input ${errors.postalCode ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                    required
                  />
                  {errors.postalCode && <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>}
                </div>
                <div>
                  <label className="label">Country <span className="text-red-500">*</span></label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value as 'NZ' | 'AU')}
                    className="input"
                    required
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
                
                {/* Referral discount display */}
                {referralInfo && (
                  <>
                    <hr className="my-3" />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPriceNZD(price)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Partner Discount ({referralInfo.discountPercent}%)
                      </span>
                      <span className="font-medium">-{formatPriceNZD(discountAmount)}</span>
                    </div>
                    {referralInfo.freeShipping && (
                      <div className="flex justify-between text-green-600">
                        <span>Free Shipping</span>
                        <span className="font-medium">Included</span>
                      </div>
                    )}
                  </>
                )}
                
                <hr className="my-3" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary-600">{formatPriceNZD(finalPrice)}</span>
                </div>
                {referralInfo && discountAmount > 0 && (
                  <div className="text-xs text-green-600 text-right">
                    You save {formatPriceNZD(discountAmount)}!
                  </div>
                )}
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
                onClick={validateAndSubmit}
                disabled={loading}
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
