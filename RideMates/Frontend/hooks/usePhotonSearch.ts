// =============================================================================
// hooks/usePhotonSearch.ts — Debounced Photon Geocoding (FR-MAP-01)
// =============================================================================
// Hybrid Geocoding: Local hubs first → Photon API fallback.
// • 450ms debounce to avoid rate-limiting on the free community API
// • Location-biased toward LPU, Punjab (31.2536, 75.7037)
// • Filters results to city/town/village/district only
// • Swaps Photon's [lng, lat] → [lat, lng] for our schema
// =============================================================================

import { useState, useEffect, useRef } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LocationResult {
  id: string;
  label: string;
  subtitle: string;
  lat: number;
  lng: number;
  source: 'local' | 'photon';
  icon: string;
}

// ─── LPU Bias Coordinates ──────────────────────────────────────────────────

const BIAS_LAT = 31.2536;
const BIAS_LON = 75.7037;
const DEBOUNCE_MS = 450;
const MIN_CHARS = 3;
const VALID_OSM_VALUES = ['city', 'town', 'village', 'district'];

// Punjab bounding box — drop any result outside this region
const PUNJAB_BOUNDS = { minLat: 29.5, maxLat: 32.6, minLng: 73.8, maxLng: 77.0 };

function isInPunjabRegion(lat: number, lng: number): boolean {
  return (
    lat >= PUNJAB_BOUNDS.minLat && lat <= PUNJAB_BOUNDS.maxLat &&
    lng >= PUNJAB_BOUNDS.minLng && lng <= PUNJAB_BOUNDS.maxLng
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export default function usePhotonSearch(
  query: string,
  localHubs: { id: string; label: string; subtitle: string; icon: string }[],
  hubCoords: Record<string, { lat: number; lng: number }>,
) {
  const [photonResults, setPhotonResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Clear previous timer on every keystroke (debounce cancellation)
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim().toLowerCase();

    // Reset if query is too short
    if (trimmed.length < MIN_CHARS) {
      setPhotonResults([]);
      setLoading(false);
      return;
    }

    // Step 1: Check local hubs first
    const localMatches = localHubs.filter(
      (h) =>
        h.label.toLowerCase().includes(trimmed) ||
        h.subtitle.toLowerCase().includes(trimmed),
    );

    // If we have local matches, show them — no need for API
    if (localMatches.length > 0) {
      setPhotonResults([]);
      setLoading(false);
      return;
    }

    // Step 2: No local match — debounce then call Photon
    setLoading(true);

    timerRef.current = setTimeout(() => {
      // Abort any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const url =
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}` +
        `&lat=${BIAS_LAT}&lon=${BIAS_LON}&location_bias_scale=0.5` +
        `&limit=8`;

      fetch(url, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          if (!data.features) {
            setPhotonResults([]);
            return;
          }

          // Filter to city/town/village/district within Punjab region
          const results: LocationResult[] = data.features
            .filter((f: any) => {
              const osmValue = f.properties?.osm_value;
              if (!VALID_OSM_VALUES.includes(osmValue)) return false;
              // Restrict to Punjab area
              const lng = f.geometry?.coordinates?.[0];
              const lat = f.geometry?.coordinates?.[1];
              return isInPunjabRegion(lat, lng);
            })
            .slice(0, 5)
            .map((f: any, i: number) => {
              // CRITICAL: Photon = [lng, lat], we need [lat, lng]
              const lng = f.geometry.coordinates[0];
              const lat = f.geometry.coordinates[1];

              const name = f.properties.name || 'Unknown';
              const state = f.properties.state || '';
              const country = f.properties.country || '';
              const subtitle = [state, country].filter(Boolean).join(', ');

              return {
                id: `photon-${i}-${name}`,
                label: name,
                subtitle,
                lat,
                lng,
                source: 'photon' as const,
                icon: 'location-city',
              };
            });

          setPhotonResults(results);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setPhotonResults([]);
          }
        })
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    // Cleanup on unmount or re-run
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query, localHubs]);

  return { photonResults, loading };
}
