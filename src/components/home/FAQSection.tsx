'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    question: 'How does the NFC tag work?',
    answer: 'NFC (Near Field Communication) is the same technology used in contactless payments. Simply hold your smartphone near the tag, and it will automatically open the memorial page in your browser. No app needed – works with all modern iPhones and Android devices.',
  },
  {
    question: 'What\'s the difference between NFC tags and QR plates?',
    answer: 'NFC tags are premium disc tags that you tap with your phone – they\'re durable, compact, and great for quick access. QR plates are Metalphoto® anodised aluminium plates with sub-surface printed QR codes – they\'re weather-proof with 20+ year UV resistance, and work with any camera phone. The "Both" option gives you complete flexibility.',
  },
  {
    question: 'How long do NFC tags last outdoors?',
    answer: 'Our NFC disc tags are sourced from a specialist supplier who has tested their products outdoors in real weather conditions for over 3 years. The PVC and ABS disc tags we use held up with minimal change and retained full scan distance even after years of exposure to sun, rain, frost, and wind. For maximum durability on headstones or outdoor memorials, we recommend pairing with a QR plate.',
  },
  {
    question: 'What is Metalphoto® technology?',
    answer: 'Metalphoto® is a premium photosensitive anodised aluminium where images are photographically developed within the aluminium surface, then sealed beneath an 8 micron sapphire-hard anodic layer. Key specs: 20+ year outdoor UV resistance, withstands temperatures over 300°C (572°F), chemical and abrasion resistant, meets military specs (MIL-STD-130N for asset marking). The sub-surface printing means the QR code cannot be scratched off – it\'s literally part of the metal. Our plates use 3M industrial-grade adhesive (3M 45B or 3M 467) rated for outdoor use: temperature resistance up to 204°C short-term and 149°C long-term, designed for permanent mounting on stone, metal, and other hard surfaces. Perfect for cemetery installations, outdoor memorials, and harsh environments.',
  },
  {
    question: 'How long does hosting last?',
    answer: 'You choose your hosting duration at checkout: 5, 10, or 25 years prepaid. After your prepaid period, you can renew for $24/year. We\'ll send reminders before expiry, and there\'s a 30-day grace period if you need more time.',
  },
  {
    question: 'Why do you use curated photo galleries instead of unlimited?',
    answer: 'We believe in quality over quantity. Choose your 20, 40, or 60 most meaningful photos (depending on plan) to create a fast-loading memorial that truly tells their story. Benefits: 1) Your memorial loads in under 2 seconds on any device. 2) Curated galleries create more impact – each photo you choose captures something special. 3) Sustainable service – we can guarantee your memorial will be here for the full 5, 10, or 25 years you\'ve prepaid. Need more space? Upgrade anytime for $10 per 20 additional photos or $15 per additional video.',
  },
  {
    question: 'Can I add or change photos later?',
    answer: 'Yes! You can swap photos in and out anytime while staying within your plan\'s curated gallery. Update your memorial throughout the hosting period – add new photos, update the story, or make any changes you like through your memorial dashboard.',
  },
  {
    question: 'What if I need more photo or video capacity?',
    answer: 'Need more space? Upgrade anytime! You can purchase add-on packs: +20 photos for $10, or +1 video for $15. You can also upgrade from a 5-year to 10-year or 25-year plan to get a larger curated gallery and extend your hosting.',
  },
  {
    question: 'How do video uploads work?',
    answer: 'You can upload video files up to 50MB directly, or link YouTube videos for unlimited size. YouTube is recommended for longer videos as it provides better streaming quality.',
  },
  {
    question: 'Is my memorial private?',
    answer: 'Yes, memorials are private by default. Only people who have the link (or scan the tag) can view it. Memorials are not listed publicly and are not indexed by search engines.',
  },
  {
    question: 'What if I lose my tag or it gets damaged?',
    answer: 'Your memorial stays online regardless of what happens to the physical tag. If you need a replacement tag, contact us and we\'ll send a new one linked to your existing memorial (replacement fee applies).',
  },
  {
    question: 'What happens to my photos if I don\'t renew?',
    answer: 'You have 90 days after hosting expires to download all your content in a zip file. We\'ll never delete your memories without giving you time to save them. During the 30-day grace period after expiry, your memorial remains accessible with a renewal banner.',
  },
  {
    question: 'Do you ship to Australia?',
    answer: 'Yes! We ship throughout New Zealand ($10) and Australia ($15). NFC tags ship in 2-3 business days, and QR plates ship in 7-10 business days.',
  },
  {
    question: 'Can I use this for a human memorial?',
    answer: 'Absolutely. Many families use MemoriQR for human memorials too. The plates are especially popular for cemetery markers, urns, and keepsake boxes.',
  },
  {
    question: 'Are QR plates allowed at all cemeteries?',
    answer: 'Cemetery policies vary. Some cemeteries welcome QR memorial plates, while others have restrictions on what can be attached to headstones or grave markers. We strongly recommend checking with your cemetery before purchasing to confirm their policy on memorial tags and plates. If you\'re unsure, contact us and we can help guide you through common considerations.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-5 text-left"
      >
        <span className="font-medium text-gray-900 pr-8">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="pb-5 pr-12">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  )
}

export function FAQSection() {
  return (
    <section id="faq" className="section bg-white">
      <div className="container-narrow">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about MemoriQR.
          </p>
        </div>

        {/* FAQ list */}
        <div className="bg-memorial-cream rounded-2xl px-8">
          {faqs.map((faq, index) => (
            <FAQItem key={index} {...faq} />
          ))}
        </div>

        {/* Contact CTA */}
        <p className="text-center mt-8 text-gray-600">
          Still have questions?{' '}
          <a href="/contact" className="text-primary-600 font-medium hover:underline">
            Get in touch
          </a>
        </p>
      </div>
    </section>
  )
}
