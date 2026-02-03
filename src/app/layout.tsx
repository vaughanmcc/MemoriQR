import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'MemoriQR - Premium Memorial Tags & QR Plates | NZ',
    template: '%s | MemoriQR',
  },
  description: 'Premium NFC memorial tags and QR-engraved Metalphoto® plates for pets and people. Weatherproof, UV-resistant memorial products with optional digital photo gallery. Made in New Zealand.',
  keywords: [
    // Primary product keywords
    'memorial tag', 'QR memorial plate', 'NFC pet tag', 'memorial plaque',
    'pet memorial tag', 'headstone QR code', 'grave marker tag',
    // Industry/service keywords  
    'pet crematorium', 'crematorium memorial', 'funeral memorial products',
    'funeral remembrance gifts', 'cremation memorial', 'ashes memorial',
    // Emotional/legacy keywords
    'remembrance', 'living legacy', 'memorial keepsake', 'pet remembrance',
    'lasting tribute', 'memory keeper', 'legacy memorial',
    // Pet-specific
    'dog memorial', 'cat memorial', 'horse memorial', 'pet loss gift',
    'pet grave marker', 'pet urn tag', 'pet ashes memorial',
    // Location
    'New Zealand', 'Auckland', 'memorial NZ',
  ],
  authors: [{ name: 'MemoriQR' }],
  creator: 'MemoriQR',
  publisher: 'MemoriQR',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://memoriqr.co.nz'),
  alternates: {
    languages: {
      'en-NZ': 'https://memoriqr.co.nz',
      'en-AU': 'https://memoriqr.co.nz/australia',
      'x-default': 'https://memoriqr.co.nz',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_NZ',
    url: 'https://memoriqr.co.nz',
    siteName: 'MemoriQR',
    title: 'MemoriQR - Premium Memorial Tags & QR Plates',
    description: 'Premium NFC memorial tags and QR-engraved Metalphoto® plates. Weatherproof memorial products with digital photo gallery.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MemoriQR - Digital Memorials',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MemoriQR - Digital Memorials',
    description: 'Preserve memories of loved ones with scannable memorial tags.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-memorial-cream">
        {children}
      </body>
    </html>
  )
}
