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
  // Shape-specific container and image styles
  const shapeStyles = {
    none: {
      container: 'rounded-lg',
      wrapper: 'rounded-lg',
      image: 'rounded-lg',
    },
    square: {
      container: 'rounded-lg',
      wrapper: 'rounded-md',
      image: 'rounded-md',
    },
    rounded: {
      container: 'rounded-3xl',
      wrapper: 'rounded-2xl',
      image: 'rounded-2xl',
    },
    oval: {
      container: 'rounded-[50%]',
      wrapper: 'rounded-[50%]',
      image: 'rounded-[50%]',
    },
  }

  const styles = shapeStyles[shape]
  const isOval = shape === 'oval'
  const isNone = shape === 'none'

  // Container sizing based on shape
  const containerSize = isOval 
    ? 'w-[220px] h-[293px] md:w-[280px] md:h-[373px]' 
    : 'w-[220px] h-[220px] md:w-[280px] md:h-[280px]'

  return (
    <div 
      className={`relative inline-block ${containerSize}`}
      style={!isNone ? {
        background: `linear-gradient(135deg, ${frameColor.dark} 0%, ${frameColor.main} 25%, ${frameColor.light} 50%, ${frameColor.main} 75%, ${frameColor.dark} 100%)`,
        padding: '12px',
        boxShadow: `0 8px 32px ${frameColor.dark}66, inset 0 3px 6px ${frameColor.light}aa, inset 0 -3px 6px ${frameColor.dark}66`,
      } : undefined}
    >
      <div 
        className={`relative w-full h-full overflow-hidden ${styles.wrapper}`}
        style={!isNone ? {
          boxShadow: 'inset 0 0 25px rgba(0, 0, 0, 0.3)',
        } : {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className={`object-cover ${styles.image}`}
          style={{ objectPosition: 'center center' }}
          priority
          sizes="(max-width: 768px) 220px, 280px"
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
