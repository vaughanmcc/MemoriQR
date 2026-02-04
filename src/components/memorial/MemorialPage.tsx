'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, Calendar, Eye, Share2, Sparkles, Star, Flower2, Leaf, Sun, Moon } from 'lucide-react'
import { Memorial } from '@/types/database'
import { MemorialPhoto, MemorialVideo } from '@/types'
import { formatDate, formatDateRange } from '@/lib/utils'
import { PhotoGallery } from './PhotoGallery'
import { VideoPlayer } from './VideoPlayer'
import { ShareButton } from './ShareButton'
import { ProfileFrame, getFrameShape, getFrameStyle } from './ProfileFrame'

// Theme definitions matching the upload form - includes frame colors for themed frames
const THEMES: Record<string, { bg: string; accent: string; text: string; secondary: string; frame: { light: string; main: string; dark: string } }> = {
  classic: { bg: '#FDF8F3', accent: '#8B7355', text: '#4A4A4A', secondary: '#A89880', frame: { light: '#A89880', main: '#8B7355', dark: '#5D4A38' } },
  garden: { bg: '#F5F9F5', accent: '#5A7F5A', text: '#3D3D3D', secondary: '#7A9F7A', frame: { light: '#7A9F7A', main: '#5A7F5A', dark: '#3A5F3A' } },
  ocean: { bg: '#F5F8FA', accent: '#4A7C8C', text: '#3D4852', secondary: '#6A9CAC', frame: { light: '#7AACBC', main: '#4A7C8C', dark: '#2A4C5C' } },
  sunset: { bg: '#FFF9F5', accent: '#C17F59', text: '#4A3F35', secondary: '#D19F79', frame: { light: '#D19F79', main: '#C17F59', dark: '#915F39' } },
  night: { bg: '#F8F7FA', accent: '#6B5B7A', text: '#3D3852', secondary: '#8B7B9A', frame: { light: '#8B7B9A', main: '#6B5B7A', dark: '#4B3B5A' } },
  rose: { bg: '#FDF8F9', accent: '#B5838D', text: '#4A4045', secondary: '#C5A3AD', frame: { light: '#C5A3AD', main: '#B5838D', dark: '#95636D' } },
  meadow: { bg: '#F7FAF5', accent: '#7A9E7A', text: '#3D4A3D', secondary: '#9ABE9A', frame: { light: '#9ABE9A', main: '#7A9E7A', dark: '#5A7E5A' } },
  autumn: { bg: '#FAF7F2', accent: '#A67C52', text: '#4A4035', secondary: '#C69C72', frame: { light: '#C69C72', main: '#A67C52', dark: '#865C32' } },
  lavender: { bg: '#F9F7FC', accent: '#8E7CC3', text: '#3D3852', secondary: '#AE9CD3', frame: { light: '#AE9CD3', main: '#8E7CC3', dark: '#6E5CA3' } },
  sky: { bg: '#F5FAFC', accent: '#5B9BD5', text: '#3D4852', secondary: '#7BBBE5', frame: { light: '#7BBBE5', main: '#5B9BD5', dark: '#3B7BB5' } },
  forest: { bg: '#F3F7F3', accent: '#4A6741', text: '#2D3A2D', secondary: '#6A8761', frame: { light: '#6A8761', main: '#4A6741', dark: '#2A4721' } },
  dawn: { bg: '#FBF8F5', accent: '#C9A87C', text: '#4A4540', secondary: '#D9C89C', frame: { light: '#D9C89C', main: '#C9A87C', dark: '#A9885C' } },
  winter: { bg: '#F7F9FA', accent: '#708090', text: '#3D4852', secondary: '#90A0B0', frame: { light: '#90A0B0', main: '#708090', dark: '#506070' } },
  cherry: { bg: '#FDF9FA', accent: '#D4A5A5', text: '#4A4045', secondary: '#E4C5C5', frame: { light: '#E4C5C5', main: '#D4A5A5', dark: '#B48585' } },
  earth: { bg: '#F8F5F2', accent: '#8B7355', text: '#3D3832', secondary: '#AB9375', frame: { light: '#AB9375', main: '#8B7355', dark: '#6B5335' } },
  moonlight: { bg: '#FAFAFA', accent: '#9CA3AF', text: '#374151', secondary: '#BCC3CF', frame: { light: '#BCC3CF', main: '#9CA3AF', dark: '#7C838F' } },
  spring: { bg: '#F9FCF5', accent: '#84A955', text: '#3D4A35', secondary: '#A4C975', frame: { light: '#A4C975', main: '#84A955', dark: '#648935' } },
  coastal: { bg: '#FAF9F7', accent: '#7BA3A8', text: '#4A5252', secondary: '#9BC3C8', frame: { light: '#9BC3C8', main: '#7BA3A8', dark: '#5B8388' } },
  vineyard: { bg: '#FAF7F8', accent: '#8E4162', text: '#4A3545', secondary: '#AE6182', frame: { light: '#AE6182', main: '#8E4162', dark: '#6E2142' } },
  sage: { bg: '#F7F9F7', accent: '#87A878', text: '#3D4A40', secondary: '#A7C898', frame: { light: '#A7C898', main: '#87A878', dark: '#678858' } },
  honey: { bg: '#FFFAF0', accent: '#D4A45A', text: '#4A4535', secondary: '#E4C47A', frame: { light: '#E4C47A', main: '#D4A45A', dark: '#B4843A' } },
  arctic: { bg: '#F8FCFC', accent: '#7EB8C9', text: '#3D5258', secondary: '#9ED8E9', frame: { light: '#9ED8E9', main: '#7EB8C9', dark: '#5E98A9' } },
  mauve: { bg: '#FAF8F9', accent: '#A38B9E', text: '#4A4248', secondary: '#C3ABBE', frame: { light: '#C3ABBE', main: '#A38B9E', dark: '#836B7E' } },
  sunrise: { bg: '#FFFBF5', accent: '#E07B4C', text: '#4A4035', secondary: '#F09B6C', frame: { light: '#F09B6C', main: '#E07B4C', dark: '#C05B2C' } },
  eternal: { bg: '#F8F8F8', accent: '#B8860B', text: '#1A1A1A', secondary: '#D8A62B', frame: { light: '#D8A62B', main: '#B8860B', dark: '#986600' } },
}

