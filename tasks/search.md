# Search Tasks

## Purpose

Use Cesium ion geocoding for accessible global search and emit camera commands for selected results.

## Dependencies

- [x] Configuration module exposes Cesium token state.
- [x] Camera command types are available.
- [x] Accessibility live region helper is available.

## Implementation Checklist

- [x] Create `src/search/searchService.ts`.
- [x] Create `src/search/cesiumGeocoderAdapter.ts`.
- [x] Define `SearchResult`.
- [x] Define `SearchService`.
- [x] Implement empty-query short circuit.
- [x] Implement Cesium ion geocoder call.
- [x] Normalize geocoder results into `SearchResult`.
- [x] Include destination latitude and longitude for each selectable result.
- [x] Support `AbortSignal` where practical.
- [x] Ignore stale results when newer query exists.
- [x] Return disabled state when token is missing.
- [x] Ensure query text is not persisted.
- [x] Ensure query text is not sent to telemetry.
- [x] Emit camera command on result selection.

## Tests

- [x] Add Vitest coverage that empty query does not call geocoder.
- [x] Add Vitest coverage for result normalization.
- [x] Add Vitest coverage for stale request ignoring.
- [x] Add Vitest coverage for missing-token disabled behavior.
- [x] Add Vitest coverage that telemetry receives no query text.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
