'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PartnerHeader } from '@/components/layout/PartnerHeader'
import { useSessionExtension } from '@/lib/useSessionExtension'
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqCategories = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I get started as a MemoriQR partner?',
        answer: 'Once your application is approved, log into the Partner Portal and complete your profile by adding your business address and banking details in Settings. You can then request activation codes or generate referral links to start earning commissions.'
      },
      {
        question: 'What is the difference between Activation Codes and Referral Codes?',
        answer: 'Activation Codes are pre-paid codes you purchase at wholesale prices and resell to customers. You keep the margin between your cost and selling price. Referral Codes are free to generate - when a customer uses your referral code, they pay full price and you earn a commission on the sale.'
      },
      {
        question: 'How do I set up my banking details for payouts?',
        answer: 'Go to Settings in the Partner Portal and enter your New Zealand bank account details. We need your bank name, account name, and account number in XX-XXXX-XXXXXXX-XXX format. Your banking information is stored securely and used only for commission payouts.'
      }
    ]
  },
  {
    title: 'Activation Codes',
    items: [
      {
        question: 'How do I order activation codes?',
        answer: 'Go to "Activation Codes" in the Partner Portal and click "Request New Codes". Select the quantity and product type, then complete the purchase. Codes are delivered instantly to your portal.'
      },
      {
        question: 'What is the wholesale pricing for activation codes?',
        answer: 'Partner wholesale pricing is typically 20-30% below retail price, depending on your partner tier and volume. Contact us if you need bulk pricing for larger orders.'
      },
      {
        question: 'Do activation codes expire?',
        answer: 'No, activation codes do not expire. Once purchased, they remain valid until used by a customer.'
      },
      {
        question: 'Can I return unused activation codes?',
        answer: 'Activation codes are non-refundable once purchased. We recommend ordering in smaller batches until you have a feel for your sales volume.'
      }
    ]
  },
  {
    title: 'Referral Codes & Commissions',
    items: [
      {
        question: 'How do referral codes work?',
        answer: 'Each referral code is linked to your partner account. When a customer uses your code during checkout, they may receive a discount and you earn a commission on the sale. The commission is tracked automatically in your dashboard.'
      },
      {
        question: 'What is my commission rate?',
        answer: 'Your commission rate is shown on your dashboard. Standard partner commission is 15%, but this may vary based on your partner agreement or volume tier.'
      },
      {
        question: 'When do I get paid?',
        answer: 'Commissions are processed monthly. Once your pending commission reaches the minimum payout threshold ($50 NZD), it will be included in the next payout cycle. Payouts are typically processed on the 15th of each month for the previous month\'s earnings.'
      },
      {
        question: 'How can I track my commissions?',
        answer: 'Go to "Commissions" in the Partner Portal to see all your earnings. You can view pending commissions (awaiting payout), approved commissions (in the payout queue), and paid commissions (already transferred to your bank).'
      }
    ]
  },
  {
    title: 'Marketing & Materials',
    items: [
      {
        question: 'What marketing materials are available?',
        answer: 'We provide downloadable assets including product images, brochures, counter cards, and social media graphics. Visit the "Materials" section in your Partner Portal to access these resources.'
      },
      {
        question: 'Can I get physical marketing materials?',
        answer: 'Yes! We can ship printed counter cards, brochures, and display stands to your business. Contact us at partners@memoriqr.co.nz to request physical materials.'
      },
      {
        question: 'Can I co-brand materials with my business logo?',
        answer: 'Yes, we offer co-branded materials for established partners. Contact us to discuss customization options for your business.'
      }
    ]
  },
  {
    title: 'Products & Customer Support',
    items: [
      {
        question: 'What products can I offer to customers?',
        answer: 'MemoriQR offers QR code memorial plates and NFC-enabled tags. Both link to a digital memorial page where families can share photos, videos, and memories of their loved ones (pets or humans).'
      },
      {
        question: 'How long does the memorial hosting last?',
        answer: 'Customers can choose 5-year, 10-year, or 25-year (lifetime) hosting plans. The hosting period begins when the memorial is activated.'
      },
      {
        question: 'What happens when a customer has issues with their memorial?',
        answer: 'For customer support issues, direct them to support@memoriqr.co.nz or the "Contact" page on our website. If it\'s a sales-related question, you can help them directly or forward the inquiry to us.'
      },
      {
        question: 'Can customers add more photos/videos after initial setup?',
        answer: 'Yes! Customers receive an edit link via email when they create their memorial. They can add up to 20 photos and 3 videos, and update the memorial text at any time.'
      }
    ]
  },
  {
    title: 'Account & Settings',
    items: [
      {
        question: 'How do I update my business information?',
        answer: 'Go to "Settings" in the Partner Portal. You can update your business name, contact details, phone number, website, and business address.'
      },
      {
        question: 'I forgot my login email - how do I access my account?',
        answer: 'Contact us at partners@memoriqr.co.nz with your business name and we\'ll help you recover your account.'
      },
      {
        question: 'Can I have multiple users on my partner account?',
        answer: 'Currently, each partner account supports a single login. If you need multiple users, contact us to discuss enterprise options.'
      }
    ]
  },
  {
    title: 'Login & Security',
    items: [
      {
        question: 'How long does my session last before I need to log in again?',
        answer: 'For security, standard sessions last 1 hour. However, while you are actively using the Portal (clicking, scrolling, typing), your session is automatically extended. If you step away for more than an hour, you\'ll need to log in again with a new verification code.'
      },
      {
        question: 'What does "Stay signed in longer" do?',
        answer: 'When you check "Stay signed in longer" during login, your session will last 24 hours instead of the standard 1 hour. This is convenient but means anyone with access to your device can access your partner account. Only use this option on personal, secure devices you control.'
      },
      {
        question: 'Is it safe to use "Stay signed in longer"?',
        answer: 'Only use this option on devices you own and control, such as your personal computer or phone. Avoid using it on shared computers, public devices, or devices others have access to. Remember, your partner account contains business information and commission data. You can always log out manually by clicking "Logout" in the top-right corner.'
      },
      {
        question: 'Why do I need a verification code every time I log in?',
        answer: 'We use email-based verification codes instead of passwords for better security. This means even if someone knows your email, they cannot access your account without also having access to your email inbox. Each code expires after 15 minutes and can only be used once.'
      },
      {
        question: 'How do I log out of the Partner Portal?',
        answer: 'Click the "Logout" button in the top-right corner of any Partner Portal page. This immediately ends your session and requires a new verification code to log back in.'
      }
    ]
  }
]

