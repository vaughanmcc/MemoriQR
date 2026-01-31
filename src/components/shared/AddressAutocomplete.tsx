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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hasNewAPI, setHasNewAPI] = useState(false)

  // Parse address components from Google Place result
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseAddressComponents = useCallback((addressComponents: any[]): AddressComponents => {
    const components: AddressComponents = {
      line1: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
    }

    let streetNumber = ''
    let streetName = ''

    for (const component of addressComponents) {
      // Handle both old API (types array) and new API (types array)
      const types = component.types || []
      const longName = component.longText || component.long_name || ''
      const shortName = component.shortText || component.short_name || ''

      if (types.includes('street_number')) {
        streetNumber = longName
      } else if (types.includes('route')) {
        streetName = longName
      } else if (types.includes('subpremise')) {
        components.line2 = longName
      } else if (types.includes('locality') || types.includes('sublocality_level_1') || types.includes('postal_town')) {
        if (!components.city) components.city = longName
      } else if (types.includes('administrative_area_level_1')) {
        components.region = longName
      } else if (types.includes('postal_code')) {
        components.postalCode = longName
      } else if (types.includes('country')) {
        components.country = shortName
      }
    }

    components.line1 = streetNumber ? `${streetNumber} ${streetName}` : streetName

    return components
  }, [])

  const initAutocomplete = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google
    if (!google?.maps?.places) return

    // Check if we have the new PlaceAutocompleteElement
    if (google.maps.places.PlaceAutocompleteElement && containerRef.current) {
      setHasNewAPI(true)
      
      if (autocompleteRef.current) return // Already initialized

      try {
        // Create PlaceAutocompleteElement with proper options
        const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({
          componentRestrictions: { country: countries },
          types: ['address'],
        })

        // Apply custom styles to make it look like our input
        placeAutocomplete.setAttribute('style', `
          width: 100%;
          --gmpx-color-surface: transparent;
          --gmpx-color-on-surface: inherit;
          --gmpx-font-family-base: inherit;
          --gmpx-font-size-base: inherit;
        `)

        // Handle place selection - the event is 'gmp-placeselect'
        placeAutocomplete.addEventListener('gmp-placeselect', async (e: Event) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const placeEvent = e as any
          const place = placeEvent.place
          
          console.log('gmp-placeselect fired, place:', place)

          if (!place) {
            console.log('No place in event')
            return
          }

          try {
            // Fetch the address components
            await place.fetchFields({ fields: ['addressComponents', 'formattedAddress'] })
            
            console.log('Place details fetched:', {
              formattedAddress: place.formattedAddress,
              addressComponents: place.addressComponents,
            })

            if (place.addressComponents) {
              const components = parseAddressComponents(place.addressComponents)
              console.log('Parsed components:', components)
              
              // Update the street value
              onChange(components.line1 || place.formattedAddress || '')
              
              // Notify parent of all address components
              onAddressSelect(components)
            }
          } catch (err) {
            console.error('Error fetching place details:', err)
          }
        })

        // Also try listening to 'gmp-select' as alternative
        placeAutocomplete.addEventListener('gmp-select', (e: Event) => {
          console.log('gmp-select fired:', e)
        })

        // Mount the element
        const wrapper = containerRef.current.querySelector('.autocomplete-wrapper')
        if (wrapper) {
          wrapper.innerHTML = ''
          wrapper.appendChild(placeAutocomplete)
        }

        autocompleteRef.current = placeAutocomplete
        console.log('PlaceAutocompleteElement initialized successfully')
      } catch (err) {
        console.error('Error creating PlaceAutocompleteElement:', err)
        setHasNewAPI(false)
      }
    } else if (inputRef.current && google.maps.places.Autocomplete) {
      // Fall back to legacy Autocomplete if available
      if (autocompleteRef.current) return

      try {
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: countries },
          fields: ['address_components', 'formatted_address'],
          types: ['address'],
        })

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          console.log('Legacy place_changed:', place)

          if (place.address_components) {
            const components = parseAddressComponents(place.address_components)
            onChange(components.line1 || place.formatted_address || '')
            onAddressSelect(components)
          }
        })

        autocompleteRef.current = autocomplete
        console.log('Legacy Autocomplete initialized')
      } catch (err) {
        console.error('Error creating legacy Autocomplete:', err)
      }
    }
  }, [countries, onChange, onAddressSelect, parseAddressComponents, inputRef])

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      console.warn('Google Places API key not configured')
      return
    }

    loadGooglePlacesScript(apiKey).then(() => {
      setIsLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (isLoaded) {
      // Small delay to ensure Google Maps is fully ready
      const timer = setTimeout(initAutocomplete, 100)
      return () => clearTimeout(timer)
    }
  }, [isLoaded, initAutocomplete])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autocompleteRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google = (window as any).google
        if (google?.maps?.event) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current)
        }
        if (autocompleteRef.current.remove) {
          autocompleteRef.current.remove()
        }
        autocompleteRef.current = null
      }
    }
  }, [])

  const inputClassName = `input ${error ? 'border-red-500 ring-2 ring-red-200' : ''} ${className}`

  // Use the new PlaceAutocompleteElement if available
  if (hasNewAPI && isLoaded) {
    return (
      <div ref={containerRef} className="relative">
        <div className={inputClassName} style={{ padding: 0, overflow: 'hidden' }}>
          <div 
            className="autocomplete-wrapper" 
            style={{ 
              width: '100%', 
              minHeight: '42px',
              display: 'flex',
              alignItems: 'center',
            }} 
          />
        </div>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  // Fallback to regular input (for legacy API or when not loaded)
  return (
    <div ref={containerRef} className="relative">
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
