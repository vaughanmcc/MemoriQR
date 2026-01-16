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
}

export function ProfileFrame({ imageUrl, alt, shape, frameColor }: ProfileFrameProps) {
  const isOval = shape === 'oval'
  const isNone = shape === 'none'
  
  // For oval: use clip-path ellipse for perfect shape
  if (isOval) {
    return (
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
