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

// Minimal Google Maps types (avoid needing @types/google.maps)
interface GoogleAddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

interface GooglePlaceResult {
  address_components?: GoogleAddressComponent[]
  formatted_address?: string
}

interface GoogleAutocomplete {
  addListener: (event: string, handler: () => void) => void
  getPlace: () => GooglePlaceResult
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

    // Set up callback before loading script
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).initGooglePlaces = () => {
      isScriptLoaded = true
      isScriptLoading = false
      resolve()
      callbacks.forEach((cb) => cb())
      callbacks.length = 0
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`
    script.async = true
    script.defer = true
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
  const autocompleteRef = useRef<GoogleAutocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const initAutocomplete = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google
    if (!inputRef.current || !google?.maps?.places || autocompleteRef.current) {
      return
    }

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: countries },
      fields: ['address_components', 'formatted_address'],
      types: ['address'],
    }) as GoogleAutocomplete

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.address_components) return

      const components: AddressComponents = {
        line1: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
      }

      let streetNumber = ''
      let streetName = ''

      for (const component of place.address_components) {
        const type = component.types[0]
        
        switch (type) {
          case 'street_number':
            streetNumber = component.long_name
            break
          case 'route':
            streetName = component.long_name
            break
          case 'subpremise':
            components.line2 = component.long_name
            break
          case 'locality':
          case 'sublocality_level_1':
          case 'postal_town':
            if (!components.city) components.city = component.long_name
            break
          case 'administrative_area_level_1':
            components.region = component.long_name
            break
          case 'postal_code':
            components.postalCode = component.long_name
            break
          case 'country':
            components.country = component.short_name
            break
        }
      }

      // Construct line1 from street number and name
      components.line1 = streetNumber 
        ? `${streetNumber} ${streetName}` 
        : streetName

      // Update the input value with the street address
      onChange(components.line1)
      
      // Notify parent of all address components
      onAddressSelect(components)
    })

    autocompleteRef.current = autocomplete
  }, [inputRef, countries, onChange, onAddressSelect])

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
      if (autocompleteRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google = (window as any).google
        google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
        autocompleteRef.current = null
      }
    }
  }, [])

  const inputClassName = `input ${error ? 'border-red-500 ring-2 ring-red-200' : ''} ${className}`

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
        autoComplete="off"
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}
