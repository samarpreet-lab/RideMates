// =============================================================================
// hooks/useLocationIQSearch.ts — LocationIQ Location Search Hook
// =============================================================================
// Real-time location search with debouncing
// - Fetches results from LocationIQ API
// - Combines with local hub results
// - 300ms debounce to prevent excessive API calls
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { searchLocations, LocationResult } from '../services/locationiq';

interface Hub {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
}

interface CombinedResult {
  id: string;
  label: string;
  subtitle: string;
  lat: number;
  lng: number;
  icon: string;
  source: 'locationiq' | 'local';
}

const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;

export default function useLocationIQSearch(
  query: string,
  localHubs: Hub[] = []
) {
  const [results, setResults] = useState<CombinedResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // If query is empty, show only local hubs
    if (!query || query.trim().length === 0) {
      // Add default icon to local hubs
      const hubResults: CombinedResult[] = localHubs.map((hub) => ({
        ...hub,
        lat: 0,
        lng: 0,
        source: 'local' as const,
        icon: hub.icon || 'location-on',
      }));
      setResults(hubResults);
      setLoading(false);
      return;
    }

    // Set debounce timer
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);

      try {
        // First, filter local hubs
        const filteredHubs = localHubs.filter(
          (hub) =>
            hub.label.toLowerCase().includes(query.toLowerCase()) ||
            hub.subtitle.toLowerCase().includes(query.toLowerCase())
        );

        // Then fetch from LocationIQ if query is long enough
        let locationiqResults: CombinedResult[] = [];
        if (query.trim().length >= MIN_CHARS) {
          const results = await searchLocations(query.trim());
          locationiqResults = results.map((result) => ({
            ...result,
            icon: 'location-on',
            source: 'locationiq' as const,
          }));
        }

        // Combine results: local hubs first, then LocationIQ results
        const combined: CombinedResult[] = [
          ...filteredHubs.map((hub) => ({
            id: hub.id,
            label: hub.label,
            subtitle: hub.subtitle,
            lat: 0,
            lng: 0,
            source: 'local' as const,
            icon: hub.icon || 'location-on',
          })),
          ...locationiqResults,
        ];

        setResults(combined);
      } catch (error) {
        console.error('Location search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, localHubs]);

  return { results, loading };
}
