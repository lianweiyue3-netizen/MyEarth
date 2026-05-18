# Attribution Tasks

## Purpose

Keep Cesium, OpenStreetMap, RainViewer, NASA Black Marble, and imagery credits visible where required.

## Dependencies

- [x] Cesium scene exposes credit display mounting strategy.
- [x] Buildings layer can report active state.
- [x] Weather radar layer can report active state.
- [x] Night lights layer can report active state.
- [x] CSS Modules setup is available.

## Implementation Checklist

- [x] Create `src/ui/AttributionBar.tsx`.
- [x] Create `src/ui/AttributionBar.module.css`.
- [x] Preserve Cesium credit display.
- [x] Mount Cesium credit container in attribution area when using custom placement.
- [x] Render OpenStreetMap attribution when buildings are active.
- [x] Render RainViewer attribution when weather radar is active.
- [x] Render NASA Black Marble / Cesium attribution behavior when night lights are active.
- [x] Keep attribution visible during intro orbit.
- [x] Keep attribution visible on desktop layout.
- [x] Keep attribution visible on tablet layout.
- [x] Keep attribution visible on mobile layout.
- [x] Avoid overlap with command controls.
- [x] Fall back to Cesium default credit container if custom mounting fails.

## Tests

- [x] Add React Testing Library coverage that attribution bar renders.
- [x] Add React Testing Library coverage for RainViewer attribution active state.
- [x] Add React Testing Library coverage for OpenStreetMap attribution active state.
- [x] Add React Testing Library coverage for night lights attribution active state.
- [x] Add Playwright viewport coverage that attribution remains visible on mobile.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
