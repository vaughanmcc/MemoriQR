import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMMM d, yyyy')
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatDateRange(birthDate?: string | null, deathDate?: string | null): string {
  if (!birthDate && !deathDate) return ''
  if (birthDate && deathDate) {
    return `${format(new Date(birthDate), 'yyyy')} - ${format(new Date(deathDate), 'yyyy')}`
  }
  if (deathDate) return `? - ${format(new Date(deathDate), 'yyyy')}`
  return format(new Date(birthDate!), 'yyyy')
}

export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
  
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 6)
  
  return `${base}-${year}-${random}`
}

export function validateActivationCode(code: string): boolean {
  // Support both old format (8 chars) and new format (MQR-XXB-XXXXXX = 12 chars without hyphens)
  const cleanCode = code.replace(/-/g, '')
  return /^[A-Z0-9]{8}$/i.test(cleanCode) || /^MQR\d{1,2}[BNQ][A-Z0-9]{6}$/i.test(cleanCode)
}


export function sanitizeText(text: string): string {
  return text
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length).trim() + '...'
}

export function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^[a-zA-Z0-9_-]{11}$/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1] || url
  }
  
  return null
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}
