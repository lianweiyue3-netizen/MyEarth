import { describe, expect, it, vi } from "vitest";
import {
  createReverseGeocoder,
  normalizeReverseGeocode
} from "../../src/search/reverseGeocoder";
import type { GlobeFocusPoint } from "../../src/shared/domain";

const point: GlobeFocusPoint = {
  latitude: 40.758,
  longitude: -73.9855,
  cameraHeightMeters: 3200
};

describe("reverse geocoder", () => {
  it("normalizes street and state fields from OpenStreetMap address data", () => {
    expect(
      normalizeReverseGeocode(point, {
        display_name: "7th Avenue, New York, New York, United States",
        address: {
          road: "7th Avenue",
          city: "New York",
          state: "New York",
          country: "United States"
        }
      })
    ).toMatchObject({
      status: "ready",
      streetName: "7th Avenue",
      localityName: "New York",
      stateName: "New York",
      countryName: "United States",
      source: "OpenStreetMap"
    });
  });

  it("caches nearby reverse lookups by rounded coordinates", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        display_name: "Market Street, California, United States",
        address: {
          road: "Market Street",
          state: "California",
          country: "United States"
        }
      })
    });
    const geocoder = createReverseGeocoder(fetcher as unknown as typeof fetch);

    await expect(geocoder.reverse(point)).resolves.toMatchObject({
      streetName: "Market Street",
      stateName: "California"
    });
    await geocoder.reverse({
      ...point,
      latitude: 40.75801,
      longitude: -73.98549
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
