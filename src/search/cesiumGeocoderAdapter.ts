import type { SearchAdapter } from "./searchService";

type CesiumGeocodeResponse = {
  features?: Array<{
    id?: string;
    place_name?: string;
    text?: string;
    center?: [number, number];
    bbox?: [number, number, number, number];
  }>;
};

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
          const center = feature.center;
          if (!center) {
            return [];
          }
          return {
            id: feature.id ?? `${feature.text ?? "result"}-${index}`,
            label: feature.place_name ?? feature.text ?? "Search result",
            longitude: center[0],
            latitude: center[1],
            heightMeters: feature.bbox ? 650000 : 350000
          };
        });

      return results;
    }
  };
}
