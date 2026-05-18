# Night Lights Layer Tasks

## Purpose

Manage the Cesium ion Earth at Night / NASA Black Marble imagery layer for night lights mode.

## Dependencies

- [x] Layer adapter interface is available.
- [x] Visual mode definitions are available.
- [x] Cesium ion token handling is available.
- [x] Attribution module interface is available.

## Implementation Checklist

- [x] Create `src/layers/nightLightsLayer.ts`.
- [x] Implement night lights adapter.
- [x] Create Cesium ion imagery provider for Earth at Night / NASA Black Marble.
- [x] Add night lights imagery only when night lights mode is active.
- [x] Tune imagery alpha for readable globe display.
- [x] Tune brightness or contrast only through supported Cesium layer settings.
- [x] Remove or hide night lights layer when leaving night lights mode.
- [x] Preserve live-time sun lighting behavior.
- [x] Report missing token as disabled availability.
- [x] Report imagery load failure as recoverable failed availability.
- [x] Activate NASA Black Marble / Cesium attribution when layer is active.

## Tests

- [x] Add Vitest coverage that night mode requests night lights imagery.
- [x] Add Vitest coverage that leaving night mode hides or removes layer.
- [x] Add Vitest coverage for missing-token disabled state.
- [x] Add Vitest coverage for imagery failure fallback.
- [x] Add Vitest coverage that other imagery layers remain intact after failure.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
