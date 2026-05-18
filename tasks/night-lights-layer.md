# Night Lights Layer Tasks

## Purpose

Manage the Cesium ion Earth at Night / NASA Black Marble imagery layer for night lights mode.

## Dependencies

- [ ] Layer adapter interface is available.
- [ ] Visual mode definitions are available.
- [ ] Cesium ion token handling is available.
- [ ] Attribution module interface is available.

## Implementation Checklist

- [ ] Create `src/layers/nightLightsLayer.ts`.
- [ ] Implement night lights adapter.
- [ ] Create Cesium ion imagery provider for Earth at Night / NASA Black Marble.
- [ ] Add night lights imagery only when night lights mode is active.
- [ ] Tune imagery alpha for readable globe display.
- [ ] Tune brightness or contrast only through supported Cesium layer settings.
- [ ] Remove or hide night lights layer when leaving night lights mode.
- [ ] Preserve live-time sun lighting behavior.
- [ ] Report missing token as disabled availability.
- [ ] Report imagery load failure as recoverable failed availability.
- [ ] Activate NASA Black Marble / Cesium attribution when layer is active.

## Tests

- [ ] Add Vitest coverage that night mode requests night lights imagery.
- [ ] Add Vitest coverage that leaving night mode hides or removes layer.
- [ ] Add Vitest coverage for missing-token disabled state.
- [ ] Add Vitest coverage for imagery failure fallback.
- [ ] Add Vitest coverage that other imagery layers remain intact after failure.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
