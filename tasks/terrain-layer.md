# Terrain Layer Tasks

## Purpose

Provide Cesium ion terrain with ellipsoid fallback for mountains, canyons, polar regions, and city descents.

## Dependencies

- [x] Layer adapter interface is available.
- [x] Viewer lifecycle provides token state.
- [x] Quality profile type is available.

## Implementation Checklist

- [x] Create `src/layers/terrainLayer.ts`.
- [x] Implement terrain adapter using `CesiumLayerAdapter`.
- [x] Initialize Cesium ion terrain when token is available.
- [x] Initialize ellipsoid fallback when token is missing.
- [x] Switch to ellipsoid fallback when terrain load fails.
- [x] Implement terrain toggle on.
- [x] Implement terrain toggle off.
- [x] Report missing token as disabled terrain availability.
- [x] Report terrain load failure as recoverable failed availability.
- [x] Apply reduced terrain detail from quality profile when supported.
- [x] Preserve imagery and camera controls after terrain failure.

## Tests

- [x] Add Vitest coverage for token-backed terrain initialization.
- [x] Add Vitest coverage for missing-token disabled state.
- [x] Add Vitest coverage for terrain provider failure fallback.
- [x] Add Vitest coverage for terrain toggle behavior.
- [x] Add Vitest coverage that terrain failure does not throw through controller.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
