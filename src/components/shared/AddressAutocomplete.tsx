'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface AddressComponents {
  line1: string
  line2?: string
  city: string
  region: string
  postalCode: string
  country: string
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onAddressSelect: (address: AddressComponents) => void
  placeholder?: string
  className?: string
  required?: boolean
  error?: string
  inputRef?: React.RefObject<HTMLInputElement | null>
  countries?: string[] // ISO country codes, e.g., ['nz', 'au']
}

// Track if script is loading to prevent duplicate loads
let isScriptLoading = false
let isScriptLoaded = false
const callbacks: (() => void)[] = []

function loadGooglePlacesScript(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (isScriptLoaded) {
      resolve()
      return
    }

    if (isScriptLoading) {
      callbacks.push(resolve)
      return
    }

    isScriptLoading = true

    const script = document.createElement('script')
    // Use the new Places API (New) which includes PlaceAutocompleteElement
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`
    script.async = true
    script.defer = true
    script.onload = () => {
      isScriptLoaded = true
      isScriptLoading = false
      resolve()
      callbacks.forEach((cb) => cb())
      callbacks.length = 0
    }
    script.onerror = () => {
      isScriptLoading = false
      console.error('Failed to load Google Places API')
    }
    document.head.appendChild(script)
  })
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = 'Start typing your address...',
  className = '',
  required = false,
  error,
  inputRef: externalRef,
  countries = ['nz', 'au'],
}: AddressAutocompleteProps) {
  const internalRef = useRef<HTMLInputElement>(null)
  const inputRef = externalRef || internalRef
  const containerRef = useRef<HTMLDivElement>(null)
  const autocompleteElementRef = useRef<Element | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const initAutocomplete = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google
    if (!containerRef.current || !google?.maps?.places?.PlaceAutocompleteElement || autocompleteElementRef.current) {
      return
    }

    try {
      // Create the new PlaceAutocompleteElement
      const autocompleteElement = new google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: countries },
        types: ['address'],
      })

      // Style the element to match our input styling
      autocompleteElement.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        outline: none;
        font-size: inherit;
        font-family: inherit;
        background: transparent;
      `

      // Listen for place selection
      autocompleteElement.addEventListener('gmp-placeselect', async (event: Event) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const place = (event as any).place
        console.log('Place selected:', place)
        if (!place) return

        // Fetch full place details
        try {
          await place.fetchFields({ fields: ['addressComponents', 'formattedAddress'] })
          console.log('Address components:', place.addressComponents)
        } catch (err) {
          console.error('Error fetching place fields:', err)
        }

        const components: AddressComponents = {
          line1: '',
          city: '',
          region: '',
          postalCode: '',
          country: '',
        }

        let streetNumber = ''
        let streetName = ''

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const component of (place.addressComponents || [])) {
          const type = component.types[0]
          console.log('Component:', type, component.longText || component.long_name)
          
          switch (type) {
            case 'street_number':
              streetNumber = component.longText || component.long_name || ''
              break
            case 'route':
              streetName = component.longText || component.long_name || ''
              break
            case 'subpremise':
              components.line2 = component.longText || component.long_name || ''
              break
            case 'locality':
            case 'sublocality_level_1':
            case 'postal_town':
              if (!components.city) components.city = component.longText || component.long_name || ''
              break
            case 'administrative_area_level_1':
              components.region = component.longText || component.long_name || ''
              break
            case 'postal_code':
              components.postalCode = component.longText || component.long_name || ''
              break
            case 'country':
              components.country = component.shortText || component.short_name || ''
              break
          }
        }

        // Construct line1 from street number and name
        components.line1 = streetNumber 
          ? `${streetNumber} ${streetName}` 
          : streetName

        // Update the value
        onChange(components.line1)
        
        // Notify parent of all address components
        onAddressSelect(components)
      })

      // Clear any existing content and append
      const wrapper = containerRef.current.querySelector('.autocomplete-wrapper')
      if (wrapper) {
        wrapper.innerHTML = ''
        wrapper.appendChild(autocompleteElement)
      }

      autocompleteElementRef.current = autocompleteElement
    } catch (err) {
      console.error('Error initializing PlaceAutocompleteElement:', err)
    }
  }, [countries, onChange, onAddressSelect])

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      console.warn('Google Places API key not configured. Address autocomplete disabled.')
      return
    }

    loadGooglePlacesScript(apiKey).then(() => {
      setIsLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (isLoaded) {
      initAutocomplete()
    }
  }, [isLoaded, initAutocomplete])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autocompleteElementRef.current) {
        autocompleteElementRef.current.remove()
        autocompleteElementRef.current = null
      }
    }
  }, [])

  const inputClassName = `input ${error ? 'border-red-500 ring-2 ring-red-200' : ''} ${className}`

  // If API is loaded and PlaceAutocompleteElement is available, use the Google element
  // Otherwise fall back to regular input
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasNewPlacesAPI = isLoaded && (window as any).google?.maps?.places?.PlaceAutocompleteElement

  if (hasNewPlacesAPI) {
    return (
      <div ref={containerRef} className="relative">
        <div 
          className={`${inputClassName} ${isFocused ? 'ring-2 ring-primary-500 border-primary-500' : ''}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <div className="autocomplete-wrapper" style={{ width: '100%', minHeight: '24px' }} />
        </div>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  // Fallback to regular input when API not loaded
  return (
    <div className="relative">
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
        required={required}
        autoComplete="street-address"
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}
