import type { SearchAdapter } from "./searchService";

type CesiumGeocodeResponse = {
  features?: Array<{
    id?: string;
    place_name?: string;
    text?: string;
    center?: [number, number];
    bbox?: [number, number, number, number];
    geometry?: {
      coordinates?: [number, number];
    };
    properties?: {
      label?: string;
    };
  }>;
};

const POINT_RESULT_HEIGHT_METERS = 6_500;
const CITY_RESULT_HEIGHT_METERS = 6_500;

function getFeatureCenter(feature: NonNullable<CesiumGeocodeResponse["features"]>[number]) {
  if (feature.center) {
    return feature.center;
  }

  if (feature.geometry?.coordinates) {
    return feature.geometry.coordinates;
  }

  if (feature.bbox) {
    const [west, south, east, north] = feature.bbox;
    return [(west + east) / 2, (south + north) / 2] satisfies [number, number];
  }

  return undefined;
}

function getFeatureHeightMeters(
  feature: NonNullable<CesiumGeocodeResponse["features"]>[number]
) {
  if (!feature.bbox) {
    return POINT_RESULT_HEIGHT_METERS;
  }

  const [west, south, east, north] = feature.bbox;
  const centerLatitude = (south + north) / 2;
  const widthKm =
    Math.abs(east - west) *
    111.32 *
    Math.max(0.12, Math.cos((centerLatitude * Math.PI) / 180));
  const heightKm = Math.abs(north - south) * 111.32;
  const spanKm = Math.max(widthKm, heightKm);

  if (spanKm <= 260) {
    return CITY_RESULT_HEIGHT_METERS;
  }

  return Math.min(1_800_000, Math.max(120_000, Math.round(spanKm * 900)));
}

export function createCesiumGeocoderAdapter(
  token: string | undefined,
  fetcher: typeof fetch = fetch
): SearchAdapter | undefined {
  if (!token) {
    return undefined;
  }

  return {
    async search(query, signal) {
      const params = new URLSearchParams({
        text: query,
        access_token: token
      });
      const response = await fetcher(
        `https://api.cesium.com/v1/geocode/search?${params.toString()}`,
        { signal }
      );

      if (!response.ok) {
        throw new Error("Cesium geocoder unavailable");
      }

      const body = (await response.json()) as CesiumGeocodeResponse;
      const results = (body.features ?? []).flatMap((feature, index) => {
        const center = getFeatureCenter(feature);
        if (!center) {
          return [];
        }
        const label =
          feature.place_name ??
          feature.properties?.label ??
          feature.text ??
          "Search result";
        return {
          id: feature.id ?? `${label}-${index}`,
          label,
          longitude: center[0],
          latitude: center[1],
          heightMeters: getFeatureHeightMeters(feature)
        };
      });

      return results;
    }
  };
}
