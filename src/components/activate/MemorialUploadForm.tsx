'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Loader2, 
  Check,
  X,
  Plus
} from 'lucide-react'
import type { HostingDuration, ProductType } from '@/types/database'
import { SPECIES_OPTIONS } from '@/types'

interface MemorialUploadFormProps {
  activationType: 'online' | 'retail'
  activationCode?: string
  memorialId?: string
  memorialSlug?: string
  deceasedName?: string
  deceasedType?: 'pet' | 'human'
  productType: ProductType
  hostingDuration: HostingDuration
  partnerId?: string
}

export function MemorialUploadForm({
  activationType,
  activationCode,
  memorialId,
  memorialSlug,
  deceasedName: initialName,
  deceasedType: initialType,
  productType,
  hostingDuration,
  partnerId,
}: MemorialUploadFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [deceasedName, setDeceasedName] = useState(initialName || '')
  const [deceasedType, setDeceasedType] = useState<'pet' | 'human'>(initialType || 'pet')
  const [species, setSpecies] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [deathDate, setDeathDate] = useState('')
  const [memorialText, setMemorialText] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState('')

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(
      (file) => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    )

    if (validFiles.length + photos.length > 50) {
      alert('Maximum 50 photos allowed')
      return
    }

    setPhotos((prev) => [...prev, ...validFiles])

    // Generate previews
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotosPreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!deceasedName || photos.length === 0) {
      setError('Please provide a name and at least one photo')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      
      formData.append('activationType', activationType)
      if (activationCode) formData.append('activationCode', activationCode)
      if (memorialId) formData.append('memorialId', memorialId)
      if (partnerId) formData.append('partnerId', partnerId)
      
      formData.append('deceasedName', deceasedName)
      formData.append('deceasedType', deceasedType)
      if (species) formData.append('species', species)
      if (birthDate) formData.append('birthDate', birthDate)
      if (deathDate) formData.append('deathDate', deathDate)
      if (memorialText) formData.append('memorialText', memorialText)
      if (videoUrl) formData.append('videoUrl', videoUrl)
      formData.append('hostingDuration', hostingDuration.toString())
      formData.append('productType', productType)

      photos.forEach((photo) => {
        formData.append('photos', photo)
      })

      const response = await fetch('/api/memorial/create', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create memorial')
      }

      // Redirect to the memorial page
      router.push(`/memorial/${data.slug}?created=true`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-gray-900 mb-2">
          {step === 1 ? 'Tell Us About Your Loved One' : 
           step === 2 ? 'Add Photos' : 
           'Add a Story'}
        </h1>
        <p className="text-gray-600">
          {step === 1 ? "We'll use this to create their memorial page." :
           step === 2 ? 'Upload photos to remember them by.' :
           'Share their story, personality, and what made them special.'}
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                step >= s
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > s ? <Check className="h-5 w-5" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  step > s ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Basic Details */}
        {step === 1 && (
          <div className="space-y-6">
            {!initialName && (
              <>
                <div>
                  <label className="label">This memorial is for a:</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDeceasedType('pet')}
                      className={`p-4 rounded-lg border-2 text-center ${
                        deceasedType === 'pet'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Beloved Pet
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeceasedType('human')}
                      className={`p-4 rounded-lg border-2 text-center ${
                        deceasedType === 'human'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Loved One
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">
                    {deceasedType === 'pet' ? "Pet's Name" : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={deceasedName}
                    onChange={(e) => setDeceasedName(e.target.value)}
                    className="input"
                    placeholder={deceasedType === 'pet' ? 'e.g., Max' : 'e.g., John Smith'}
                    required
                  />
                </div>
              </>
            )}

            {deceasedType === 'pet' && (
              <div>
                <label className="label">Species</label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="input"
                >
                  <option value="">Select species</option>
                  {SPECIES_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Birth Date (optional)</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Passing Date (optional)</label>
                <input
                  type="date"
                  value={deathDate}
                  onChange={(e) => setDeathDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!deceasedName}
              className="btn-primary w-full"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Photos */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="label">Upload Photos</label>
              <p className="text-sm text-gray-500 mb-4">
                Add up to 50 photos. The first photo will be the main image.
              </p>

              {/* Upload area */}
              <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  PNG, JPG up to 10MB each
                </p>
              </label>
            </div>

            {/* Photo previews */}
            {photosPreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {photosPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Photo ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                        Main
                      </span>
                    )}
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="btn-outline flex-1">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={photos.length === 0}
                className="btn-primary flex-1"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Story */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="label">Memorial Message</label>
              <p className="text-sm text-gray-500 mb-2">
                Share their story, personality, and what made them special.
              </p>
              <textarea
                value={memorialText}
                onChange={(e) => setMemorialText(e.target.value)}
                className="textarea"
                rows={8}
                placeholder="Write a heartfelt message..."
              />
            </div>

            <div>
              <label className="label">YouTube Video Link (optional)</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="input"
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Add a YouTube video to share more memories.
              </p>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="btn-outline flex-1">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Memorial...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Publish Memorial
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
