# Search Tasks

## Purpose

Use Cesium ion geocoding for accessible global search and emit camera commands for selected results.

## Dependencies

- [ ] Configuration module exposes Cesium token state.
- [ ] Camera command types are available.
- [ ] Accessibility live region helper is available.

## Implementation Checklist

- [ ] Create `src/search/searchService.ts`.
- [ ] Create `src/search/cesiumGeocoderAdapter.ts`.
- [ ] Define `SearchResult`.
- [ ] Define `SearchService`.
- [ ] Implement empty-query short circuit.
- [ ] Implement Cesium ion geocoder call.
- [ ] Normalize geocoder results into `SearchResult`.
- [ ] Include destination latitude and longitude for each selectable result.
- [ ] Support `AbortSignal` where practical.
- [ ] Ignore stale results when newer query exists.
- [ ] Return disabled state when token is missing.
- [ ] Ensure query text is not persisted.
- [ ] Ensure query text is not sent to telemetry.
- [ ] Emit camera command on result selection.

## Tests

- [ ] Add Vitest coverage that empty query does not call geocoder.
- [ ] Add Vitest coverage for result normalization.
- [ ] Add Vitest coverage for stale request ignoring.
- [ ] Add Vitest coverage for missing-token disabled behavior.
- [ ] Add Vitest coverage that telemetry receives no query text.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
