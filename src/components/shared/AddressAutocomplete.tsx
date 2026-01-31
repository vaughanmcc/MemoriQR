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

interface Prediction {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

// Track if script is loading to prevent duplicate loads
let isScriptLoading = false
let isScriptLoaded = false
const callbacks: (() => void)[] = []

function waitForPlacesLibrary(): Promise<void> {
  return new Promise((resolve) => {
    const checkPlaces = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const google = (window as any).google
      if (google?.maps?.places?.AutocompleteService) {
        console.log('AddressAutocomplete: Places library ready')
        resolve()
      } else {
        setTimeout(checkPlaces, 100)
      }
    }
    checkPlaces()
  })
}

function loadGooglePlacesScript(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google
    if (google?.maps?.places?.AutocompleteService) {
      // Already loaded and ready
      resolve()
      return
    }

    if (isScriptLoaded) {
      // Script loaded but Places not ready yet, wait for it
      waitForPlacesLibrary().then(resolve)
      return
    }

    if (isScriptLoading) {
      callbacks.push(resolve)
      return
    }

    isScriptLoading = true

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      isScriptLoaded = true
      isScriptLoading = false
      // Wait for Places library to be fully initialized
      waitForPlacesLibrary().then(() => {
        resolve()
        callbacks.forEach((cb) => cb())
        callbacks.length = 0
      })
    }
    script.onerror = () => {
      isScriptLoading = false
      console.error('Failed to load Google Places API')
    }
    document.head.appendChild(script)
  })
}

export function AddressAutocomplete({
  value = '',
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
  const [isLoaded, setIsLoaded] = useState(false)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteServiceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const placesServiceRef = useRef<any>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize services
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    console.log('AddressAutocomplete: API key present:', !!apiKey)
    if (!apiKey) {
      console.warn('Google Places API key not configured')
      return
    }

    loadGooglePlacesScript(apiKey).then(() => {
      console.log('AddressAutocomplete: Google script loaded')
      setIsLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (isLoaded) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const google = (window as any).google
      console.log('AddressAutocomplete: google.maps.places available:', !!google?.maps?.places)
      if (google?.maps?.places) {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
        // Create a dummy div for PlacesService
        const dummyDiv = document.createElement('div')
        placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv)
        console.log('AddressAutocomplete: Services initialized')
      }
    }
  }, [isLoaded])

  // Fetch predictions
  const fetchPredictions = useCallback((input: string) => {
    console.log('AddressAutocomplete: fetchPredictions called with:', input)
    console.log('AddressAutocomplete: autocompleteService available:', !!autocompleteServiceRef.current)
    
    if (!autocompleteServiceRef.current || input.length < 2) {
      setPredictions([])
      return
    }

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: countries },
        types: ['address'],
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (results: any[], status: string) => {
        console.log('AddressAutocomplete: getPlacePredictions callback, status:', status, 'results:', results?.length)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google = (window as any).google
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            results.map((r: any) => ({
              placeId: r.place_id,
              description: r.description,
              mainText: r.structured_formatting?.main_text || r.description,
              secondaryText: r.structured_formatting?.secondary_text || '',
            }))
          )
          setShowDropdown(true)
          console.log('AddressAutocomplete: Showing dropdown with', results.length, 'predictions')
        } else {
          console.log('AddressAutocomplete: No results or error status')
          setPredictions([])
        }
      }
    )
  }, [countries])

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchPredictions(newValue)
    }, 300)
  }

  // Handle prediction selection
  const handleSelectPrediction = (prediction: Prediction) => {
    if (!placesServiceRef.current) return

    placesServiceRef.current.getDetails(
      {
        placeId: prediction.placeId,
        fields: ['address_components', 'formatted_address'],
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (place: any, status: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google = (window as any).google
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
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
          for (const component of (place.address_components || [])) {
            const types = component.types || []
            const longName = component.long_name || ''
            const shortName = component.short_name || ''

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

          // Update street address field
          onChange(components.line1 || place.formatted_address || prediction.description)
          
          // Notify parent of all components
          onAddressSelect(components)
        }

        setShowDropdown(false)
        setPredictions([])
      }
    )
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || predictions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) => 
          prev < predictions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < predictions.length) {
          handleSelectPrediction(predictions[highlightedIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        break
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [inputRef])

  const inputClassName = `input ${error ? 'border-red-500 ring-2 ring-red-200' : ''} ${className}`

  return (
    <div className="relative">
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={value || ''}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => predictions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        className={inputClassName}
        required={required}
        autoComplete="off"
      />
      
      {/* Predictions dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {predictions.map((prediction, index) => (
            <button
              key={prediction.placeId}
              type="button"
              className={`w-full px-4 py-3 text-left hover:bg-gray-100 flex items-start gap-3 ${
                index === highlightedIndex ? 'bg-gray-100' : ''
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === predictions.length - 1 ? 'rounded-b-lg' : ''
              }`}
              onClick={() => handleSelectPrediction(prediction)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">{prediction.mainText}</div>
                {prediction.secondaryText && (
                  <div className="text-sm text-gray-500">{prediction.secondaryText}</div>
                )}
              </div>
            </button>
          ))}
          <div className="px-4 py-2 text-xs text-gray-400 text-right border-t">
            Powered by Google
          </div>
        </div>
      )}
      
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}
