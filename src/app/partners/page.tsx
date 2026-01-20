'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { 
  Handshake, 
  DollarSign, 
  Package, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Building2,
  Stethoscope,
  Heart,
  Store,
  Loader2,
  Send
} from 'lucide-react'

const benefits = [
  {
    icon: DollarSign,
    title: 'Earn Commission',
    description: 'Commission rates from 15-20% based on the volume of memorial products you sell each month.'
  },
  {
    icon: Package,
    title: 'Free Starter Kit',
    description: 'Get referral cards, display materials, and brochures to start offering memorials immediately.'
  },
  {
    icon: TrendingUp,
    title: 'Partner Dashboard',
    description: 'Track activations, commissions, and download referral cards through your dedicated portal.'
  },
  {
    icon: Heart,
    title: 'Help Families Grieve',
    description: 'Offer a meaningful service that helps pet owners and families preserve precious memories.'
  }
]

const partnerTypes = [
  {
    icon: Stethoscope,
    title: 'Veterinary Clinics',
    description: 'Offer memorial tags to grieving pet owners at the point of need.'
  },
  {
    icon: Building2,
    title: 'Pet Crematoriums',
    description: 'Include memorial tags with cremation services as a value-add.'
  },
  {
    icon: Heart,
    title: 'Funeral Homes',
    description: 'Provide QR memorial plates for human memorials and urns.'
  },
  {
    icon: Store,
    title: 'Pet Stores & Groomers',
    description: 'Sell memorial products to pet-loving customers.'
  }
]

export default function PartnersPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: '',
    message: '',
    expectedQrSales: '',
    expectedNfcSales: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subject: `Partner Application: ${formData.businessName}`,
          type: 'partner_application'
        })
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          businessName: '',
          contactName: '',
          email: '',
          phone: '',
          businessType: '',
          message: '',
          expectedQrSales: '',
          expectedNfcSales: ''
        })
      } else {
        setSubmitStatus('error')
      }
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <Handshake className="h-16 w-16 mx-auto mb-6 text-primary-200" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Become a MemoriQR Partner
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Join our network of veterinary clinics, crematoriums, and pet businesses 
              offering meaningful memorial products to grieving families.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#apply" 
                className="btn bg-white text-primary-700 hover:bg-gray-100"
              >
                Apply Now
              </a>
              <Link 
                href="/partner/dashboard" 
                className="btn border-2 border-white text-white hover:bg-white/10"
              >
                Existing Partner? Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container-wide">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4">
            Partner Benefits
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to offer memorial products with zero hassle
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div 
                key={benefit.title}
                className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container-wide">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4">
            Who Can Partner With Us?
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We work with businesses that serve pet owners and families during times of loss
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnerTypes.map((type) => (
              <div 
                key={type.title}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <type.icon className="h-10 w-10 text-primary-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{type.title}</h3>
                <p className="text-gray-600 text-sm">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container-wide">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">
            How It Works
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold mb-2">Apply & Get Approved</h3>
                <p className="text-gray-600 text-sm">
                  Fill out the form below. We&apos;ll review your application and contact you within 48 hours.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold mb-2">Receive Your Starter Kit</h3>
                <p className="text-gray-600 text-sm">
                  Get referral cards and marketing materials shipped to your location.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold mb-2">Start Earning</h3>
                <p className="text-gray-600 text-sm">
                  Customers activate tags themselves. You earn commission on every sale, paid monthly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="apply" className="py-16 md:py-20 bg-gray-50">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4">
              Apply to Become a Partner
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Fill out the form below and we&apos;ll be in touch within 48 hours
            </p>

            {submitStatus === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Application Submitted!
                </h3>
                <p className="text-green-700">
                  Thank you for your interest in partnering with MemoriQR. 
                  We&apos;ll review your application and contact you within 48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your Vet Clinic"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Jane Smith"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="jane@vetclinic.co.nz"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="09 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    required
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select your business type</option>
                    <option value="vet">Veterinary Clinic</option>
                    <option value="crematorium">Pet Crematorium</option>
                    <option value="funeral_home">Funeral Home</option>
                    <option value="pet_store">Pet Store</option>
                    <option value="groomer">Pet Groomer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us about your business
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell us about your business and how you plan to offer memorial products..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected QR Plates / month
                      <span className="text-gray-400 font-normal ml-1">(optional)</span>
                    </label>
                    <select
                      value={formData.expectedQrSales}
                      onChange={(e) => setFormData({ ...formData, expectedQrSales: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select estimate</option>
                      <option value="1-5">1-5 per month</option>
                      <option value="6-15">6-15 per month</option>
                      <option value="16-30">16-30 per month</option>
                      <option value="30+">30+ per month</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected NFC Tags / month
                      <span className="text-gray-400 font-normal ml-1">(optional)</span>
                    </label>
                    <select
                      value={formData.expectedNfcSales}
                      onChange={(e) => setFormData({ ...formData, expectedNfcSales: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select estimate</option>
                      <option value="1-5">1-5 per month</option>
                      <option value="6-15">6-15 per month</option>
                      <option value="16-30">16-30 per month</option>
                      <option value="30+">30+ per month</option>
                    </select>
                  </div>
                </div>

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                    Something went wrong. Please try again or email us at{' '}
                    <a href="mailto:partners@memoriqr.co.nz" className="underline">
                      partners@memoriqr.co.nz
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Submit Application
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Already a Partner CTA */}
      <section className="py-12 bg-primary-900 text-white">
        <div className="container-wide text-center">
          <h3 className="text-xl font-semibold mb-4">Already a Partner?</h3>
          <p className="text-primary-200 mb-6">
            Access your dashboard to view activations, download referral cards, and track commissions.
          </p>
          <Link 
            href="/partner/dashboard" 
            className="btn bg-white text-primary-700 hover:bg-gray-100"
          >
            Go to Partner Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
    <Footer />
    </>
  )
}
