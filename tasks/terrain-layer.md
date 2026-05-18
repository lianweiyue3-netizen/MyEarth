# Terrain Layer Tasks

## Purpose

Provide Cesium ion terrain with ellipsoid fallback for mountains, canyons, polar regions, and city descents.

## Dependencies

- [ ] Layer adapter interface is available.
- [ ] Viewer lifecycle provides token state.
- [ ] Quality profile type is available.

## Implementation Checklist

- [ ] Create `src/layers/terrainLayer.ts`.
- [ ] Implement terrain adapter using `CesiumLayerAdapter`.
- [ ] Initialize Cesium ion terrain when token is available.
- [ ] Initialize ellipsoid fallback when token is missing.
- [ ] Switch to ellipsoid fallback when terrain load fails.
- [ ] Implement terrain toggle on.
- [ ] Implement terrain toggle off.
- [ ] Report missing token as disabled terrain availability.
- [ ] Report terrain load failure as recoverable failed availability.
- [ ] Apply reduced terrain detail from quality profile when supported.
- [ ] Preserve imagery and camera controls after terrain failure.

## Tests

- [ ] Add Vitest coverage for token-backed terrain initialization.
- [ ] Add Vitest coverage for missing-token disabled state.
- [ ] Add Vitest coverage for terrain provider failure fallback.
- [ ] Add Vitest coverage for terrain toggle behavior.
- [ ] Add Vitest coverage that terrain failure does not throw through controller.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