export default function PartnerFAQPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [partnerName, setPartnerName] = useState('')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  // Extend session while user is active
  useSessionExtension()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/partner/session')
      if (response.status === 401) {
        router.push('/partner')
        return
      }
      const data = await response.json()
      setPartnerName(data.partner?.partner_name || 'Partner')
    } catch {
      router.push('/partner')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/partner/session', { method: 'DELETE' })
    router.push('/partner')
  }

  const toggleItem = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PartnerHeader partnerName={partnerName || undefined} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/partner/dashboard"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Partner FAQ</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Find answers to common questions about the MemoriQR Partner Program
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {faqCategories.map((category) => (
            <div key={category.title} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
                <h2 className="text-xl font-semibold text-emerald-800">{category.title}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {category.items.map((item, index) => {
                  const itemKey = `${category.title}-${index}`
                  const isOpen = openItems.has(itemKey)
                  
                  return (
                    <div key={itemKey}>
                      <button
                        onClick={() => toggleItem(itemKey)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 text-lg pr-4">{item.question}</span>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600 text-lg leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-emerald-50 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-emerald-800 text-xl mb-2">Still have questions?</h3>
          <p className="text-emerald-700 text-lg mb-4">
            Our partner support team is here to help
          </p>
          <a
            href="mailto:partners@memoriqr.co.nz"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Contact Partner Support
          </a>
        </div>
      </div>
    </div>
  )
}
