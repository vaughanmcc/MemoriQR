'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Loader2, 
  Check,
  X,
  Plus,
  Star,
  Palette,
  Eye
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

// Memorial themes - available based on plan
// Each theme includes frame colors: light (highlight), main (primary frame color), dark (shadow/depth)
const MEMORIAL_THEMES = [
  { id: 'classic', name: 'Classic', description: 'Timeless elegance with warm cream tones', colors: { bg: '#FDF8F3', accent: '#8B7355', text: '#4A4A4A' }, frame: { light: '#C4A882', main: '#8B7355', dark: '#5A4A36' } },
  { id: 'garden', name: 'Garden', description: 'Peaceful nature-inspired greens', colors: { bg: '#F5F9F5', accent: '#5A7F5A', text: '#3D3D3D' }, frame: { light: '#8AAF8A', main: '#5A7F5A', dark: '#3A5F3A' } },
  { id: 'ocean', name: 'Ocean', description: 'Calming blues and soft waves', colors: { bg: '#F5F8FA', accent: '#4A7C8C', text: '#3D4852' }, frame: { light: '#7AACBC', main: '#4A7C8C', dark: '#2A4C5C' } },
  { id: 'sunset', name: 'Sunset', description: 'Warm golden hour hues', colors: { bg: '#FFF9F5', accent: '#C17F59', text: '#4A3F35' }, frame: { light: '#E1AF89', main: '#C17F59', dark: '#915F39' } },
  { id: 'night', name: 'Starlight', description: 'Serene twilight with soft purples', colors: { bg: '#F8F7FA', accent: '#6B5B7A', text: '#3D3852' }, frame: { light: '#9B8BAA', main: '#6B5B7A', dark: '#4B3B5A' } },
  { id: 'rose', name: 'Rose Garden', description: 'Gentle pinks and soft romance', colors: { bg: '#FDF8F9', accent: '#B5838D', text: '#4A4045' }, frame: { light: '#D5A3AD', main: '#B5838D', dark: '#95636D' } },
  { id: 'meadow', name: 'Meadow', description: 'Fresh spring colors', colors: { bg: '#F7FAF5', accent: '#7A9E7A', text: '#3D4A3D' }, frame: { light: '#AABEAA', main: '#7A9E7A', dark: '#5A7E5A' } },
  { id: 'autumn', name: 'Autumn', description: 'Rich warm amber tones', colors: { bg: '#FAF7F2', accent: '#A67C52', text: '#4A4035' }, frame: { light: '#C69C72', main: '#A67C52', dark: '#865C32' } },
  { id: 'lavender', name: 'Lavender', description: 'Peaceful purple serenity', colors: { bg: '#F9F7FC', accent: '#8E7CC3', text: '#3D3852' }, frame: { light: '#AE9CD3', main: '#8E7CC3', dark: '#6E5CA3' } },
  { id: 'sky', name: 'Blue Sky', description: 'Uplifting bright blues', colors: { bg: '#F5FAFC', accent: '#5B9BD5', text: '#3D4852' }, frame: { light: '#8BBBE5', main: '#5B9BD5', dark: '#3B7BB5' } },
  { id: 'forest', name: 'Forest', description: 'Deep woodland greens', colors: { bg: '#F3F7F3', accent: '#4A6741', text: '#2D3A2D' }, frame: { light: '#7A9771', main: '#4A6741', dark: '#2A4721' } },
  { id: 'dawn', name: 'Dawn', description: 'Soft morning pastels', colors: { bg: '#FBF8F5', accent: '#C9A87C', text: '#4A4540' }, frame: { light: '#E9C89C', main: '#C9A87C', dark: '#A9885C' } },
  { id: 'winter', name: 'Winter', description: 'Cool crisp silver-blues', colors: { bg: '#F7F9FA', accent: '#708090', text: '#3D4852' }, frame: { light: '#A0B0C0', main: '#708090', dark: '#506070' } },
  { id: 'cherry', name: 'Cherry Blossom', description: 'Delicate Japanese-inspired pinks', colors: { bg: '#FDF9FA', accent: '#D4A5A5', text: '#4A4045' }, frame: { light: '#E4C5C5', main: '#D4A5A5', dark: '#B48585' } },
  { id: 'earth', name: 'Earth', description: 'Grounding natural browns', colors: { bg: '#F8F5F2', accent: '#8B7355', text: '#3D3832' }, frame: { light: '#AB9375', main: '#8B7355', dark: '#6B5335' } },
  { id: 'moonlight', name: 'Moonlight', description: 'Ethereal silver and white', colors: { bg: '#FAFAFA', accent: '#9CA3AF', text: '#374151' }, frame: { light: '#C4CBD7', main: '#9CA3AF', dark: '#6B7280' } },
  { id: 'spring', name: 'Spring', description: 'Fresh vibrant greens and yellows', colors: { bg: '#F9FCF5', accent: '#84A955', text: '#3D4A35' }, frame: { light: '#A4C975', main: '#84A955', dark: '#648935' } },
  { id: 'coastal', name: 'Coastal', description: 'Sandy beaches and sea foam', colors: { bg: '#FAF9F7', accent: '#7BA3A8', text: '#4A5252' }, frame: { light: '#9BC3C8', main: '#7BA3A8', dark: '#5B8388' } },
  { id: 'vineyard', name: 'Vineyard', description: 'Rich burgundy and grape', colors: { bg: '#FAF7F8', accent: '#8E4162', text: '#4A3545' }, frame: { light: '#AE6182', main: '#8E4162', dark: '#6E2142' } },
  { id: 'sage', name: 'Sage', description: 'Muted calming sage green', colors: { bg: '#F7F9F7', accent: '#87A878', text: '#3D4A40' }, frame: { light: '#A7C898', main: '#87A878', dark: '#678858' } },
  { id: 'honey', name: 'Honey', description: 'Sweet golden warmth', colors: { bg: '#FFFAF0', accent: '#D4A45A', text: '#4A4535' }, frame: { light: '#E4C47A', main: '#D4A45A', dark: '#B4843A' } },
  { id: 'arctic', name: 'Arctic', description: 'Pure ice blues and white', colors: { bg: '#F8FCFC', accent: '#7EB8C9', text: '#3D5258' }, frame: { light: '#9ED8E9', main: '#7EB8C9', dark: '#5E98A9' } },
  { id: 'mauve', name: 'Mauve', description: 'Sophisticated dusty purple', colors: { bg: '#FAF8F9', accent: '#A38B9E', text: '#4A4248' }, frame: { light: '#C3ABBE', main: '#A38B9E', dark: '#836B7E' } },
  { id: 'sunrise', name: 'Sunrise', description: 'Hopeful warm oranges', colors: { bg: '#FFFBF5', accent: '#E07B4C', text: '#4A4035' }, frame: { light: '#F09B6C', main: '#E07B4C', dark: '#C05B2C' } },
  { id: 'eternal', name: 'Eternal', description: 'Timeless black and gold', colors: { bg: '#F8F8F8', accent: '#B8860B', text: '#1A1A1A' }, frame: { light: '#D8A62B', main: '#B8860B', dark: '#886600' } },
]

