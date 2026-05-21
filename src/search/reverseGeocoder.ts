import type { FocusedLocation, GlobeFocusPoint } from "../shared/domain";

type NominatimReverseResponse = {
  display_name?: string;
  address?: Record<string, string | undefined>;
};

export type ReverseGeocoder = {
  reverse(
    point: GlobeFocusPoint,
    signal?: AbortSignal
  ): Promise<Extract<FocusedLocation, { status: "ready" }> | undefined>;
};

const streetKeys = [
  "road",
  "pedestrian",
  "footway",
  "path",
  "residential",
  "cycleway"
];
const localityKeys = [
  "city",
  "town",
  "village",
  "municipality",
  "suburb",
  "neighbourhood"
];
const stateKeys = ["state", "region", "province", "state_district"];

export function createReverseGeocoder(
  fetcher: typeof fetch = fetch
): ReverseGeocoder {
  const cache = new Map<
    string,
    Extract<FocusedLocation, { status: "ready" }> | undefined
  >();

  return {
    async reverse(point, signal) {
      const key = cacheKey(point);
      if (cache.has(key)) {
        return cache.get(key);
      }

      const params = new URLSearchParams({
        format: "jsonv2",
        lat: point.latitude.toFixed(6),
        lon: point.longitude.toFixed(6),
        zoom: "18",
        addressdetails: "1",
        "accept-language": "en"
      });
      const response = await fetcher(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
        {
          headers: { accept: "application/json" },
          signal
        }
      );

      if (!response.ok) {
        throw new Error("Reverse geocoder unavailable");
      }

      const body = (await response.json()) as NominatimReverseResponse;
      const location = normalizeReverseGeocode(point, body);
      cache.set(key, location);
      return location;
    }
  };
}

export function normalizeReverseGeocode(
  point: GlobeFocusPoint,
  response: NominatimReverseResponse
): Extract<FocusedLocation, { status: "ready" }> | undefined {
  const address = response.address ?? {};
  const streetName = firstAddressValue(address, streetKeys);
  const stateName = firstAddressValue(address, stateKeys);
  const localityName = firstAddressValue(address, localityKeys);
  const countryName = address.country;
  const displayName = response.display_name ?? fallbackDisplayName(address);

  if (!streetName && !stateName && !localityName && !countryName && !displayName) {
    return undefined;
  }

  return {
    status: "ready",
    point,
    streetName,
    stateName,
    localityName,
    countryName,
    displayName,
    source: "OpenStreetMap"
  };
}

function firstAddressValue(
  address: Record<string, string | undefined>,
  keys: readonly string[]
) {
  for (const key of keys) {
    const value = address[key]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

function fallbackDisplayName(address: Record<string, string | undefined>) {
  return [
    firstAddressValue(address, streetKeys),
    firstAddressValue(address, localityKeys),
    firstAddressValue(address, stateKeys),
    address.country
  ]
    .filter(Boolean)
    .join(", ");
}

function cacheKey(point: GlobeFocusPoint) {
  return `${point.latitude.toFixed(4)},${point.longitude.toFixed(4)}`;
}
