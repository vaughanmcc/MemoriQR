'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ArrowLeft, Save, Building, CreditCard, AlertCircle, CheckCircle, User, MapPin, Shield, Smartphone, Bell } from 'lucide-react'

interface PartnerAddress {
  street?: string
  city?: string
  region?: string
  postcode?: string
  country?: string
}

interface PartnerSettings {
  id: string
  partner_name: string | null
  business_name: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  address: PartnerAddress | null
  payout_email: string | null
  bank_account_name: string | null
  bank_account_number: string | null
  bank_name: string | null
  notify_referral_redemption: boolean
}

export default function PartnerSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [revokingTrust, setRevokingTrust] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [settings, setSettings] = useState<PartnerSettings | null>(null)
  const [hasTrustedSessions, setHasTrustedSessions] = useState(false)
  const [formData, setFormData] = useState({
    // Business info
    business_name: '',
    contact_name: '',
    contact_phone: '',
    website: '',
    address: {
      street: '',
      city: '',
      region: '',
      postcode: '',
      country: 'New Zealand',
    },
    // Payout info
    payout_email: '',
    bank_name: '',
    bank_account_name: '',
    bank_account_number: '',
    // Notification preferences
    notify_referral_redemption: true,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/partner/settings')
      
      if (response.status === 401) {
        router.push('/partner')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const data = await response.json()
      setSettings(data.settings)
      setHasTrustedSessions(data.hasTrustedSessions || false)
      const addr = data.settings.address || {}
      setFormData({
        business_name: data.settings.business_name || '',
        contact_name: data.settings.contact_name || '',
        contact_phone: data.settings.contact_phone || '',
        website: data.settings.website || '',
        address: {
          street: addr.street || '',
          city: addr.city || '',
          region: addr.region || '',
          postcode: addr.postcode || '',
          country: addr.country || 'New Zealand',
        },
        payout_email: data.settings.payout_email || '',
        bank_name: data.settings.bank_name || '',
        bank_account_name: data.settings.bank_account_name || '',
        bank_account_number: data.settings.bank_account_number || '',
        notify_referral_redemption: data.settings.notify_referral_redemption ?? true,
      })
    } catch (err) {
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/partner/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save settings')
      }

      setSuccess('Settings saved successfully!')
      await fetchSettings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/partner/session', { method: 'DELETE' })
    router.push('/partner')
  }

  const handleRevokeTrustedSessions = async () => {
    if (!confirm('This will log you out of all devices where you selected "Stay signed in longer". You will need to log in again on those devices. Continue?')) {
      return
    }
    
    setRevokingTrust(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/partner/settings/revoke-trust', {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to revoke trusted sessions')
      }

      const data = await response.json()
      setSuccess(data.message || 'Trusted sessions revoked successfully')
      setHasTrustedSessions(false)
      
      // Clear localStorage acknowledgment so warning shows again next time
      localStorage.removeItem('partner_trust_warning_ack')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke trusted sessions')
    } finally {
      setRevokingTrust(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  const hasBankDetails = settings?.bank_account_number && settings?.bank_name

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-serif text-emerald-700">
                MemoriQR
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">Partner Portal</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{settings?.partner_name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/partner/dashboard"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-1">Manage your payout preferences and banking details</p>
          </div>

          {/* Bank Details Status Banner */}
          {!hasBankDetails && (
            <div className="mx-6 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Banking details required</p>
                <p className="text-sm text-amber-700 mt-1">
                  Please add your banking details to receive commission payouts. Without this information, we cannot process your payments.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Business Info Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-medium text-gray-900">Business Information</h2>
              </div>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="e.g. 021 123 4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Address Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-medium text-gray-900">Business Address</h2>
              </div>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                    <input
                      type="text"
                      value={formData.address.region}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, region: e.target.value } })}
                      placeholder="e.g. Auckland"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postcode</label>
                    <input
                      type="text"
                      value={formData.address.postcode}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, postcode: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.address.country}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payout Email */}
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payout Notification Email
              </label>
              <input
                type="email"
                value={formData.payout_email}
                onChange={(e) => setFormData({ ...formData, payout_email: e.target.value })}
                placeholder={settings?.contact_email || 'your@email.com'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Leave blank to use your primary email ({settings?.contact_email})
              </p>
            </div>

            {/* Bank Details Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-medium text-gray-900">Banking Details</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Your banking details are stored securely and used only for commission payouts.
              </p>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <select
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Select your bank</option>
                    <option value="ANZ">ANZ</option>
                    <option value="ASB">ASB</option>
                    <option value="BNZ">BNZ</option>
                    <option value="Kiwibank">Kiwibank</option>
                    <option value="Westpac">Westpac</option>
                    <option value="TSB">TSB</option>
                    <option value="Heartland">Heartland Bank</option>
                    <option value="SBS">SBS Bank</option>
                    <option value="Co-operative">The Co-operative Bank</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={formData.bank_account_name}
                    onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                    placeholder="Name as it appears on account"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Account Number
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.bank_account_number}
                    onChange={(e) => {
                      // Remove non-digits and format
                      const value = e.target.value.replace(/\D/g, '')
                      // Format as NZ bank account (XX-XXXX-XXXXXXX-XXX)
                      let formatted = value
                      if (value.length > 2) {
                        formatted = value.slice(0, 2) + '-' + value.slice(2)
                      }
                      if (value.length > 6) {
                        formatted = value.slice(0, 2) + '-' + value.slice(2, 6) + '-' + value.slice(6)
                      }
                      if (value.length > 13) {
                        formatted = value.slice(0, 2) + '-' + value.slice(2, 6) + '-' + value.slice(6, 13) + '-' + value.slice(13, 16)
                      }
                      setFormData({ ...formData, bank_account_number: formatted })
                    }}
                    placeholder="XX-XXXX-XXXXXXX-XXX"
                    maxLength={19}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    New Zealand bank account format: Bank-Branch-Account-Suffix
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-xl shadow-sm mt-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">Security</h2>
            </div>
            <p className="text-gray-600 mt-1 text-sm">Manage your login sessions and security settings</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Trusted Devices</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {hasTrustedSessions 
                      ? 'You have active sessions on trusted devices (24-hour login). Revoking will log you out of those devices.'
                      : 'No trusted device sessions are currently active.'}
                  </p>
                </div>
              </div>
              {hasTrustedSessions && (
                <button
                  onClick={handleRevokeTrustedSessions}
                  disabled={revokingTrust}
                  className="flex-shrink-0 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50"
                >
                  {revokingTrust ? 'Revoking...' : 'Revoke All'}
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Tip: To re-enable &quot;Stay signed in longer&quot; on a device, simply log in again and check the option.
            </p>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-xl shadow-sm mt-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">Email Notifications</h2>
            </div>
            <p className="text-gray-600 mt-1 text-sm">Manage which emails you receive</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Referral Code Redemptions</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Receive an email when a customer uses one of your referral codes to place an order.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notify_referral_redemption}
                  onChange={(e) => setFormData({ ...formData, notify_referral_redemption: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>🔒 Security:</strong> Your banking information is encrypted and stored securely. 
            We only use these details to process your commission payouts. 
            For your protection, account numbers are partially masked in emails and statements.
          </p>
        </div>
      </div>
    </div>
  )
}
