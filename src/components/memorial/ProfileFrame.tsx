'use client'

import Image from 'next/image'

interface ProfileFrameProps {
  imageUrl: string
  alt: string
  shape: 'square' | 'oval' | 'rounded' | 'none'
  frameColor: {
    light: string
    main: string
    dark: string
  }
  frameStyle?: string // The decorative style: ornate, baroque, floral, celtic, etc.
}

// Decorative corner/edge elements for different frame styles
const FRAME_DECORATIONS: Record<string, { corners?: string; edges?: string; symbol?: string }> = {
  'none': {},
  'ornate': { corners: '❧', symbol: '❧' },
  'baroque': { corners: '❦', edges: '〰', symbol: '❦' },
  'nouveau': { corners: '🌿', symbol: '✿' },
  'rose': { corners: '🌹', symbol: '❀' },
  'celtic': { corners: '☘', symbol: '✦' },
  'deco': { corners: '◆', edges: '═', symbol: '◇' },
  'renaissance': { corners: '⚜', symbol: '☆' },
  'rustic': { corners: '⌘', symbol: '✧' },
  'french': { corners: '⚜', symbol: '❧' },
  'gothic': { corners: '✟', symbol: '✞' },
  'angel': { corners: '👼', symbol: '✦' },
  'flame': { corners: '🕯', symbol: '✧' },
  'garden': { corners: '🌺', symbol: '❀' },
  'dove': { corners: '🕊', symbol: '✧' },
  'stars': { corners: '⭐', symbol: '✦' },
  'ocean': { corners: '🌊', symbol: '〰' },
  'mountain': { corners: '🏔', symbol: '△' },
  'ivy': { corners: '🍃', symbol: '❧' },
  'butterfly': { corners: '🦋', symbol: '✿' },
  // Oval styles
  'oval-classic': { symbol: '❧' },
  'oval-ornate': { symbol: '❦' },
  'oval-victorian': { symbol: '🎀' },
  'oval-cameo': { symbol: '✦' },
  'oval-floral': { symbol: '🌸' },
  'oval-memorial': { symbol: '✦' },
}