// Frame definitions for photo borders - memorial-themed with elegant styling
const FRAMES: Record<string, { border: string; shadow: string; gradient?: string }> = {
  'none': { border: 'none', shadow: 'shadow-lg', gradient: '' },
  'classic-gold': { border: '4px solid #D4AF37', shadow: 'shadow-xl', gradient: 'linear-gradient(145deg, #D4AF37, #FFF8DC, #D4AF37)' },
  'silver': { border: '4px solid #C0C0C0', shadow: 'shadow-xl', gradient: 'linear-gradient(145deg, #C0C0C0, #F5F5F5, #C0C0C0)' },
  'bronze': { border: '5px solid #CD7F32', shadow: 'shadow-xl', gradient: 'linear-gradient(145deg, #CD7F32, #DEB887, #8B4513)' },
  'ornate-gold': { border: '8px double #D4AF37', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #D4AF37, #FFD700, #B8860B)' },
  'vintage-sepia': { border: '6px solid #8B7355', shadow: 'shadow-xl', gradient: 'linear-gradient(145deg, #8B7355, #D2B48C, #8B7355)' },
  'rose-memorial': { border: '5px solid #B76E79', shadow: 'shadow-xl', gradient: 'linear-gradient(145deg, #B76E79, #FFB6C1, #B76E79)' },
  'pearl-white': { border: '5px solid #FAF0E6', shadow: 'shadow-xl', gradient: 'linear-gradient(145deg, #FAF0E6, #FFFAF0, #FAF0E6)' },
  'walnut-wood': { border: '7px solid #5D432C', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #5D432C, #8B7355, #3D2314)' },
  'mahogany': { border: '7px solid #420D09', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #420D09, #6B3A3A, #2D0606)' },
  'ebony-noir': { border: '5px solid #1A1A1A', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #1A1A1A, #3D3D3D, #0D0D0D)' },
  'ivory-lace': { border: '6px solid #FFFFF0', shadow: 'shadow-lg', gradient: 'linear-gradient(145deg, #FFFFF0, #FFF8DC, #FFFFF0)' },
  'copper-aged': { border: '5px solid #B87333', shadow: 'shadow-xl', gradient: 'linear-gradient(145deg, #B87333, #CD9575, #8B4513)' },
  'antique-brass': { border: '5px solid #CD9575', shadow: 'shadow-xl', gradient: 'linear-gradient(145deg, #CD9575, #DEB887, #8B7355)' },
  'platinum': { border: '4px solid #E5E4E2', shadow: 'shadow-xl', gradient: 'linear-gradient(145deg, #E5E4E2, #FAFAFA, #D3D3D3)' },
  'cherry-wood': { border: '6px solid #7B3F00', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #7B3F00, #A0522D, #5D2906)' },
  'art-deco': { border: '6px ridge #D4AF37', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #D4AF37, #1A1A1A, #D4AF37)' },
  'baroque': { border: '8px groove #8B7355', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #8B7355, #D4AF37, #5D432C)' },
  'modern-slate': { border: '3px solid #708090', shadow: 'shadow-lg', gradient: 'linear-gradient(145deg, #708090, #A9A9A9, #708090)' },
  'rustic-oak': { border: '7px solid #6B4226', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #6B4226, #8B7355, #3D2314)' },
  'minimalist': { border: '2px solid #888888', shadow: 'shadow-md', gradient: '' },
  'memorial-bronze': { border: '8px solid #614E1A', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #614E1A, #8B7355, #3D3010)' },
  'eternal-gold': { border: '8px double #FFD700', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #FFD700, #FFF8DC, #DAA520)' },
  'celtic-knot': { border: '6px solid #2E8B57', shadow: 'shadow-xl', gradient: 'linear-gradient(145deg, #2E8B57, #3CB371, #006400)' },
  'angel-wings': { border: '6px solid #F5F5F5', shadow: 'shadow-xl', gradient: 'linear-gradient(145deg, #F5F5F5, #FFFFFF, #E8E8E8)' },
  // Legacy frame IDs for backward compatibility
  'wood': { border: '6px solid #8B4513', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #8B4513, #A0522D, #5D2906)' },
  'ornate-silver': { border: '8px double #A8A8A8', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #A8A8A8, #D3D3D3, #808080)' },
  'vintage': { border: '6px solid #8B7355', shadow: 'shadow-xl', gradient: 'linear-gradient(145deg, #8B7355, #D2B48C, #8B7355)' },
  'rose-gold': { border: '4px solid #B76E79', shadow: 'shadow-xl', gradient: 'linear-gradient(145deg, #B76E79, #FFB6C1, #B76E79)' },
  'pearl': { border: '5px solid #F5F5F5', shadow: 'shadow-xl', gradient: 'linear-gradient(145deg, #FAF0E6, #FFFAF0, #FAF0E6)' },
  'walnut': { border: '6px solid #5D432C', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #5D432C, #8B7355, #3D2314)' },
  'ebony': { border: '5px solid #1A1A1A', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #1A1A1A, #3D3D3D, #0D0D0D)' },
  'ivory': { border: '5px solid #FFFFF0', shadow: 'shadow-lg', gradient: 'linear-gradient(145deg, #FFFFF0, #FFF8DC, #FFFFF0)' },
  'copper': { border: '4px solid #B87333', shadow: 'shadow-xl', gradient: 'linear-gradient(145deg, #B87333, #CD9575, #8B4513)' },
  'cherry': { border: '6px solid #7B3F00', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #7B3F00, #A0522D, #5D2906)' },
  'deco-gold': { border: '6px ridge #D4AF37', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #D4AF37, #1A1A1A, #D4AF37)' },
  'modern-black': { border: '3px solid #2D2D2D', shadow: 'shadow-lg', gradient: 'linear-gradient(145deg, #2D2D2D, #4A4A4A, #1A1A1A)' },
  'rustic': { border: '7px solid #6B4226', shadow: 'shadow-2xl', gradient: 'linear-gradient(145deg, #6B4226, #8B7355, #3D2314)' },
}

// Helper function to get the ornamental frame style class for memorial display
function getOrnamentalFrameStyle(memorial: Memorial): string {
  const frameId = memorial.frame || 'classic-ornate'
  
  // Map frame IDs to CSS class suffixes
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
    // Legacy mappings for old frame IDs (backwards compatibility)
    'baroque-gold': 'baroque',
    'vintage-wood': 'rustic',
    'elegant-silver': 'ornate',
    'memorial-bronze': 'ornate',
    'rustic-farmhouse': 'rustic',
    'imperial-gold': 'baroque',
    'infinity-love': 'ornate',
    'classic-gold': 'ornate',
    'silver': 'ornate',
    'bronze': 'ornate',
    'ornate-gold': 'baroque',
    'vintage-sepia': 'rustic',
    'rose-memorial': 'rose',
  }
  
  return styleMap[frameId] || 'ornate'
}

interface MemorialPageProps {
  memorial: Memorial
  isInGracePeriod?: boolean
  gracePeriodDaysRemaining?: number
  isEditable?: boolean
}

export function MemorialPage({ 
  memorial, 
  isInGracePeriod = false,
  gracePeriodDaysRemaining,
  isEditable = true
}: MemorialPageProps) {
  const photos = (memorial.photos_json as unknown as MemorialPhoto[]) || []
  const videos = (memorial.videos_json as unknown as MemorialVideo[]) || []
  const dateRange = formatDateRange(memorial.birth_date, memorial.death_date)
  const theme = THEMES[memorial.theme || 'classic'] || THEMES.classic
  const frame = FRAMES[memorial.frame || 'classic-gold'] || FRAMES['classic-gold']
  const isPet = memorial.deceased_type === 'pet'
  
  // Find the profile photo (marked as isProfile) or default to first photo
  const profilePhoto = photos.find(p => p.isProfile) || photos[0]

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Grace Period Banner */}
      {isInGracePeriod && (
        <div className="bg-amber-50 border-b border-amber-200 py-2 px-4 text-center text-sm">
          <span className="text-amber-800">
            ⚠️ Hosting has expired. 
            {gracePeriodDaysRemaining !== undefined && gracePeriodDaysRemaining > 0 && (
              <> Memorial will go offline in {gracePeriodDaysRemaining} days. </>
            )}
            <a 
              href={`/renew?slug=${memorial.memorial_slug}`}
              className="font-medium underline hover:no-underline ml-1"
            >
              Renew now
            </a>
          </span>
        </div>
      )}

      {/* Decorative top border */}
      <div 
        className="h-2 w-full"
        style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary}, ${theme.accent})` }}
      />

      {/* Header */}
      <header 
        className="backdrop-blur-sm border-b sticky top-0 z-40 no-print"
        style={{ 
          backgroundColor: `${theme.bg}CC`,
          borderColor: `${theme.accent}20`
        }}
      >
        <div className="container-narrow py-4 flex items-center justify-between">
          <a 
            href="/" 
            className="flex items-center gap-2 transition-colors"
            style={{ color: theme.secondary }}
          >
            <Heart className="h-5 w-5" style={{ color: theme.accent }} />
            <span className="text-sm font-medium">MemoriQR</span>
          </a>
          <ShareButton slug={memorial.memorial_slug} name={memorial.deceased_name} />
        </div>
      </header>

      {/* Main content */}
      <main className="container-narrow py-12 md:py-20 memorial-page">
        {/* Decorative flourish */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <Flower2 className="h-5 w-5" style={{ color: theme.secondary }} />
            <div className="w-16 h-px" style={{ backgroundColor: theme.accent }} />
            <Star className="h-4 w-4" style={{ color: theme.accent }} />
            <div className="w-16 h-px" style={{ backgroundColor: theme.accent }} />
            <Flower2 className="h-5 w-5" style={{ color: theme.secondary }} />
          </div>
        </div>

        {/* Hero section with framed photo */}
        <div className="text-center mb-12">
          {/* Main profile photo with ornamental frame - themed colors */}
          {profilePhoto && (
            <div className="flex justify-center mb-6">
              <ProfileFrame
                imageUrl={profilePhoto.url}
                alt={memorial.deceased_name}
                shape={getFrameShape(memorial.frame || 'oval-classic')}
                frameColor={theme.frame}
                frameStyle={getFrameStyle(memorial.frame || 'oval-classic')}
              />
            </div>
          )}

          {/* Name with decorative elements */}
          <div className="relative inline-block">
            <h1 
              className="text-4xl md:text-5xl font-serif mb-2"
              style={{ color: theme.text }}
            >
              {memorial.deceased_name}
            </h1>
            <div 
              className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-30 hidden md:block"
              style={{ color: theme.accent }}
            >
              ❧
            </div>
            <div 
              className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-30 hidden md:block"
              style={{ color: theme.accent, transform: 'translateY(-50%) scaleX(-1)' }}
            >
              ❧
            </div>
          </div>
          
          {dateRange && (
            <p 
              className="text-xl mb-4 flex items-center justify-center gap-2"
              style={{ color: theme.secondary }}
            >
              <Calendar className="h-5 w-5" style={{ color: theme.accent }} />
              {dateRange}
            </p>
          )}

          {memorial.species && isPet && (
            <div 
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-lg font-medium"
              style={{ 
                backgroundColor: `${theme.accent}15`,
                color: theme.accent,
                border: `1px solid ${theme.accent}30`
              }}
            >
              <Heart className="h-5 w-5" />
              <span>Beloved {memorial.species}</span>
              <Sparkles className="h-4 w-4" style={{ color: theme.secondary }} />
            </div>
          )}
        </div>

        {/* Memorial text with elegant styling */}
        {memorial.memorial_text && (
          <div 
            className="relative rounded-2xl mb-12 overflow-hidden"
            style={{ 
              backgroundColor: 'white',
              boxShadow: `0 10px 40px ${theme.accent}15`,
              border: `1px solid ${theme.accent}20`
            }}
          >
            {/* Decorative header bar */}
            <div 
              className="h-1 w-full"
              style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
            />
            
            <div className="p-8 md:p-12">
              {/* Decorative corner elements */}
              <div 
                className="absolute top-4 left-4 text-3xl opacity-20"
                style={{ color: theme.accent }}
              >
                ❦
              </div>
              <div 
                className="absolute top-4 right-4 text-3xl opacity-20"
                style={{ color: theme.accent, transform: 'scaleX(-1)' }}
              >
                ❦
              </div>
              
              {/* Quote decoration */}
              <div 
                className="text-7xl font-serif leading-none mb-4 opacity-15 text-center"
                style={{ color: theme.accent }}
              >
                "
              </div>
              
              <div 
                className="memorial-text prose prose-lg max-w-none relative text-center"
                style={{ color: theme.text }}
              >
                {memorial.memorial_text.split('\n').map((paragraph, i) => (
                  paragraph.trim() && (
                    <p 
                      key={i} 
                      className="mb-4 last:mb-0 text-lg leading-relaxed italic"
                      style={{ color: theme.text }}
                    >
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
              
              <div 
                className="text-7xl font-serif leading-none mt-4 text-center opacity-15"
                style={{ color: theme.accent }}
              >
                "
              </div>

              {/* Bottom decoration */}
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-px" style={{ backgroundColor: theme.accent }} />
                  <Heart className="h-4 w-4" style={{ color: theme.accent }} />
                  <div className="w-12 h-px" style={{ backgroundColor: theme.accent }} />
                </div>
              </div>
            </div>

            {/* Decorative footer bar */}
            <div 
              className="h-1 w-full"
              style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
            />
          </div>
        )}

        {/* Photo gallery with framed photos */}
        {photos.length > 1 && (
          <div className="mb-12">
            <h2 
              className="text-2xl font-serif mb-6 text-center flex items-center justify-center gap-3"
              style={{ color: theme.text }}
            >
              <Flower2 className="h-5 w-5" style={{ color: theme.secondary }} />
              <span 
                className="w-12 h-px"
                style={{ backgroundColor: theme.accent }}
              />
              Photo Gallery
              <span 
                className="w-12 h-px"
                style={{ backgroundColor: theme.accent }}
              />
              <Flower2 className="h-5 w-5" style={{ color: theme.secondary }} />
            </h2>
            <PhotoGallery photos={photos} frame={frame} theme={theme} />
          </div>
        )}

        {/* Videos section */}
        {videos.length > 0 && (
          <div className="mb-12">
            <h2 
              className="text-2xl font-serif mb-6 text-center flex items-center justify-center gap-3"
              style={{ color: theme.text }}
            >
              <Sun className="h-5 w-5" style={{ color: theme.secondary }} />
              <span 
                className="w-12 h-px"
                style={{ backgroundColor: theme.accent }}
              />
              Videos
              <span 
                className="w-12 h-px"
                style={{ backgroundColor: theme.accent }}
              />
              <Moon className="h-5 w-5" style={{ color: theme.secondary }} />
            </h2>
            <div className="space-y-6">
              {videos.map((video) => (
                <VideoPlayer key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}

        {/* Footer with elegant styling */}
        <div 
          className="text-center text-sm pt-8 border-t"
          style={{ 
            color: theme.secondary,
            borderColor: `${theme.accent}20`
          }}
        >
          {/* Decorative element */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <span style={{ color: theme.accent }}>✦</span>
              <Leaf className="h-4 w-4" style={{ color: theme.secondary }} />
              <span style={{ color: theme.accent }}>✦</span>
            </div>
          </div>
          <p className="flex items-center justify-center gap-2 mb-2">
            <Eye className="h-4 w-4" />
            <span>Viewed {memorial.views_count?.toLocaleString() || 0} times</span>
          </p>
          <p className="mb-4">
            Created with{' '}
            <a 
              href="/" 
              className="hover:underline font-medium"
              style={{ color: theme.accent }}
            >
              MemoriQR
            </a>
          </p>
          {/* Bottom flourish */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-lg" style={{ color: theme.accent, opacity: 0.3 }}>
              ❧ Forever in our hearts ❧
            </div>
          </div>
        </div>
      </main>

      {/* Decorative bottom border */}
      <div 
        className="h-2 w-full"
        style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary}, ${theme.accent})` }}
      />
    </div>
  )
}
