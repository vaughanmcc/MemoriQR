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
  // Support multiple formats:
  // 1. Old format: 8 alphanumeric chars (e.g., ABCD1234)
  // 2. Retail format: MQR-XXB-XXXXXX (e.g., MQR-10B-ABC123) - 14 chars with hyphens
  // 3. Partner format: MQR-XX-XXXXXX (e.g., MQR-3P-RZG83K) - 13 chars with hyphens
  const cleanCode = code.replace(/-/g, '').toUpperCase()
  
  // Old 8-char format
  if (/^[A-Z0-9]{8}$/.test(cleanCode)) return true
  
  // Retail format: MQR + 2-3 digits + B/N/Q + 6 alphanumeric
  if (/^MQR\d{1,3}[BNQ][A-Z0-9]{6}$/.test(cleanCode)) return true
  
  // Partner format: MQR + 2 alphanumeric + 6 alphanumeric (total 11 after MQR)
  if (/^MQR[A-Z0-9]{2}[A-Z0-9]{6}$/.test(cleanCode)) return true
  
  return false
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

// Generate a simple opt-out token for partner notification emails
export function generateOptOutToken(partnerId: string): string {
  const secret = process.env.ADMIN_PASSWORD || 'memori-secret'
  // Simple hash - in production you'd use a proper HMAC
  const str = `${partnerId}-${secret}-optout`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}
