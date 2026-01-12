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
import { TIER_LIMITS } from '@/lib/pricing'

// Video entry can be either a file upload or a YouTube URL
interface VideoEntry {
  type: 'file' | 'youtube'
  file?: File
  url?: string
  preview?: string
}

const MAX_VIDEO_FILE_SIZE = 50 * 1024 * 1024 // 50MB

interface MemorialUploadFormProps {
  activationType: 'online' | 'retail'
  activationCode?: string
  memorialId?: string
  memorialSlug?: string
  deceasedName?: string
  deceasedType?: 'pet' | 'human'
  species?: string
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
  species: initialSpecies,
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
  const [species, setSpecies] = useState(initialSpecies || '')
  const [birthDate, setBirthDate] = useState('')
  const [deathDate, setDeathDate] = useState('')
  const [memorialText, setMemorialText] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([])
  const [videos, setVideos] = useState<VideoEntry[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingVideo, setIsDraggingVideo] = useState<number | null>(null)
  const [isDraggingVideoZone, setIsDraggingVideoZone] = useState(false)
  
  // Get video limit for this plan
  const videoLimit = TIER_LIMITS[hostingDuration]?.videos || 2

  // Process photo files (used by both input change and drag/drop)
  const processPhotoFiles = (files: File[]) => {
    // Check for video files and alert user
    const videoFiles = files.filter((file) => file.type.startsWith('video/'))
    if (videoFiles.length > 0) {
      alert('Video files cannot be uploaded here. Please add videos in Step 3 using the "Add Video" button.')
    }

    const validFiles = files.filter(
      (file) => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    )

    // Alert for oversized images
    const oversizedImages = files.filter(
      (file) => file.type.startsWith('image/') && file.size > 10 * 1024 * 1024
    )
    if (oversizedImages.length > 0) {
      alert(`${oversizedImages.length} image(s) were too large (max 10MB each) and were not added.`)
    }

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processPhotoFiles(files)
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    processPhotoFiles(files)
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // Video handling functions
  const addVideoSlot = () => {
    if (videos.length < videoLimit) {
      setVideos((prev) => [...prev, { type: 'youtube' as const, url: '' }])
    }
  }

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index))
  }

  const updateVideoType = (index: number, type: 'file' | 'youtube') => {
    setVideos((prev) => prev.map((v, i) => 
      // Preserve existing file/url data when switching types
      i === index ? { ...v, type } : v
    ))
  }

  const updateVideoUrl = (index: number, url: string) => {
    setVideos((prev) => prev.map((v, i) => 
      i === index ? { ...v, url } : v
    ))
  }

  const handleVideoFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      alert('Please select a video file')
      return
    }

    if (file.size > MAX_VIDEO_FILE_SIZE) {
      alert('Video file must be under 50MB. For larger videos, please use a YouTube link instead.')
      return
    }

    const preview = URL.createObjectURL(file)
    setVideos((prev) => prev.map((v, i) => 
      i === index ? { ...v, file, preview } : v
    ))
  }

  // Video drag and drop handlers
  const handleVideoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    // Prevent browser from opening the file
    e.dataTransfer.dropEffect = 'copy'
    setIsDraggingVideo(index)
  }

  const handleVideoDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingVideo(null)
  }

  const handleVideoDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    // Prevent browser from opening the file
    e.dataTransfer.dropEffect = 'copy'
    setIsDraggingVideo(null)
    
    const file = e.dataTransfer.files[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      alert('Please drop a video file')
      return
    }

    if (file.size > MAX_VIDEO_FILE_SIZE) {
      alert('Video file must be under 50MB. For larger videos, please use a YouTube link instead.')
      return
    }

    const preview = URL.createObjectURL(file)
    setVideos((prev) => prev.map((v, i) => 
      i === index ? { ...v, type: 'file', file, preview } : v
    ))
  }

  // Main video zone drag handlers (for dropping to create new video slot)
  const handleVideoZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setIsDraggingVideoZone(true)
  }

  const handleVideoZoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingVideoZone(false)
  }

  const handleVideoZoneDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingVideoZone(false)
    
    const file = e.dataTransfer.files[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      alert('Please drop a video file')
      return
    }

    if (file.size > MAX_VIDEO_FILE_SIZE) {
      alert('Video file must be under 50MB. For larger videos, please use a YouTube link instead.')
      return
    }

    if (videos.length >= videoLimit) {
      alert(`Maximum ${videoLimit} videos allowed for your plan`)
      return
    }

    const preview = URL.createObjectURL(file)
    setVideos((prev) => [...prev, { type: 'file' as const, file, preview }])
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
      formData.append('hostingDuration', hostingDuration.toString())
      formData.append('productType', productType)

      photos.forEach((photo) => {
        formData.append('photos', photo)
      })

      // Append video data
      const videoUrls: string[] = []
      videos.forEach((video, index) => {
        if (video.type === 'youtube' && video.url) {
          videoUrls.push(video.url)
        } else if (video.type === 'file' && video.file) {
          formData.append('videoFiles', video.file)
        }
      })
      if (videoUrls.length > 0) {
        formData.append('videoUrls', JSON.stringify(videoUrls))
      }

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
                  max={new Date().toISOString().split('T')[0]}
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
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Upload Photos</label>
                <span className="text-sm text-gray-500">
                  {photos.length} / 50 photos
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Add up to 50 photos. The first photo will be the main image.
              </p>

              {/* Upload area with drag and drop - hidden when limit reached */}
              {photos.length < 50 && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300 hover:border-primary-400'
                  }`}
                >
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <ImageIcon className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
                  <p className={isDragging ? 'text-primary-600 font-medium' : 'text-gray-600'}>
                    {isDragging ? 'Drop photos here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    PNG, JPG up to 10MB each
                  </p>
                </label>
              </div>
              )}

              {/* Show message when limit reached */}
              {photos.length >= 50 && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  Maximum 50 photos reached. Delete some photos to add more.
                </p>
              )}
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

            {/* Video Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Videos (optional)</label>
                <span className="text-sm text-gray-500">
                  {videos.length} / {videoLimit} videos
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Upload video files (max 50MB each) or link YouTube videos (unlimited size).
              </p>

              {/* Video entries */}
              <div className="space-y-4">
                {videos.map((video, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-lg p-4 transition-colors ${
                      isDraggingVideo === index
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200'
                    }`}
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDragOver={(e) => handleVideoDragOver(e, index)}
                    onDragLeave={handleVideoDragLeave}
                    onDrop={(e) => handleVideoDrop(e, index)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Video {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Type selector */}
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => updateVideoType(index, 'youtube')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          video.type === 'youtube'
                            ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                            : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                        }`}
                      >
                        YouTube Link
                      </button>
                      <button
                        type="button"
                        onClick={() => updateVideoType(index, 'file')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          video.type === 'file'
                            ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                            : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                        }`}
                      >
                        Upload File (max 50MB)
                      </button>
                    </div>

                    {/* Input based on type */}
                    {video.type === 'youtube' ? (
                      <input
                        type="url"
                        value={video.url || ''}
                        onChange={(e) => updateVideoUrl(index, e.target.value)}
                        className="input"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    ) : (
                      <div>
                        {video.file ? (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Video className="h-5 w-5 text-gray-500" />
                            <span className="text-sm text-gray-700 truncate flex-1">
                              {video.file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {(video.file.size / (1024 * 1024)).toFixed(1)}MB
                            </span>
                          </div>
                        ) : (
                          <label 
                            className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                              isDraggingVideo === index
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-300 hover:border-primary-400'
                            }`}
                          >
                            <Upload className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {isDraggingVideo === index ? 'Drop video here' : 'Choose or drag video file'}
                            </span>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => handleVideoFileUpload(index, e)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add video drop zone / button */}
              {videos.length < videoLimit && (
                <div
                  onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDragOver={handleVideoZoneDragOver}
                  onDragLeave={handleVideoZoneDragLeave}
                  onDrop={handleVideoZoneDrop}
                  onClick={addVideoSlot}
                  className={`mt-4 w-full py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 ${
                    isDraggingVideoZone
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600'
                  }`}
                >
                  <Plus className="h-5 w-5" />
                  <span>
                    {isDraggingVideoZone 
                      ? 'Drop video here' 
                      : 'Drop video or click to add'
                    }
                  </span>
                
                </div>
              )}

              {/* Show when limit reached */}
              {videos.length >= videoLimit && (
                <p className="mt-4 text-sm text-gray-500 text-center">
                  Maximum {videoLimit} videos reached for your plan.
                </p>
              )}

              {videos.length === 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Your plan includes up to {videoLimit} videos. YouTube videos have no size limit.
                </p>
              )}
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
