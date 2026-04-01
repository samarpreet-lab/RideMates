// =============================================================================
// services/locationiq.ts — LocationIQ Geocoding API Integration
// =============================================================================
// Provides location autocomplete using LocationIQ API
// - Fast, accurate location search with bias toward LPU, Punjab
// - Autocomplete suggestions with display names
// - Latitude/longitude coordinates for map placement
// =============================================================================

const LOCATIONIQ_API_KEY = 'pk.af5de466389a1393d420514979c66614';
const LOCATIONIQ_API_URL = 'https://api.locationiq.com/v1/autocomplete';

// LPU Location bias
const BIAS_LAT = 31.2536;
const BIAS_LON = 75.7037;

// Punjab bounding box to filter results to relevant region
const PUNJAB_BOUNDS = {
  minLat: 29.5,
  maxLat: 32.6,
  minLng: 73.8,
  maxLng: 77.0,
};

interface LocationIQResult {
  place_id: number;
  osm_id: number;
  osm_type: string;
  licence: string;
  lat: string;
  lon: string;
  name: string;
  display_name: string;
  address: {
    name?: string;
    village?: string;
    town?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  type: string;
  importance: number;
}

export interface LocationResult {
  id: string;
  label: string;
  subtitle: string;
  lat: number;
  lng: number;
  source: 'locationiq';
}

/**
 * Check if coordinates are within Punjab region
 */
function isInPunjabRegion(lat: number, lng: number): boolean {
  return (
    lat >= PUNJAB_BOUNDS.minLat &&
    lat <= PUNJAB_BOUNDS.maxLat &&
    lng >= PUNJAB_BOUNDS.minLng &&
    lng <= PUNJAB_BOUNDS.maxLng
  );
}

/**
 * Format address for display
 */
function formatAddress(result: LocationIQResult): {
  label: string;
  subtitle: string;
} {
  const { address, name, display_name } = result;

  // Build primary label from available address parts
  const primaryLabel = name || address?.name || '';

  // Build subtitle from address hierarchy
  let subtitle = '';
  if (address?.city) subtitle = address.city;
  else if (address?.town) subtitle = address.town;
  else if (address?.village) subtitle = address.village;

  if (address?.state && subtitle !== address.state) {
    subtitle = subtitle ? `${subtitle}, ${address.state}` : address.state;
  }

  return {
    label: primaryLabel,
    subtitle: subtitle || (address?.county || address?.country || ''),
  };
}

/**
 * Search for locations using LocationIQ API
 * @param query Search query string
 * @returns Array of location results
 */
export async function searchLocations(query: string): Promise<LocationResult[]> {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const params = new URLSearchParams({
      key: LOCATIONIQ_API_KEY,
      q: query.trim(),
      format: 'json',
      limit: '10',
      // Bias toward LPU location
      viewbox: `${BIAS_LON - 0.5},${BIAS_LAT + 0.5},${BIAS_LON + 0.5},${BIAS_LAT - 0.5}`,
      bounded: '1', // Only return results within viewbox
      dedupe: '1', // Remove duplicate results
      countrycodes: 'in', // India only
      accept_language: 'en',
    });

    const url = `${LOCATIONIQ_API_URL}?${params.toString()}`;
    console.log('🔍 LocationIQ search:', query);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`LocationIQ API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: LocationIQResult[] = await response.json();

    if (!Array.isArray(data)) {
      console.error('LocationIQ returned non-array response');
      return [];
    }

    // Filter results
    const results: LocationResult[] = data
      .filter((result) => {
        // Filter to relevant types (cities, towns, villages, districts)
        const validTypes = ['city', 'town', 'village', 'district', 'administrative'];
        const isValidType = validTypes.some(
          (t) => result.type?.toLowerCase().includes(t)
        );

        if (!isValidType) return false;

        // Filter to Punjab region
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        if (!isInPunjabRegion(lat, lng)) {
          console.log(`Filtered out: ${result.name} (outside Punjab)`);
          return false;
        }

        return true;
      })
      .map((result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const { label, subtitle } = formatAddress(result);

        return {
          id: `locationiq_${result.place_id}`,
          label,
          subtitle,
          lat,
          lng,
          source: 'locationiq' as const,
        };
      })
      .slice(0, 8); // Limit to 8 results

    console.log(`✅ LocationIQ found ${results.length} locations for "${query}"`);
    return results;
  } catch (error) {
    console.error('LocationIQ search error:', error);
    return [];
  }
}

/**
 * Reverse geocode (get address from coordinates)
 * @param lat Latitude
 * @param lng Longitude
 * @returns Location name
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const params = new URLSearchParams({
      key: LOCATIONIQ_API_KEY,
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      zoom: '18',
      addressdetails: '1',
    });

    const url = `https://api.locationiq.com/v1/reverse?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`LocationIQ reverse geocode error: ${response.status}`);
      return 'Unknown Location';
    }

    const data = await response.json();
    return data.address?.name || data.address?.city || 'Unknown Location';
  } catch (error) {
    console.error('LocationIQ reverse geocode error:', error);
    return 'Unknown Location';
  }
}
