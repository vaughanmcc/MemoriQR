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
      <div style={{ position: 'relative' }}>
        {/* Decorative elements around the oval */}
        <div style={{ 
          position: 'absolute', 
          top: -20, 
          left: '50%', 
          transform: 'translateX(-50%)',
          fontSize: '24px',
          color: frameColor.main,
          textShadow: `0 2px 4px ${frameColor.dark}66`,
          zIndex: 10,
        }}>
          {topBottomSymbol}
        </div>
        <div style={{ 
          position: 'absolute', 
          bottom: -20, 
          left: '50%', 
          transform: 'translateX(-50%)',
          fontSize: '24px',
          color: frameColor.main,
          textShadow: `0 2px 4px ${frameColor.dark}66`,
          zIndex: 10,
        }}>
          {topBottomSymbol}
        </div>
        <div style={{ 
          position: 'absolute', 
          left: -15, 
          top: '50%', 
          transform: 'translateY(-50%) rotate(-90deg)',
          fontSize: '20px',
          color: frameColor.main,
          textShadow: `0 2px 4px ${frameColor.dark}66`,
          zIndex: 10,
        }}>
          {topBottomSymbol}
        </div>
        <div style={{ 
          position: 'absolute', 
          right: -15, 
          top: '50%', 
          transform: 'translateY(-50%) rotate(90deg)',
          fontSize: '20px',
          color: frameColor.main,
          textShadow: `0 2px 4px ${frameColor.dark}66`,
          zIndex: 10,
        }}>
          {topBottomSymbol}
        </div>
        
        <div 
          style={{
            position: 'relative',
            width: 260,
            height: 347,
            background: `linear-gradient(135deg, ${frameColor.dark} 0%, ${frameColor.main} 25%, ${frameColor.light} 50%, ${frameColor.main} 75%, ${frameColor.dark} 100%)`,
            clipPath: 'ellipse(50% 50% at 50% 50%)',
            boxShadow: `0 8px 32px ${frameColor.dark}66`,
          }}
        >
          {/* Inner image with smaller ellipse */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              right: 14,
              bottom: 14,
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
              sizes="260px"
            />
          </div>
        </div>
      </div>
    )
  }

  // Non-oval shapes
  const outerWidth = 240
  const outerHeight = 240
  const padding = isNone ? 0 : 14
  const innerWidth = outerWidth - (padding * 2)
  const innerHeight = outerHeight - (padding * 2)

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
      style={{
        position: 'relative',
        width: outerWidth,
        height: outerHeight,
        borderRadius,
        background: isNone ? 'transparent' : `linear-gradient(135deg, ${frameColor.dark} 0%, ${frameColor.main} 25%, ${frameColor.light} 50%, ${frameColor.main} 75%, ${frameColor.dark} 100%)`,
        padding: padding,
        boxShadow: isNone ? 'none' : `0 8px 32px ${frameColor.dark}66, inset 0 3px 6px ${frameColor.light}aa, inset 0 -3px 6px ${frameColor.dark}66`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Decorative corner elements for non-none frames */}
      {!isNone && (
        <>
          {/* Top-left corner */}
          <div style={{
            position: 'absolute',
            top: -4,
            left: -4,
            fontSize: '20px',
            color: frameColor.light,
            textShadow: `1px 1px 2px ${frameColor.dark}`,
            zIndex: 10,
          }}>
            {cornerSymbol}
          </div>
          {/* Top-right corner */}
          <div style={{
            position: 'absolute',
            top: -4,
            right: -4,
            fontSize: '20px',
            color: frameColor.light,
            textShadow: `1px 1px 2px ${frameColor.dark}`,
            transform: 'scaleX(-1)',
            zIndex: 10,
          }}>
            {cornerSymbol}
          </div>
          {/* Bottom-left corner */}
          <div style={{
            position: 'absolute',
            bottom: -4,
            left: -4,
            fontSize: '20px',
            color: frameColor.light,
            textShadow: `1px 1px 2px ${frameColor.dark}`,
            transform: 'scaleY(-1)',
            zIndex: 10,
          }}>
            {cornerSymbol}
          </div>
          {/* Bottom-right corner */}
          <div style={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            fontSize: '20px',
            color: frameColor.light,
            textShadow: `1px 1px 2px ${frameColor.dark}`,
            transform: 'scale(-1, -1)',
            zIndex: 10,
          }}>
            {cornerSymbol}
          </div>
          {/* Top center decoration */}
          <div style={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '16px',
            color: frameColor.main,
            textShadow: `0 1px 2px ${frameColor.dark}`,
            zIndex: 10,
          }}>
            {topBottomSymbol}
          </div>
          {/* Bottom center decoration */}
          <div style={{
            position: 'absolute',
            bottom: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '16px',
            color: frameColor.main,
            textShadow: `0 1px 2px ${frameColor.dark}`,
            zIndex: 10,
          }}>
            {topBottomSymbol}
          </div>
        </>
      )}
      
      <div 
        style={{
          position: 'relative',
          width: innerWidth,
          height: innerHeight,
          borderRadius,
          overflow: 'hidden',
          boxShadow: isNone ? '0 4px 20px rgba(0, 0, 0, 0.15)' : 'inset 0 0 25px rgba(0, 0, 0, 0.3)',
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
          sizes="240px"
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
