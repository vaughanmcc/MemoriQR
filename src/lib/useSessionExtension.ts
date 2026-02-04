'use client'

import { useEffect } from 'react'

/**
 * Hook to extend partner session based on user activity.
 * Checks every 5 minutes and extends session if user was active.
 * Only works for non-trusted device sessions (trusted devices have 24hr expiry).
 */
export function useSessionExtension() {
  useEffect(() => {
    let extensionInterval: NodeJS.Timeout
    let lastActivity = Date.now()
    let lastExtension = 0

    const extendSession = async () => {
      // Only extend if there was activity in the last 5 minutes
      // and we haven't extended in the last 5 minutes (throttle)
      const now = Date.now()
      if (now - lastActivity < 5 * 60 * 1000 && now - lastExtension > 5 * 60 * 1000) {
        try {
          await fetch('/api/partner/session/extend', { method: 'POST' })
          lastExtension = now
          console.log('Session extended at', new Date().toLocaleTimeString())
        } catch (e) {
          // Silently fail - user will be logged out when session expires
        }
      }
    }

    const trackActivity = () => {
      lastActivity = Date.now()
    }

    // Track user activity
    window.addEventListener('mousemove', trackActivity)
    window.addEventListener('keydown', trackActivity)
    window.addEventListener('click', trackActivity)
    window.addEventListener('scroll', trackActivity)

    // Check and extend session every 5 minutes
    extensionInterval = setInterval(extendSession, 5 * 60 * 1000)
    
    // Also extend immediately on page load if there's activity
    setTimeout(extendSession, 1000)

    return () => {
      window.removeEventListener('mousemove', trackActivity)
      window.removeEventListener('keydown', trackActivity)
      window.removeEventListener('click', trackActivity)
      window.removeEventListener('scroll', trackActivity)
      clearInterval(extensionInterval)
    }
  }, [])
}