// Get available themes based on plan
const getAvailableThemes = (duration: HostingDuration) => {
  const themeCount = duration === 5 ? 5 : duration === 10 ? 10 : 25
  return MEMORIAL_THEMES.slice(0, themeCount)
}

// Ornamental Frame Styles - decorative picture frames
// Patterns only - colors come from the selected theme
const MEMORIAL_FRAMES = [
  { 
    id: 'none', 
    name: 'No Frame', 
    description: 'Clean, minimal presentation',
    style: 'none',
    shape: 'square',
    preview: '⬜'
  },
  { 
    id: 'classic-ornate', 
    name: 'Classic Ornate', 
    description: 'Victorian-style decorative corners',
    style: 'ornate',
    shape: 'square',
    preview: '🖼️'
  },
  { 
    id: 'baroque', 
    name: 'Baroque', 
    description: 'Elaborate scrollwork pattern',
    style: 'baroque',
    shape: 'square',
    preview: '👑'
  },
  { 
    id: 'oval-classic', 
    name: 'Oval Classic', 
    description: 'Traditional oval portrait frame',
    style: 'oval-classic',
    shape: 'oval',
    preview: '🪞'
  },
  { 
    id: 'oval-ornate', 
    name: 'Oval Ornate', 
    description: 'Ornate oval with filigree',
    style: 'oval-ornate',
    shape: 'oval',
    preview: '🥚'
  },
  { 
    id: 'art-nouveau', 
    name: 'Art Nouveau', 
    description: 'Flowing organic curves',
    style: 'nouveau',
    shape: 'square',
    preview: '🌿'
  },
  { 
    id: 'victorian-rose', 
    name: 'Victorian Rose', 
    description: 'Floral rose accents',
    style: 'rose',
    shape: 'square',
    preview: '🌹'
  },
  { 
    id: 'celtic-heritage', 
    name: 'Celtic Heritage', 
    description: 'Interwoven Celtic knotwork',
    style: 'celtic',
    shape: 'square',
    preview: '☘️'
  },
  { 
    id: 'art-deco', 
    name: 'Art Deco', 
    description: 'Geometric 1920s glamour',
    style: 'deco',
    shape: 'square',
    preview: '💎'
  },
  { 
    id: 'oval-victorian', 
    name: 'Oval Victorian', 
    description: 'Victorian oval with flourishes',
    style: 'oval-victorian',
    shape: 'oval',
    preview: '🎀'
  },
  // Additional frames for 10+ year plans
  { 
    id: 'renaissance', 
    name: 'Renaissance', 
    description: 'Italian Renaissance grandeur',
    style: 'renaissance',
    shape: 'square',
    preview: '🎭'
  },
  { 
    id: 'rustic-carved', 
    name: 'Rustic Carved', 
    description: 'Weathered carved wood pattern',
    style: 'rustic',
    shape: 'square',
    preview: '🪵'
  },
  { 
    id: 'french-provincial', 
    name: 'French Provincial', 
    description: 'Elegant French countryside',
    style: 'french',
    shape: 'square',
    preview: '⚜️'
  },
  { 
    id: 'gothic-arch', 
    name: 'Gothic Arch', 
    description: 'Cathedral-inspired pointed arch',
    style: 'gothic',
    shape: 'arch',
    preview: '⛪'
  },
  { 
    id: 'oval-cameo', 
    name: 'Oval Cameo', 
    description: 'Elegant cameo-style oval',
    style: 'oval-cameo',
    shape: 'oval',
    preview: '💍'
  },
  // Additional frames for 25-year lifetime plans
  { 
    id: 'angel-wings', 
    name: 'Angel Wings', 
    description: 'Heavenly winged border',
    style: 'angel',
    shape: 'square',
    preview: '👼'
  },
  { 
    id: 'eternal-flame', 
    name: 'Eternal Flame', 
    description: 'Sacred flame motif',
    style: 'flame',
    shape: 'square',
    preview: '🕯️'
  },
  { 
    id: 'garden-trellis', 
    name: 'Garden Trellis', 
    description: 'Flowering vine lattice',
    style: 'garden',
    shape: 'square',
    preview: '🌺'
  },
  { 
    id: 'dove-peace', 
    name: 'Dove of Peace', 
    description: 'Peaceful dove corners',
    style: 'dove',
    shape: 'square',
    preview: '🕊️'
  },
  { 
    id: 'starlight', 
    name: 'Starlight', 
    description: 'Celestial stars and moon',
    style: 'stars',
    shape: 'square',
    preview: '⭐'
  },
  { 
    id: 'oval-floral', 
    name: 'Oval Floral', 
    description: 'Oval with floral garland',
    style: 'oval-floral',
    shape: 'oval',
    preview: '🌸'
  },
  { 
    id: 'ocean-wave', 
    name: 'Ocean Wave', 
    description: 'Rolling wave pattern',
    style: 'ocean',
    shape: 'square',
    preview: '🌊'
  },
  { 
    id: 'mountain-sunrise', 
    name: 'Mountain Sunrise', 
    description: 'Majestic peaks at dawn',
    style: 'mountain',
    shape: 'square',
    preview: '🏔️'
  },
  { 
    id: 'ivy-cascade', 
    name: 'Ivy Cascade', 
    description: 'Trailing ivy leaves',
    style: 'ivy',
    shape: 'square',
    preview: '🍃'
  },
  { 
    id: 'butterfly-garden', 
    name: 'Butterfly Garden', 
    description: 'Delicate butterfly corners',
    style: 'butterfly',
    shape: 'square',
    preview: '🦋'
  },
  { 
    id: 'oval-memorial', 
    name: 'Oval Memorial', 
    description: 'Traditional memorial oval',
    style: 'oval-memorial',
    shape: 'oval',
    preview: '🪦'
  },
]