export function ProfileFrame({ imageUrl, alt, shape, frameColor, frameStyle = 'ornate' }: ProfileFrameProps) {
  const isOval = shape === 'oval'
  const isNone = shape === 'none'
  
  // Get decorations for this frame style
  const decorations = FRAME_DECORATIONS[frameStyle] || FRAME_DECORATIONS['ornate'] || {}
  const cornerSymbol = decorations.corners || '❧'
  const topBottomSymbol = decorations.symbol || '✦'
  
  // For oval: use clip-path ellipse for perfect shape
  if (isOval) {
    return (
      <div className="relative">
        {/* Decorative elements around the oval */}
        <div 
          className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl z-10"
          style={{ 
            color: frameColor.main,
            textShadow: `0 2px 4px ${frameColor.dark}66`,
          }}
        >
          {topBottomSymbol}
        </div>
        <div 
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-2xl z-10"
          style={{ 
            color: frameColor.main,
            textShadow: `0 2px 4px ${frameColor.dark}66`,
          }}
        >
          {topBottomSymbol}
        </div>
        <div 
          className="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-90 text-xl z-10"
          style={{ 
            color: frameColor.main,
            textShadow: `0 2px 4px ${frameColor.dark}66`,
          }}
        >
          {topBottomSymbol}
        </div>
        <div 
          className="absolute -right-4 top-1/2 -translate-y-1/2 rotate-90 text-xl z-10"
          style={{ 
            color: frameColor.main,
            textShadow: `0 2px 4px ${frameColor.dark}66`,
          }}
        >
          {topBottomSymbol}
        </div>
        
        {/* Responsive oval frame - larger on mobile */}
        <div 
          className="relative w-[280px] h-[373px] sm:w-[300px] sm:h-[400px] md:w-[320px] md:h-[427px]"
          style={{
            background: `linear-gradient(135deg, ${frameColor.dark} 0%, ${frameColor.main} 25%, ${frameColor.light} 50%, ${frameColor.main} 75%, ${frameColor.dark} 100%)`,
            clipPath: 'ellipse(50% 50% at 50% 50%)',
            boxShadow: `0 8px 32px ${frameColor.dark}66`,
          }}
        >
          {/* Inner image with smaller ellipse */}
          <div
            className="absolute top-3 left-3 right-3 bottom-3 sm:top-4 sm:left-4 sm:right-4 sm:bottom-4"
            style={{
              clipPath: 'ellipse(50% 50% at 50% 50%)',
              overflow: 'hidden',
            }}
          >
            <Image
              src={imageUrl}
              alt={alt}
              fill
              style={{ 
                objectFit: 'cover',
                objectPosition: 'center center',
              }}
              priority
              sizes="(max-width: 640px) 280px, (max-width: 768px) 300px, 320px"
            />
          </div>
        </div>
      </div>
    )
  }

  // Non-oval shapes - responsive sizes
  const isNoneFrame = isNone

  const getBorderRadius = () => {
    switch (shape) {
      case 'rounded': return '24px'
      case 'square': return '8px'
      default: return '12px'
    }
  }

  const borderRadius = getBorderRadius()

  return (
    <div 
      className="relative w-[260px] h-[260px] sm:w-[280px] sm:h-[280px] md:w-[300px] md:h-[300px] flex items-center justify-center"
      style={{
        borderRadius,
        background: isNoneFrame ? 'transparent' : `linear-gradient(135deg, ${frameColor.dark} 0%, ${frameColor.main} 25%, ${frameColor.light} 50%, ${frameColor.main} 75%, ${frameColor.dark} 100%)`,
        boxShadow: isNoneFrame ? 'none' : `0 8px 32px ${frameColor.dark}66, inset 0 3px 6px ${frameColor.light}aa, inset 0 -3px 6px ${frameColor.dark}66`,
      }}
    >
      {/* Decorative corner elements for non-none frames */}
      {!isNoneFrame && (
        <>
          {/* Top-left corner */}
          <div 
            className="absolute -top-1 -left-1 text-xl z-10"
            style={{
              color: frameColor.light,
              textShadow: `1px 1px 2px ${frameColor.dark}`,
            }}
          >
            {cornerSymbol}
          </div>
          {/* Top-right corner */}
          <div 
            className="absolute -top-1 -right-1 text-xl z-10 -scale-x-100"
            style={{
              color: frameColor.light,
              textShadow: `1px 1px 2px ${frameColor.dark}`,
            }}
          >
            {cornerSymbol}
          </div>
          {/* Bottom-left corner */}
          <div 
            className="absolute -bottom-1 -left-1 text-xl z-10 -scale-y-100"
            style={{
              color: frameColor.light,
              textShadow: `1px 1px 2px ${frameColor.dark}`,
            }}
          >
            {cornerSymbol}
          </div>
          {/* Bottom-right corner */}
          <div 
            className="absolute -bottom-1 -right-1 text-xl z-10 scale-[-1]"
            style={{
              color: frameColor.light,
              textShadow: `1px 1px 2px ${frameColor.dark}`,
            }}
          >
            {cornerSymbol}
          </div>
          {/* Top center decoration */}
          <div 
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-base z-10"
            style={{
              color: frameColor.main,
              textShadow: `0 1px 2px ${frameColor.dark}`,
            }}
          >
            {topBottomSymbol}
          </div>
          {/* Bottom center decoration */}
          <div 
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-base z-10"
            style={{
              color: frameColor.main,
              textShadow: `0 1px 2px ${frameColor.dark}`,
            }}
          >
            {topBottomSymbol}
          </div>
        </>
      )}
      
      {/* Inner image container - responsive padding */}
      <div 
        className="absolute inset-3 sm:inset-3.5 md:inset-4 overflow-hidden"
        style={{
          borderRadius,
          boxShadow: isNoneFrame ? '0 4px 20px rgba(0, 0, 0, 0.15)' : 'inset 0 0 25px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Image
          src={imageUrl}
          alt={alt}
          fill
          style={{ 
            objectFit: 'cover',
            objectPosition: 'center center',
          }}
          priority
          sizes="(max-width: 640px) 260px, (max-width: 768px) 280px, 300px"
        />
      </div>
    </div>
  )
}

// Helper to extract shape from frame ID
export function getFrameShape(frameId: string): 'square' | 'oval' | 'rounded' | 'none' {
  if (frameId === 'none') return 'none'
  if (frameId.includes('oval')) return 'oval'
  if (frameId.includes('rounded') || frameId.includes('nouveau')) return 'rounded'
  return 'square'
}

// Helper to extract style from frame ID
export function getFrameStyle(frameId: string): string {
  // Map frame IDs to their style names
  const styleMap: Record<string, string> = {
    'none': 'none',
    'classic-ornate': 'ornate',
    'baroque': 'baroque',
    'oval-classic': 'oval-classic',
    'oval-ornate': 'oval-ornate',
    'art-nouveau': 'nouveau',
    'victorian-rose': 'rose',
    'celtic-heritage': 'celtic',
    'art-deco': 'deco',
    'oval-victorian': 'oval-victorian',
    'renaissance': 'renaissance',
    'rustic-carved': 'rustic',
    'french-provincial': 'french',
    'gothic-arch': 'gothic',
    'oval-cameo': 'oval-cameo',
    'angel-wings': 'angel',
    'eternal-flame': 'flame',
    'garden-trellis': 'garden',
    'dove-peace': 'dove',
    'starlight': 'stars',
    'oval-floral': 'oval-floral',
    'ocean-wave': 'ocean',
    'mountain-sunrise': 'mountain',
    'ivy-cascade': 'ivy',
    'butterfly-garden': 'butterfly',
    'oval-memorial': 'oval-memorial',
  }
  return styleMap[frameId] || 'ornate'
}
