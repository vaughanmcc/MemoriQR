import type { HostingDuration } from '@/types/database'

// Memorial themes - available based on plan
// Each theme includes frame colors: light (highlight), main (primary frame color), dark (shadow/depth)
export const MEMORIAL_THEMES = [
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
export const getAvailableThemes = (duration: HostingDuration) => {
  const themeCount = duration === 5 ? 5 : duration === 10 ? 10 : 25
  return MEMORIAL_THEMES.slice(0, themeCount)
}

// Ornamental Frame Styles - decorative picture frames
// Patterns only - colors come from the selected theme
export const MEMORIAL_FRAMES = [
  { id: 'none', name: 'No Frame', description: 'Clean, minimal presentation', style: 'none', shape: 'square', preview: '⬜' },
  { id: 'classic-ornate', name: 'Classic Ornate', description: 'Victorian-style decorative corners', style: 'ornate', shape: 'square', preview: '🖼️' },
  { id: 'baroque', name: 'Baroque', description: 'Elaborate scrollwork pattern', style: 'baroque', shape: 'square', preview: '👑' },
  { id: 'oval-classic', name: 'Oval Classic', description: 'Traditional oval portrait frame', style: 'oval-classic', shape: 'oval', preview: '🪞' },
  { id: 'oval-ornate', name: 'Oval Ornate', description: 'Ornate oval with filigree', style: 'oval-ornate', shape: 'oval', preview: '🥚' },
  { id: 'art-nouveau', name: 'Art Nouveau', description: 'Flowing organic curves', style: 'nouveau', shape: 'square', preview: '🌿' },
  { id: 'victorian-rose', name: 'Victorian Rose', description: 'Floral rose accents', style: 'rose', shape: 'square', preview: '🌹' },
  { id: 'celtic-heritage', name: 'Celtic Heritage', description: 'Interwoven Celtic knotwork', style: 'celtic', shape: 'square', preview: '☘️' },
  { id: 'art-deco', name: 'Art Deco', description: 'Geometric 1920s glamour', style: 'deco', shape: 'square', preview: '💎' },
  { id: 'oval-victorian', name: 'Oval Victorian', description: 'Victorian oval with flourishes', style: 'oval-victorian', shape: 'oval', preview: '🎀' },
  // Additional frames for 10+ year plans
  { id: 'renaissance', name: 'Renaissance', description: 'Italian Renaissance grandeur', style: 'renaissance', shape: 'square', preview: '🎭' },
  { id: 'rustic-carved', name: 'Rustic Carved', description: 'Weathered carved wood pattern', style: 'rustic', shape: 'square', preview: '🪵' },
  { id: 'french-provincial', name: 'French Provincial', description: 'Elegant French countryside', style: 'french', shape: 'square', preview: '⚜️' },
  { id: 'gothic-arch', name: 'Gothic Arch', description: 'Cathedral-inspired pointed arch', style: 'gothic', shape: 'arch', preview: '⛪' },
  { id: 'oval-cameo', name: 'Oval Cameo', description: 'Elegant cameo-style oval', style: 'oval-cameo', shape: 'oval', preview: '💍' },
  // Additional frames for 25-year lifetime plans
  { id: 'angel-wings', name: 'Angel Wings', description: 'Heavenly winged border', style: 'angel', shape: 'square', preview: '👼' },
  { id: 'eternal-flame', name: 'Eternal Flame', description: 'Sacred flame motif', style: 'flame', shape: 'square', preview: '🕯️' },
  { id: 'garden-trellis', name: 'Garden Trellis', description: 'Flowering vine lattice', style: 'garden', shape: 'square', preview: '🌺' },
  { id: 'dove-peace', name: 'Dove of Peace', description: 'Peaceful dove corners', style: 'dove', shape: 'square', preview: '🕊️' },
  { id: 'starlight', name: 'Starlight', description: 'Celestial stars and moon', style: 'stars', shape: 'square', preview: '⭐' },
  { id: 'oval-floral', name: 'Oval Floral', description: 'Oval with floral garland', style: 'oval-floral', shape: 'oval', preview: '🌸' },
  { id: 'ocean-wave', name: 'Ocean Wave', description: 'Rolling wave pattern', style: 'ocean', shape: 'square', preview: '🌊' },
  { id: 'mountain-sunrise', name: 'Mountain Sunrise', description: 'Majestic peaks at dawn', style: 'mountain', shape: 'square', preview: '🏔️' },
  { id: 'ivy-cascade', name: 'Ivy Cascade', description: 'Trailing ivy leaves', style: 'ivy', shape: 'square', preview: '🍃' },
  { id: 'butterfly-garden', name: 'Butterfly Garden', description: 'Delicate butterfly corners', style: 'butterfly', shape: 'square', preview: '🦋' },
  { id: 'oval-memorial', name: 'Oval Memorial', description: 'Traditional memorial oval', style: 'oval-memorial', shape: 'oval', preview: '🪦' },
]

// Get available frames based on plan
export const getAvailableFrames = (duration: HostingDuration) => {
  const frameCount = duration === 5 ? 5 : duration === 10 ? 10 : 25
  return MEMORIAL_FRAMES.slice(0, frameCount)
}

export type MemorialTheme = typeof MEMORIAL_THEMES[number]
export type MemorialFrame = typeof MEMORIAL_FRAMES[number]
