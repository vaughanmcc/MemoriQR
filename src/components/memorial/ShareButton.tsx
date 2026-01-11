'use client'

import { useState } from 'react'
import { Share2, Check, Copy, Facebook, Twitter } from 'lucide-react'

interface ShareButtonProps {
  slug: string
  name: string
}

export function ShareButton({ slug, name }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const url = typeof window !== 'undefined' 
    ? `${window.location.origin}/memorial/${slug}`
    : `https://memoriqr.co.nz/memorial/${slug}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareText = `In loving memory of ${name}`

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 text-sm font-medium"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <Facebook className="h-4 w-4" />
              Share on Facebook
            </a>
            
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <Twitter className="h-4 w-4" />
              Share on Twitter
            </a>
          </div>
        </>
      )}
    </div>
  )
}
