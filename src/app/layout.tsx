import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'MemoriQR - Digital Memorials for Pets & People',
    template: '%s | MemoriQR',
  },
  description: 'Create lasting digital memorials with NFC tags and QR-engraved stainless steel plates. Preserve memories of loved ones with photos, videos, and stories - hosted for 5, 10, or 25 years.',
  keywords: ['pet memorial', 'QR code memorial', 'NFC memorial tag', 'digital memorial', 'pet loss', 'remembrance', 'New Zealand'],
  authors: [{ name: 'MemoriQR' }],
  creator: 'MemoriQR',
  publisher: 'MemoriQR',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://memoriqr.co.nz'),
  openGraph: {
    type: 'website',
    locale: 'en_NZ',
    url: 'https://memoriqr.co.nz',
    siteName: 'MemoriQR',
    title: 'MemoriQR - Digital Memorials for Pets & People',
    description: 'Create lasting digital memorials with NFC tags and QR-engraved stainless steel plates.',
    images: [
      {
        url: '/og-image.jpg',
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
    images: ['/og-image.jpg'],
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