// Get available frames based on plan
const getAvailableFrames = (duration: HostingDuration) => {
  const frameCount = duration === 5 ? 5 : duration === 10 ? 10 : 25
  return MEMORIAL_FRAMES.slice(0, frameCount)
}

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
  customerEmail?: string
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
  customerEmail: initialEmail,
}: MemorialUploadFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check if initialSpecies is a known option (use array spread for proper includes check)
  const speciesOptionsArray = [...SPECIES_OPTIONS] as string[]
  const isKnownSpecies = initialSpecies ? speciesOptionsArray.includes(initialSpecies) : false
  const normalizedInitialSpecies = initialSpecies
    ? (isKnownSpecies ? initialSpecies : 'Other')
    : ''
  const normalizedInitialSpeciesOther = initialSpecies && !isKnownSpecies
    ? initialSpecies
    : ''

  // Change step and scroll to form section for better UX
  const goToStep = (newStep: number) => {
    setStep(newStep)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  // Form state
  const [deceasedName, setDeceasedName] = useState(initialName || '')
  const [deceasedType, setDeceasedType] = useState<'pet' | 'human'>(initialType || 'pet')
  const [species, setSpecies] = useState(normalizedInitialSpecies || '')
  const [speciesOther, setSpeciesOther] = useState(normalizedInitialSpeciesOther || '')
  const [birthDate, setBirthDate] = useState('')
  const [deathDate, setDeathDate] = useState('')
  const [memorialText, setMemorialText] = useState('')
  const [contactEmail, setContactEmail] = useState(initialEmail || '')
  const [photos, setPhotos] = useState<File[]>([])
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([])
  const [profilePhotoIndex, setProfilePhotoIndex] = useState(0)
  const [selectedTheme, setSelectedTheme] = useState('classic')
  const [selectedFrame, setSelectedFrame] = useState('classic-gold')
  const [videos, setVideos] = useState<VideoEntry[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingVideo, setIsDraggingVideo] = useState<number | null>(null)
  const [isDraggingVideoZone, setIsDraggingVideoZone] = useState(false)

  const todayLocal = new Date()
  const todayLocalISO = new Date(todayLocal.getTime() - todayLocal.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0]
  
  // Get video limit, available themes and frames for this plan
  const videoLimit = TIER_LIMITS[hostingDuration]?.videos || 2
  const availableThemes = getAvailableThemes(hostingDuration)
  const availableFrames = getAvailableFrames(hostingDuration)

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
    // Adjust profile photo index if needed
    if (index === profilePhotoIndex) {
      setProfilePhotoIndex(0)
    } else if (index < profilePhotoIndex) {
      setProfilePhotoIndex((prev) => prev - 1)
    }
  }

  const setAsProfilePhoto = (index: number) => {
    setProfilePhotoIndex(index)
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
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    let addedCount = 0
    const errors: string[] = []

    for (const file of files) {
      if (videos.length + addedCount >= videoLimit) {
        errors.push(`Maximum ${videoLimit} videos allowed for your plan`)
        break
      }

      if (!file.type.startsWith('video/')) {
        errors.push(`${file.name}: Not a video file`)
        continue
      }

      if (file.size > MAX_VIDEO_FILE_SIZE) {
        errors.push(`${file.name}: Video must be under 50MB. Use YouTube for larger videos.`)
        continue
      }

      const preview = URL.createObjectURL(file)
      setVideos((prev) => [...prev, { type: 'file' as const, file, preview }])
      addedCount++
    }

    if (errors.length > 0) {
      alert(errors.join('\n'))
    }
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
      
      const resolvedSpecies = deceasedType === 'pet'
        ? (species === 'Other' ? speciesOther.trim() : species)
        : ''

      formData.append('deceasedName', deceasedName)
      formData.append('deceasedType', deceasedType)
      if (resolvedSpecies) formData.append('species', resolvedSpecies)
      if (birthDate) formData.append('birthDate', birthDate)
      if (deathDate) formData.append('deathDate', deathDate)
      if (memorialText) formData.append('memorialText', memorialText)
      formData.append('hostingDuration', hostingDuration.toString())
      formData.append('productType', productType)
      formData.append('profilePhotoIndex', profilePhotoIndex.toString())
      formData.append('theme', selectedTheme)
      formData.append('frame', selectedFrame)
      if (contactEmail) formData.append('contactEmail', contactEmail)

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
    <div ref={formRef} className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-gray-900 mb-2">
          {step === 1 ? 'Tell Us About Your Loved One' : 
           step === 2 ? 'Add Photos' : 
           step === 3 ? 'Story & Styling' :
           'Preview Your Memorial'}
        </h1>
        <p className="text-gray-600">
          {step === 1 ? "We'll use this to create their memorial page." :
           step === 2 ? 'Upload photos to remember them by.' :
           step === 3 ? 'Share their story and choose a theme.' :
           'Review everything before publishing.'}
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((s) => (
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
            {s < 4 && (
              <div
                className={`w-12 h-1 mx-1 ${
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
                  onChange={(e) => {
                    const nextValue = e.target.value
                    setSpecies(nextValue)
                    if (nextValue !== 'Other') {
                      setSpeciesOther('')
                    }
                  }}
                  className="input"
                >
                  <option value="">Select species</option>
                  {SPECIES_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {species === 'Other' && (
                  <div className="mt-3">
                    <label className="label">Please specify</label>
                    <input
                      type="text"
                      value={speciesOther}
                      onChange={(e) => setSpeciesOther(e.target.value)}
                      placeholder="e.g., Ferret"
                      className="input"
                      required
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Birth Date (optional)</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={todayLocalISO}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Passing Date (optional)</label>
                <input
                  type="date"
                  value={deathDate}
                  onChange={(e) => setDeathDate(e.target.value)}
                  max={todayLocalISO}
                  className="input"
                />
              </div>
            </div>

            {/* Only show email field for retail activations without pre-existing email */}
            {activationType === 'retail' && !initialEmail && (
              <div>
                <label className="label">Your Email Address</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="input"
                  placeholder="email@example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send you a confirmation and edit link for this memorial.
                </p>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={
                !deceasedName
                || (activationType === 'retail' && !initialEmail && !contactEmail)
                || (deceasedType === 'pet' && (!species || (species === 'Other' && !speciesOther.trim())))
              }
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
              <div>
                <p className="text-sm text-gray-500 mb-3">
                  <Star className="inline h-4 w-4 mr-1" />
                  Click any photo to set it as the profile photo
                </p>
                <div className="grid grid-cols-4 gap-4">
                  {photosPreviews.map((preview, index) => (
                    <div 
                      key={index} 
                      className={`relative group cursor-pointer rounded-lg overflow-hidden ${
                        index === profilePhotoIndex 
                          ? 'ring-4 ring-primary-500 ring-offset-2' 
                          : 'hover:ring-2 hover:ring-primary-300 hover:ring-offset-1'
                      }`}
                      onClick={() => setAsProfilePhoto(index)}
                    >
                      <img
                        src={preview}
                        alt={`Photo ${index + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                      {index === profilePhotoIndex && (
                        <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Profile
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removePhoto(index)
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
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

            {/* Theme Selection */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-5 w-5 text-primary-600" />
                <label className="label mb-0">Choose a Theme</label>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Select a color theme for your memorial page. Your {hostingDuration}-year plan includes {availableThemes.length} theme options. Hover over a theme to preview.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {availableThemes.map((theme) => (
                  <div key={theme.id} className="group relative">
                    <button
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`relative w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedTheme === theme.id
                          ? 'border-primary-500 ring-2 ring-primary-200'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                      style={{ backgroundColor: theme.colors.bg }}
                    >
                      <div 
                        className="h-8 w-full rounded mb-2"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                      <p className="font-medium text-sm" style={{ color: theme.colors.text }}>
                        {theme.name}
                      </p>
                      <p className="text-xs opacity-75 line-clamp-1" style={{ color: theme.colors.text }}>
                        {theme.description}
                      </p>
                      {selectedTheme === theme.id && (
                        <div className="absolute top-2 right-2 bg-primary-500 rounded-full p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                    {/* Hover Preview Tooltip */}
                    <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                      <div 
                        className="w-64 p-4 rounded-xl shadow-2xl border-2"
                        style={{ 
                          backgroundColor: theme.colors.bg,
                          borderColor: theme.colors.accent 
                        }}
                      >
                        {/* Mini memorial preview */}
                        <div className="text-center mb-3">
                          <div 
                            className="w-16 h-16 mx-auto rounded-full mb-2 flex items-center justify-center text-2xl"
                            style={{ backgroundColor: theme.colors.accent, color: theme.colors.bg }}
                          >
                            🐾
                          </div>
                          <p className="font-serif text-lg" style={{ color: theme.colors.text }}>Pet Name</p>
                          <p 
                            className="text-xs px-2 py-0.5 rounded-full inline-block mt-1"
                            style={{ backgroundColor: theme.colors.accent, color: theme.colors.bg }}
                          >
                            Beloved Pet
                          </p>
                        </div>
                        <div 
                          className="text-xs p-2 rounded-lg italic text-center"
                          style={{ backgroundColor: `${theme.colors.accent}15`, color: theme.colors.text }}
                        >
                          &ldquo;A cherished memory...&rdquo;
                        </div>
                        <div className="mt-2 pt-2 border-t text-center" style={{ borderColor: `${theme.colors.accent}30` }}>
                          <p className="text-xs font-medium" style={{ color: theme.colors.accent }}>
                            {theme.name} Theme
                          </p>
                        </div>
                      </div>
                      {/* Arrow */}
                      <div 
                        className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 rotate-45 border-r-2 border-b-2"
                        style={{ 
                          backgroundColor: theme.colors.bg,
                          borderColor: theme.colors.accent 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Frame Selection - Ornamental Styles with Theme Colors */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-5 w-5 text-primary-600" />
                <label className="label mb-0">Choose an Ornamental Frame Style</label>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Select a decorative frame pattern. The frame will use colors from your selected <strong>{availableThemes.find(t => t.id === selectedTheme)?.name || 'Classic'}</strong> theme.
              </p>
              <div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
                style={{
                  '--frame-light': availableThemes.find(t => t.id === selectedTheme)?.frame.light || '#C4A882',
                  '--frame-main': availableThemes.find(t => t.id === selectedTheme)?.frame.main || '#8B7355',
                  '--frame-dark': availableThemes.find(t => t.id === selectedTheme)?.frame.dark || '#5A4A36',
                } as React.CSSProperties}
              >
                {availableFrames.map((frame) => (
                  <div key={frame.id} className="group relative">
                    <button
                      onClick={() => setSelectedFrame(frame.id)}
                      className={`relative w-full p-3 rounded-lg border-2 transition-all text-left bg-white ${
                        selectedFrame === frame.id
                          ? 'border-primary-500 ring-2 ring-primary-200'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {/* Ornamental frame style preview with theme colors */}
                      <div className={`frame-preview frame-preview-themed frame-pattern-${frame.style} h-20 w-full flex items-center justify-center mb-2 rounded-lg overflow-hidden`}>
                        <div className="frame-preview-inner w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                          <span className="text-2xl">{frame.preview}</span>
                        </div>
                      </div>
                      <p className="font-medium text-sm text-gray-800">
                        {frame.name}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {frame.description}
                      </p>
                      {selectedFrame === frame.id && (
                        <div className="absolute top-2 right-2 bg-primary-500 rounded-full p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                    {/* Hover Preview Tooltip */}
                    <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                      <div className="w-56 p-4 rounded-xl shadow-2xl bg-white border border-gray-200">
                        {/* Large ornamental frame preview with theme colors */}
                        <div className={`frame-preview frame-preview-themed frame-pattern-${frame.style} frame-preview-lg mx-auto mb-3`}>
                          <div className="frame-preview-inner w-full h-full bg-gradient-to-br from-memorial-sage/30 to-memorial-cream rounded flex items-center justify-center">
                            <span className="text-5xl">🐕</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-800">{frame.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{frame.description}</p>
                        </div>
                      </div>
                      {/* Arrow */}
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 rotate-45 bg-white border-r border-b border-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => goToStep(2)} className="btn-outline flex-1">
                Back
              </button>
              <button
                onClick={() => goToStep(4)}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Preview Memorial
                <Eye className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Preview */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Memorial Preview Card */}
            <div 
              className="rounded-2xl overflow-hidden shadow-xl"
              style={{ 
                backgroundColor: availableThemes.find(t => t.id === selectedTheme)?.colors.bg || '#FDF8F3'
              }}
            >
              {/* Decorative header */}
              <div 
                className="h-2"
                style={{ 
                  background: `linear-gradient(90deg, ${availableThemes.find(t => t.id === selectedTheme)?.colors.accent}, ${availableThemes.find(t => t.id === selectedTheme)?.colors.accent}88, ${availableThemes.find(t => t.id === selectedTheme)?.colors.accent})`
                }}
              />

              <div className="p-8">
                {/* Decorative flourish */}
                <div className="flex justify-center mb-6">
                  <div className="flex items-center gap-3">
                    <span style={{ color: availableThemes.find(t => t.id === selectedTheme)?.colors.accent }}>✿</span>
                    <div className="w-12 h-px" style={{ backgroundColor: availableThemes.find(t => t.id === selectedTheme)?.colors.accent }} />
                    <Star className="h-4 w-4" style={{ color: availableThemes.find(t => t.id === selectedTheme)?.colors.accent }} />
                    <div className="w-12 h-px" style={{ backgroundColor: availableThemes.find(t => t.id === selectedTheme)?.colors.accent }} />
                    <span style={{ color: availableThemes.find(t => t.id === selectedTheme)?.colors.accent }}>✿</span>
                  </div>
                </div>

                {/* Profile photo with ornamental frame using theme colors */}
                <div 
                  className="text-center mb-6"
                  style={{
                    '--frame-light': availableThemes.find(t => t.id === selectedTheme)?.frame.light || '#C4A882',
                    '--frame-main': availableThemes.find(t => t.id === selectedTheme)?.frame.main || '#8B7355',
                    '--frame-dark': availableThemes.find(t => t.id === selectedTheme)?.frame.dark || '#5A4A36',
                  } as React.CSSProperties}
                >
                  {photosPreviews.length > 0 && (
                    <div className={`memorial-profile-frame frame-themed frame-pattern-${availableFrames.find(f => f.id === selectedFrame)?.style || 'none'}`}>
                      <div className="frame-outer">
                        <div className="frame-inner">
                          <img
                            src={photosPreviews[profilePhotoIndex]}
                            alt={deceasedName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h2 
                  className="text-3xl md:text-4xl font-serif text-center mb-2"
                  style={{ color: availableThemes.find(t => t.id === selectedTheme)?.colors.text }}
                >
                  {deceasedName || 'Name'}
                </h2>

                {/* Dates */}
                {(birthDate || deathDate) && (
                  <p 
                    className="text-center mb-4 flex items-center justify-center gap-2"
                    style={{ color: availableThemes.find(t => t.id === selectedTheme)?.colors.accent }}
                  >
                    {birthDate && new Date(birthDate).toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {birthDate && deathDate && ' — '}
                    {deathDate && new Date(deathDate).toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}

                {/* Species badge for pets */}
                {deceasedType === 'pet' && (species === 'Other' ? speciesOther.trim() : species) && (
                  <div className="flex justify-center mb-4">
                    <span 
                      className="px-4 py-1 rounded-full text-sm"
                      style={{ 
                        backgroundColor: availableThemes.find(t => t.id === selectedTheme)?.colors.accent,
                        color: availableThemes.find(t => t.id === selectedTheme)?.colors.bg
                      }}
                    >
                      Beloved {species === 'Other' ? speciesOther.trim() : species}
                    </span>
                  </div>
                )}

                {/* Memorial text preview */}
                {memorialText && (
                  <div 
                    className="mt-6 p-6 rounded-xl text-center italic"
                    style={{ 
                      backgroundColor: `${availableThemes.find(t => t.id === selectedTheme)?.colors.accent}10`,
                      color: availableThemes.find(t => t.id === selectedTheme)?.colors.text
                    }}
                  >
                    <p className="text-lg leading-relaxed">
                      &ldquo;{memorialText.length > 200 ? memorialText.substring(0, 200) + '...' : memorialText}&rdquo;
                    </p>
                  </div>
                )}

                {/* Photo count */}
                {photos.length > 1 && (
                  <p 
                    className="text-center mt-4 text-sm"
                    style={{ color: availableThemes.find(t => t.id === selectedTheme)?.colors.accent }}
                  >
                    + {photos.length - 1} more photo{photos.length > 2 ? 's' : ''} in gallery
                  </p>
                )}

                {/* Video count */}
                {videos.length > 0 && (
                  <p 
                    className="text-center mt-2 text-sm"
                    style={{ color: availableThemes.find(t => t.id === selectedTheme)?.colors.accent }}
                  >
                    🎬 {videos.length} video{videos.length > 1 ? 's' : ''} included
                  </p>
                )}
              </div>

              {/* Footer */}
              <div 
                className="px-8 py-4 text-center border-t"
                style={{ 
                  borderColor: `${availableThemes.find(t => t.id === selectedTheme)?.colors.accent}20`,
                  backgroundColor: `${availableThemes.find(t => t.id === selectedTheme)?.colors.accent}05`
                }}
              >
                <p 
                  className="text-sm"
                  style={{ color: availableThemes.find(t => t.id === selectedTheme)?.colors.accent }}
                >
                  {availableThemes.find(t => t.id === selectedTheme)?.name} Theme • {availableFrames.find(f => f.id === selectedFrame)?.name} Frame
                </p>
              </div>
            </div>

            {/* Summary checklist */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Memorial Summary</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{deceasedName}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">Photos:</span>
                  <span className="font-medium">{photos.length} uploaded</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">Videos:</span>
                  <span className="font-medium">{videos.length} added</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">Theme:</span>
                  <span className="font-medium">{availableThemes.find(t => t.id === selectedTheme)?.name}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">Frame:</span>
                  <span className="font-medium">{availableFrames.find(f => f.id === selectedFrame)?.name}</span>
                </li>
                <li className="flex items-center gap-2">
                  {memorialText ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="text-gray-600">Story:</span>
                  <span className="font-medium">{memorialText ? 'Written' : 'Not added (optional)'}</span>
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={() => goToStep(3)} className="btn-outline flex-1">
                Back to Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Publishing...
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
