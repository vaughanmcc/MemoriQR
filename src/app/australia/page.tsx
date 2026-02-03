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
    'pet memorial Australia',
    'QR pet tag Australia',
    'NFC pet tag Australia',
    'dog memorial tag',
    'cat memorial Australia',
    'pet remembrance gift',
    'digital pet memorial',
    'QR code memorial plaque',
    'pet loss gift Australia',
    'memorial tag Melbourne',
    'memorial tag Sydney',
    'memorial tag Brisbane',
    'pet grave marker',
    'pet memory keeper',
    'horse memorial Australia',
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
