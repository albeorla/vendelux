import React, { useState, useEffect } from 'react';
import { AnswerValue, LocationValue } from '@/types';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationQuestionProps {
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}

/**
 * Popular cities with pre-defined coordinates.
 * 
 * Simplified for prototype - a production version would use a geocoding API
 * (e.g., Google Places, Mapbox) for address autocomplete and coordinate lookup.
 */
const popularCities = [
  { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
  { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
  { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
  { name: 'Miami, FL', lat: 25.7617, lng: -80.1918 },
  { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
  { name: 'Austin, TX', lat: 30.2672, lng: -97.7431 },
  { name: 'Seattle, WA', lat: 47.6062, lng: -122.3321 },
  { name: 'Boston, MA', lat: 42.3601, lng: -71.0589 },
];

export function LocationQuestion({ value, onChange }: LocationQuestionProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (value && typeof value === 'object' && 'address' in value) {
      setInputValue((value as LocationValue).address);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    
    // Check if input matches a popular city
    const matchedCity = popularCities.find(
      city => city.name.toLowerCase() === newVal.toLowerCase()
    );
    
    if (matchedCity) {
      onChange({
        address: matchedCity.name,
        lat: matchedCity.lat,
        lng: matchedCity.lng
      } as LocationValue);
    } else {
      // For custom input, use placeholder coordinates
      // In production, this would trigger a geocoding API call
      onChange({
        address: newVal,
        lat: 0,
        lng: 0
      } as LocationValue);
    }
  };

  const handleCitySelect = (city: typeof popularCities[0]) => {
    setInputValue(city.name);
    onChange({
      address: city.name,
      lat: city.lat,
      lng: city.lng
    } as LocationValue);
  };

  const isSelected = (cityName: string) => {
    return inputValue === cityName;
  };

  return (
    <div className="space-y-5">
      {/* Text Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-[var(--color-gray-400)]" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 border-2 border-[var(--color-gray-200)] rounded-xl bg-white placeholder-[var(--color-gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-[var(--color-gray-900)] transition-all duration-200"
          placeholder="Enter city name (e.g., New York, NY)"
          value={inputValue}
          onChange={handleInputChange}
          aria-label="Location input"
        />
      </div>

      {/* Popular Cities */}
      <div>
        <p className="text-sm font-medium text-[var(--color-gray-500)] mb-3">
          Or select a popular city
        </p>
        <div className="flex flex-wrap gap-2">
          {popularCities.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => handleCitySelect(city)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full border-2 transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
                isSelected(city.name)
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-gray-200)] bg-white text-[var(--color-gray-700)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              )}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[var(--color-gray-400)]">
        Note: For this prototype, only popular cities have coordinates. 
        Production would use a geocoding API.
      </p>
    </div>
  );
}
