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
    answer: 'NFC tags are small stickers that you tap with your phone – great for quick access and younger, tech-savvy users. QR plates are laser-engraved stainless steel plates that you scan with your camera – they\'re weather-proof, permanent, and work with any camera phone. The "Both" option gives you complete flexibility.',
  },
  {
    question: 'How long does hosting last?',
    answer: 'You choose your hosting duration at checkout: 5, 10, or 25 years prepaid. After your prepaid period, you can renew for $24/year. We\'ll send reminders before expiry, and there\'s a 30-day grace period if you need more time.',
  },
  {
    question: 'Can I add or change photos later?',
    answer: 'Yes! You can update your memorial anytime throughout the hosting period. Add new photos, update the story, or make any changes you like through your memorial dashboard.',
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
    question: 'Do you ship to Australia?',
    answer: 'Yes! We ship throughout New Zealand ($10) and Australia ($15). NFC tags ship in 2-3 business days, and QR plates ship in 7-10 business days.',
  },
  {
    question: 'Can I use this for a human memorial?',
    answer: 'Absolutely. Many families use MemoriQR for human memorials too. The plates are especially popular for cemetery markers, urns, and keepsake boxes.',
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
