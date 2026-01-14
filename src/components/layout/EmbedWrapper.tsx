'use client'

import { useSearchParams } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'
import { Suspense } from 'react'

interface EmbedWrapperProps {
  children: React.ReactNode
  showHeaderFooter?: boolean
}

function EmbedWrapperContent({ children, showHeaderFooter = true }: EmbedWrapperProps) {
  const searchParams = useSearchParams()
  const isEmbed = searchParams.get('embed') === 'true'
  
  // If embed mode, hide header/footer
  if (isEmbed) {
    return (
      <div className="embed-mode">
        {children}
      </div>
    )
  }
  
  // Normal mode with header/footer
  if (showHeaderFooter) {
    return (
      <>
        <Header />
        {children}
        <Footer />
      </>
    )
  }
  
  // No header/footer requested
  return <>{children}</>
}

export function EmbedWrapper({ children, showHeaderFooter = true }: EmbedWrapperProps) {
  return (
    <Suspense fallback={
      showHeaderFooter ? (
        <>
          <Header />
          {children}
          <Footer />
        </>
      ) : (
        <>{children}</>
      )
    }>
      <EmbedWrapperContent showHeaderFooter={showHeaderFooter}>
        {children}
      </EmbedWrapperContent>
    </Suspense>
  )
}
