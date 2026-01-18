'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Heart, Loader2, AlertCircle, Check, Palette, Image as ImageIcon, Save, Upload, X, Star, Plus, Video, Trash2, Eye, Mail, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import type { HostingDuration, ProductType } from '@/types/database'
import { MemorialPhoto, MemorialVideo } from '@/types'
import { MEMORIAL_THEMES, MEMORIAL_FRAMES, getAvailableThemes, getAvailableFrames } from '@/lib/memorial-options'
import { TIER_LIMITS } from '@/lib/pricing'
import { getYouTubeId } from '@/lib/utils'

interface MemorialData {
  id: string
  slug: string
  deceasedName: string
  deceasedType: 'pet' | 'human'
  species?: string
  birthDate?: string
  deathDate?: string
  memorialText?: string
  photos: MemorialPhoto[]
  videos: MemorialVideo[]
  theme: string
  frame: string
  hostingDuration: HostingDuration
  productType: ProductType
}

function EditPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const sessionToken = searchParams.get('session')
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // MFA verification state
  const [verificationStep, setVerificationStep] = useState<'checking' | 'send' | 'verify' | 'verified'>('checking')
  const [verificationCode, setVerificationCode] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [memorial, setMemorial] = useState<MemorialData | null>(null)

  // Editable fields
  const [memorialText, setMemorialText] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('classic')
  const [selectedFrame, setSelectedFrame] = useState('classic-ornate')
  const [photos, setPhotos] = useState<MemorialPhoto[]>([])
  const [videos, setVideos] = useState<MemorialVideo[]>([])
  const [youtubeUrl, setYoutubeUrl] = useState('')

  // Get limits based on plan
  const photoLimit = memorial ? TIER_LIMITS[memorial.hostingDuration]?.photos || 20 : 20
  const videoLimit = memorial ? TIER_LIMITS[memorial.hostingDuration]?.videos || 2 : 2

  // Get available themes/frames based on plan
  const availableThemes = memorial ? getAvailableThemes(memorial.hostingDuration) : []
  const availableFramesList = memorial ? getAvailableFrames(memorial.hostingDuration) : []

  // Handle MFA verification flow
  useEffect(() => {
    if (!token) {
      setError('Invalid edit link. Please use the link from your confirmation email.')
      setVerificationStep('send')
      setLoading(false)
      return
    }

    // If we have a session token, verify it and load memorial data
    if (sessionToken) {
      setVerificationStep('verified')
      fetch(`/api/memorial/edit?token=${token}&session=${sessionToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            // Session invalid, need to re-verify
            setError(data.error)
            setVerificationStep('send')
          } else {
            setMemorial(data.memorial)
            setMemorialText(data.memorial.memorialText || '')
            setSelectedTheme(data.memorial.theme || 'classic')
            setSelectedFrame(data.memorial.frame || 'classic-ornate')
            setPhotos(data.memorial.photos || [])
            setVideos(data.memorial.videos || [])
          }
          setLoading(false)
        })
        .catch(() => {
          setError('Failed to load memorial data')
          setVerificationStep('send')
          setLoading(false)
        })
    } else {
      // No session token, need to verify via email
      setVerificationStep('send')
      setLoading(false)
    }
  }, [token, sessionToken])

  // Send verification code to email
  const handleSendCode = async () => {
    if (!token) return
    
    setSendingCode(true)
    setError('')
    
    try {
      const response = await fetch('/api/memorial/edit/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setMaskedEmail(data.email)
        setVerificationStep('verify')
      }
    } catch {
      setError('Failed to send verification code')
    }
    
    setSendingCode(false)
  }

  // Verify the entered code
  const handleVerifyCode = async () => {
    if (!token || !verificationCode) return
    
    setVerifyingCode(true)
    setError('')
    
    try {
      const response = await fetch('/api/memorial/edit/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, code: verificationCode }),
      })
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        // Redirect to same page with session token
        router.push(`/memorial/edit?token=${token}&session=${data.sessionToken}`)
      }
    } catch {
      setError('Failed to verify code')
    }
    
    setVerifyingCode(false)
  }

  // Photo upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0 || !token) return

    setUploadingPhotos(true)
    setError('')

    const formData = new FormData()
    formData.append('token', token)
    files.forEach(file => formData.append('photos', file))

    try {
      const response = await fetch('/api/memorial/photos', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setPhotos(data.photos)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch {
      setError('Failed to upload photos')
    }

    setUploadingPhotos(false)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  // Photo delete handler
  const handleDeletePhoto = async (photoId: string) => {
    if (!token) return

    setDeletingId(photoId)
    setError('')

    try {
      const response = await fetch('/api/memorial/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, photoId }),
      })
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setPhotos(data.photos)
      }
    } catch {
      setError('Failed to delete photo')
    }

    setDeletingId(null)
  }

  // Set profile photo handler
  const handleSetProfilePhoto = async (photoId: string) => {
    if (!token) return

    try {
      const response = await fetch('/api/memorial/photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, photoId }),
      })
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setPhotos(data.photos)
      }
    } catch {
      setError('Failed to set profile photo')
    }
  }

  // Add YouTube video handler
  const handleAddYoutubeVideo = async () => {
    if (!token || !youtubeUrl) return

    const ytId = getYouTubeId(youtubeUrl)
    if (!ytId) {
      setError('Invalid YouTube URL')
      return
    }

    setUploadingVideo(true)
    setError('')

    try {
      const response = await fetch('/api/memorial/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, url: youtubeUrl }),
      })
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setVideos(data.videos)
        setYoutubeUrl('')
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch {
      setError('Failed to add video')
    }

    setUploadingVideo(false)
  }

  // Upload video file handler
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    setUploadingVideo(true)
    setError('')

    const formData = new FormData()
    formData.append('token', token)
    formData.append('video', file)

    try {
      const response = await fetch('/api/memorial/videos', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setVideos(data.videos)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch {
      setError('Failed to upload video')
    }

    setUploadingVideo(false)
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  // Delete video handler
  const handleDeleteVideo = async (videoId: string) => {
    if (!token) return

    setDeletingId(videoId)
    setError('')

    try {
      const response = await fetch('/api/memorial/videos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, videoId }),
      })
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setVideos(data.videos)
      }
    } catch {
      setError('Failed to delete video')
    }

    setDeletingId(null)
  }

  const handleSave = async (exitAfter: boolean = false) => {
    if (!memorial || !token) return

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/memorial/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          memorialText,
          theme: selectedTheme,
          frame: selectedFrame,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(true)
        if (exitAfter) {
          // Redirect to the memorial page
          router.push(`/memorial/${memorial.slug}`)
        } else {
          setTimeout(() => setSuccess(false), 3000)
        }
      }
    } catch {
      setError('Failed to save changes')
    }

    setSaving(false)
  }

  // Save and then view memorial in new tab
  const handleSaveAndView = async () => {
    if (!memorial || !token) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/memorial/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          memorialText,
          theme: selectedTheme,
          frame: selectedFrame,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        // Open memorial in new tab
        window.open(`/memorial/${memorial.slug}`, '_blank')
      }
    } catch {
      setError('Failed to save changes')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-memorial-cream">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  // Show MFA verification screen
  if (verificationStep === 'send' || verificationStep === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-memorial-cream p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <ShieldCheck className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h1 className="text-2xl font-serif mb-2">Verify Your Identity</h1>
            <p className="text-gray-600">
              For your security, we need to verify your email address before you can edit this memorial.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {verificationStep === 'send' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Click the button below to receive a verification code at your registered email address.
              </p>
              <button
                onClick={handleSendCode}
                disabled={sendingCode || !token}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {sendingCode ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Send Verification Code
                  </>
                )}
              </button>
              
              <button
                onClick={() => setVerificationStep('verify')}
                className="text-sm text-primary-600 hover:text-primary-700 w-full text-center"
              >
                I already have a code
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {maskedEmail ? (
                    <>A verification code has been sent to <strong>{maskedEmail}</strong>.</>
                  ) : (
                    <>Enter the verification code from your email.</>
                  )}
                  {' '}The code expires in <strong>1 hour</strong>.
                </p>
              </div>
              
              <div>
                <label className="label">Enter 6-digit code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="input text-center text-2xl tracking-widest"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={verifyingCode || verificationCode.length !== 6}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {verifyingCode ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    Verify & Continue
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setVerificationStep('send')
                  setVerificationCode('')
                  setError('')
                }}
                className="text-sm text-gray-600 hover:text-primary-600 w-full text-center"
              >
                Didn't receive the code? Send again
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (error && !memorial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-memorial-cream p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-serif mb-2">Unable to Edit</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/" className="btn-primary inline-block">Return Home</a>
        </div>
      </div>
    )
  }

  if (!memorial) return null

  return (
    <div className="min-h-screen bg-memorial-cream">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container-narrow py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-primary-600">
            <Heart className="h-5 w-5" />
            <span className="font-medium">MemoriQR</span>
          </a>
          <a
            href={`/memorial/${memorial.slug}`}
            target="_blank"
            className="text-sm text-gray-600 hover:text-primary-600"
          >
            View Memorial →
          </a>
        </div>
      </header>

      <main className="container-narrow py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-serif mb-2">Edit Memorial</h1>
          <p className="text-gray-600 mb-8">
            Update the memorial page for <strong>{memorial.deceasedName}</strong>
          </p>

          {/* Status messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
              <Check className="h-5 w-5 flex-shrink-0" />
              Changes saved successfully!
            </div>
          )}

          <div className="space-y-8">
            {/* Photos Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Photos ({photos.length}/{photoLimit})</label>
                {photos.length < photoLimit && (
                  <label className="btn-outline text-sm cursor-pointer flex items-center gap-2">
                    {uploadingPhotos ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add Photos
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhotos}
                    />
                  </label>
                )}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-2">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative group"
                  >
                    <Image
                      src={photo.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                    {/* Profile badge */}
                    {photo.isProfile && (
                      <div className="absolute top-1 left-1 bg-primary-500 text-white rounded-full p-1">
                        <Star className="h-3 w-3" />
                      </div>
                    )}
                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!photo.isProfile && (
                        <button
                          onClick={() => handleSetProfilePhoto(photo.id)}
                          className="p-2 bg-white rounded-full text-primary-600 hover:bg-primary-50"
                          title="Set as profile photo"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      {photos.length > 1 && (
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          disabled={deletingId === photo.id}
                          className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                          title="Delete photo"
                        >
                          {deletingId === photo.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click a photo to set as profile or delete. Profile photo shows in the memorial header.
              </p>
            </div>

            {/* Videos Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Videos ({videos.length}/{videoLimit})</label>
              </div>
              
              {/* Current videos */}
              {videos.length > 0 && (
                <div className="space-y-3 mb-4">
                  {videos.map((video) => (
                    <div key={video.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Video className="h-5 w-5 text-gray-400" />
                      <span className="flex-1 text-sm truncate">
                        {video.type === 'youtube' || video.youtubeId
                          ? `YouTube: ${video.youtubeId}`
                          : video.title || 'Uploaded video'}
                      </span>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        disabled={deletingId === video.id}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        {deletingId === video.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add video */}
              {videos.length < videoLimit && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="Paste YouTube URL..."
                      className="input flex-1"
                    />
                    <button
                      onClick={handleAddYoutubeVideo}
                      disabled={!youtubeUrl || uploadingVideo}
                      className="btn-primary"
                    >
                      {uploadingVideo ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        'Add'
                      )}
                    </button>
                  </div>
                  <div className="text-center text-sm text-gray-500">or</div>
                  <label className="btn-outline w-full cursor-pointer flex items-center justify-center gap-2">
                    {uploadingVideo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload Video File (max 50MB)
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileUpload}
                      className="hidden"
                      disabled={uploadingVideo}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Memorial Text */}
            <div>
              <label className="label">Memorial Text</label>
              <textarea
                value={memorialText}
                onChange={(e) => setMemorialText(e.target.value)}
                rows={6}
                className="input resize-none"
                placeholder="Share memories, stories, or a tribute..."
              />
            </div>

            {/* Theme Selection */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-5 w-5 text-primary-600" />
                <label className="label mb-0">Theme</label>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {availableThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-3 rounded-lg border-2 transition-all relative ${
                      selectedTheme === theme.id
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                    style={{ backgroundColor: theme.colors.bg }}
                  >
                    <div
                      className="h-6 w-full rounded mb-2"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                    <p className="text-xs font-medium" style={{ color: theme.colors.text }}>
                      {theme.name}
                    </p>
                    {selectedTheme === theme.id && (
                      <Check className="absolute top-2 right-2 h-4 w-4 text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Selection */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-5 w-5 text-primary-600" />
                <label className="label mb-0">Photo Frame</label>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {availableFramesList.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`p-3 rounded-lg border-2 transition-all bg-white relative ${
                      selectedFrame === frame.id
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="h-12 w-full rounded bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl">
                      {frame.preview}
                    </div>
                    <p className="text-xs font-medium text-gray-800 mt-2">{frame.name}</p>
                    {selectedFrame === frame.id && (
                      <Check className="absolute top-2 right-2 h-4 w-4 text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <a
                href={`/memorial/${memorial.slug}`}
                className="btn-outline flex-1 text-center"
              >
                Cancel
              </a>
              <button
                onClick={handleSaveAndView}
                disabled={saving}
                className="btn-outline flex-1 flex items-center justify-center gap-2"
              >
                <Eye className="h-5 w-5" />
                Save & View
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save & Exit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function MemorialEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-memorial-cream">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    }>
      <EditPageContent />
    </Suspense>
  )
}
