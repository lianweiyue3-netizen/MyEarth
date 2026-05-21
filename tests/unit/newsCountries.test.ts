import { describe, expect, it } from "vitest";
import {
  getNewsCountryBoundary,
  listNewsCountryBoundaries
} from "../../src/news/countryBoundaries";
import {
  getNewsCountry,
  listNewsCountries
} from "../../src/news/newsCountries";

describe("news country metadata and boundaries", () => {
  it("defines unique lower-case country codes and display names", () => {
    const countries = listNewsCountries();
    const codes = new Set(countries.map((country) => country.code));

    expect(countries.length).toBeGreaterThan(0);
    expect(codes.size).toBe(countries.length);

    for (const country of countries) {
      expect(country.code).toMatch(/^[a-z]{2}$/);
      expect(country.name.trim()).toBe(country.name);
      expect(country.name.length).toBeGreaterThan(0);
      expect(getNewsCountry(country.code)).toBe(country);
      expect(getNewsCountry(country.code.toUpperCase())).toBe(country);
    }
  });

  it("keeps camera centroids and heights in valid ranges", () => {
    for (const country of listNewsCountries()) {
      expect(country.centroid.latitude).toBeGreaterThanOrEqual(-90);
      expect(country.centroid.latitude).toBeLessThanOrEqual(90);
      expect(country.centroid.longitude).toBeGreaterThanOrEqual(-180);
      expect(country.centroid.longitude).toBeLessThanOrEqual(180);
      expect(country.cameraHeightMeters).toBeGreaterThan(0);
    }
  });

  it("provides a valid simplified boundary for every supported country", () => {
    for (const country of listNewsCountries()) {
      const boundary = getNewsCountryBoundary(country.code);

      expect(boundary).toBeDefined();
      expect(boundary?.countryCode).toBe(country.code);
      expect(boundary?.polygons.length).toBeGreaterThan(0);

      for (const polygon of boundary?.polygons ?? []) {
        expect(polygon.length).toBeGreaterThanOrEqual(4);
        expect(polygon[0]).toEqual(polygon[polygon.length - 1]);

        for (const [longitude, latitude] of polygon) {
          expect(longitude).toBeGreaterThanOrEqual(-180);
          expect(longitude).toBeLessThanOrEqual(180);
          expect(latitude).toBeGreaterThanOrEqual(-90);
          expect(latitude).toBeLessThanOrEqual(90);
        }
      }
    }
  });

  it("treats missing boundaries as no-data", () => {
    expect(getNewsCountry("zz")).toBeUndefined();
    expect(getNewsCountryBoundary("zz")).toBeUndefined();
  });

  it("has no boundary entries outside the supported country list", () => {
    const countryCodes = new Set(listNewsCountries().map((country) => country.code));

    for (const boundary of listNewsCountryBoundaries()) {
      expect(countryCodes.has(boundary.countryCode)).toBe(true);
    }
  });
});
