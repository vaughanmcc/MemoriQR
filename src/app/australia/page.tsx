import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { UseCasesSection } from '@/components/home/UseCasesSection'
import { HowItWorks } from '@/components/home/HowItWorks'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { PricingSection } from '@/components/home/PricingSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { FAQSection } from '@/components/home/FAQSection'
import { CTASection } from '@/components/home/CTASection'

export const metadata: Metadata = {
  title: 'MemoriQR Australia | QR Pet Memorial Tags & Digital Memorials',
  description: 'Create lasting digital memorials for beloved pets and family in Australia. Premium QR memorial tags and NFC pet tags with lifetime photo hosting. Ships to Sydney, Melbourne, Brisbane & all of Australia.',
  keywords: [
    // Primary product keywords
    'memorial tag Australia', 'QR memorial plate', 'NFC pet tag Australia',
    'memorial plaque Australia', 'pet memorial tag', 'headstone QR code',
    // Industry/service keywords
    'pet crematorium Australia', 'crematorium memorial products',
    'funeral memorial gifts', 'cremation memorial Australia',
    'funeral remembrance', 'ashes memorial tag',
    // Emotional/legacy keywords
    'remembrance gift', 'living legacy', 'memorial keepsake',
    'lasting tribute', 'legacy memorial', 'memory keeper',
    // Pet-specific
    'dog memorial Australia', 'cat memorial Australia', 'horse memorial',
    'pet loss gift', 'pet grave marker', 'pet urn tag', 'pet ashes memorial',
    // Location
    'memorial Sydney', 'memorial Melbourne', 'memorial Brisbane',
    'memorial Perth', 'memorial Adelaide',
  ],
  alternates: {
    canonical: 'https://memoriqr.co.nz/australia',
    languages: {
      'en-AU': 'https://memoriqr.co.nz/australia',
      'en-NZ': 'https://memoriqr.co.nz',
    },
  },
  openGraph: {
    title: 'MemoriQR Australia | QR Pet Memorial Tags & Digital Memorials',
    description: 'Create lasting digital memorials for beloved pets and family in Australia. Premium QR memorial tags and NFC pet tags. Ships Australia-wide.',
    url: 'https://memoriqr.co.nz/australia',
    siteName: 'MemoriQR',
    locale: 'en_AU',
    type: 'website',
  },
}

export default function AustraliaHomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection locale="au" />
        <UseCasesSection />
        <HowItWorks />
        <FeaturesSection />
        <PricingSection locale="au" />
        <TestimonialsSection />
        <FAQSection />
        <CTASection locale="au" />
      </main>
      <Footer />
    </>
  )
}
