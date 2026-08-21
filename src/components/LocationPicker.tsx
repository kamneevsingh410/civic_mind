import { useState, useRef, useEffect } from 'react';
import { MapPin, Search, Navigation, X, Loader2 } from 'lucide-react';

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number, label: string) => void;
  currentLocation: { lat: number; lng: number };
}

const POPULAR_CITIES = [
  { name: 'New Delhi, India', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore, India', lat: 12.9716, lng: 77.5946 },
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
  { name: 'Berlin, Germany', lat: 52.5200, lng: 13.4050 },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Toronto, Canada', lat: 43.6532, lng: -79.3832 },
  { name: 'São Paulo, Brazil', lat: -23.5505, lng: -46.6333 },
  { name: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357 },
  { name: 'Lagos, Nigeria', lat: 6.5244, lng: 3.3792 },
  { name: 'Nairobi, Kenya', lat: -1.2921, lng: 36.8219 },
  { name: 'Istanbul, Turkey', lat: 41.0082, lng: 28.9784 },
  { name: 'Mexico City, Mexico', lat: 19.4326, lng: -99.1332 },
  { name: 'Bangkok, Thailand', lat: 13.7563, lng: 100.5018 },
  { name: 'Jakarta, Indonesia', lat: -6.2088, lng: 106.8456 },
];

export const LocationPicker = ({
  isOpen,
  onClose,
  onLocationSelect,
  currentLocation
}: LocationPickerProps) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchText('');
      setSearchResults([]);
      setError('');
    }
  }, [isOpen]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setError('');

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=8&addressdetails=1`
        );
        if (res.ok) {
          const data = await res.json();
          const results = data.map((item: { address?: { city?: string; town?: string; state?: string; country?: string }; lat: string; lon: string; display_name: string }) => {
            const parts = [item.address?.city, item.address?.town, item.address?.state, item.address?.country]
              .filter(Boolean);
            return {
              name: parts.join(', ') || item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            };
          });
          setSearchResults(results);
        }
      } catch {
        setError('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleDetectLocation = () => {
    setIsDetecting(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Reverse geocode to get the city name
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(res => res.json())
          .then(data => {
            const city = data.address?.city || data.address?.town || data.address?.village || '';
            const country = data.address?.country || '';
            const label = [city, country].filter(Boolean).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            onLocationSelect(lat, lng, label);
            onClose();
          })
          .catch(() => {
            onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            onClose();
          })
          .finally(() => setIsDetecting(false));
      },
      () => {
        setError('Location access denied. Please search for your city below.');
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleSelectCity = (city: { name: string; lat: number; lng: number }) => {
    onLocationSelect(city.lat, city.lng, city.name);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(245, 246, 248, 0.92)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10000, padding: '24px'
    }}>
      <div
        className="animate-slide-up"
        style={{
          maxWidth: '480px', width: '100%', background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)', borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)', padding: '28px',
          display: 'flex', flexDirection: 'column', gap: '20px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-geo))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '12px', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
            }}>
              <MapPin size={20} style={{ color: 'white' }} />
            </div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)', fontFamily: 'var(--font-heading)', margin: 0 }}>
              Set Your Location
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
              Choose your city so CivicMind can center the map on your neighborhood.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close location picker"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-dark)', padding: '4px', borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Auto-detect button */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isDetecting}
          className="btn"
          style={{
            width: '100%', justifyContent: 'center', padding: '12px',
            fontSize: '0.85rem', gap: '10px',
            background: 'rgba(37, 99, 235, 0.04)',
            borderColor: 'rgba(37, 99, 235, 0.15)',
            color: 'var(--color-primary)'
          }}
        >
          {isDetecting ? (
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Navigation size={16} />
          )}
          {isDetecting ? 'Detecting your location...' : 'Use My Current Location'}
        </button>

        {error && (
          <div style={{
            padding: '10px 14px', background: 'rgba(220, 38, 38, 0.04)',
            border: '1px solid rgba(220, 38, 38, 0.12)', borderRadius: '8px',
            fontSize: '0.78rem', color: 'var(--color-critical)'
          }}>
            {error}
          </div>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: '0.68rem', color: 'var(--color-text-dark)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
            Or search city
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)',
          borderRadius: '10px', padding: '4px 4px 4px 14px'
        }}>
          <Search size={15} style={{ color: 'var(--color-text-dark)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a city name..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              flex: 1, border: 'none', background: 'transparent', padding: '10px 0',
              fontSize: '0.85rem', color: 'var(--color-text-main)', outline: 'none',
              fontFamily: 'var(--font-body)'
            }}
          />
          {isSearching && (
            <Loader2 size={14} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite', marginRight: '8px' }} />
          )}
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '2px',
            border: '1px solid var(--border-subtle)', borderRadius: '10px',
            overflow: 'hidden', maxHeight: '180px', overflowY: 'auto'
          }}>
            {searchResults.map((result) => (
              <button
                key={`${result.lat}-${result.lng}`}
                type="button"
                onClick={() => handleSelectCity(result)}
                className="location-option"
              >
                <MapPin size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{result.name}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-dark)' }}>
                  {result.lat.toFixed(2)}, {result.lng.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Popular cities */}
        {searchResults.length === 0 && (
          <div>
            <span style={{
              fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-text-dark)',
              textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block', marginBottom: '8px'
            }}>
              Popular Cities
            </span>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '6px'
            }}>
              {POPULAR_CITIES.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => handleSelectCity(city)}
                className="btn hover-bg-subtle"
                style={{
                  fontSize: '0.72rem', padding: '6px 12px', gap: '5px',
                  background: 'var(--bg-deep)',
                  borderColor: 'var(--border-subtle)'
                }}
                >
                  <MapPin size={10} style={{ color: 'var(--color-primary)' }} />
                  {city.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current location info */}
        <div style={{
          padding: '10px 14px', background: 'var(--bg-deep)',
          border: '1px solid var(--border-subtle)', borderRadius: '8px',
          fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <Navigation size={12} style={{ color: 'var(--color-text-dark)' }} />
          Current center: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
};
