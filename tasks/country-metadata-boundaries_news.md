# Country Metadata And Boundaries Tasks

## Purpose

Provide supported news countries, display metadata, camera centroids, camera heights, and simplified country boundaries for the heatmap.

## Dependencies

- [x] News domain types are available.
- [x] GNews-supported country code list is selected for v1.
- [x] Simplified GeoJSON source is chosen and license is acceptable for the project.

## Implementation Checklist

- [x] Create a country metadata module.
- [x] Define `NewsCountryDefinition`.
- [x] Define `NewsCountryBoundary`.
- [x] Add `getNewsCountry(code)`.
- [x] Add `getNewsCountryBoundary(code)`.
- [x] Add `listNewsCountries()`.
- [x] Bundle simplified GeoJSON country polygons.
- [x] Map each supported country code to one boundary feature.
- [x] Add camera centroid for each supported country.
- [x] Add camera height for each supported country.
- [x] Omit countries that lack usable boundaries from heatmap rendering.
- [x] Keep boundary data independent from network access.

## Tests

- [x] Add Vitest coverage for unique country codes.
- [x] Add Vitest coverage for valid display names.
- [x] Add Vitest coverage for latitude and longitude ranges.
- [x] Add Vitest coverage for valid camera heights.
- [x] Add Vitest coverage that every heatmap-enabled country has at least one polygon.
- [x] Add Vitest coverage that missing boundaries are treated as no-data.

## Done Criteria

- [x] Country metadata is deterministic and network-free.
- [x] Boundary fixtures are small enough for the browser bundle.
- [x] Independent tests for this module pass.
