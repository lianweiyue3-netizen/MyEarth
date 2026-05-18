# Attribution Tasks

## Purpose

Keep Cesium, OpenStreetMap, RainViewer, NASA Black Marble, and imagery credits visible where required.

## Dependencies

- [ ] Cesium scene exposes credit display mounting strategy.
- [ ] Buildings layer can report active state.
- [ ] Weather radar layer can report active state.
- [ ] Night lights layer can report active state.
- [ ] CSS Modules setup is available.

## Implementation Checklist

- [ ] Create `src/ui/AttributionBar.tsx`.
- [ ] Create `src/ui/AttributionBar.module.css`.
- [ ] Preserve Cesium credit display.
- [ ] Mount Cesium credit container in attribution area when using custom placement.
- [ ] Render OpenStreetMap attribution when buildings are active.
- [ ] Render RainViewer attribution when weather radar is active.
- [ ] Render NASA Black Marble / Cesium attribution behavior when night lights are active.
- [ ] Keep attribution visible during intro orbit.
- [ ] Keep attribution visible on desktop layout.
- [ ] Keep attribution visible on tablet layout.
- [ ] Keep attribution visible on mobile layout.
- [ ] Avoid overlap with command controls.
- [ ] Fall back to Cesium default credit container if custom mounting fails.

## Tests

- [ ] Add React Testing Library coverage that attribution bar renders.
- [ ] Add React Testing Library coverage for RainViewer attribution active state.
- [ ] Add React Testing Library coverage for OpenStreetMap attribution active state.
- [ ] Add React Testing Library coverage for night lights attribution active state.
- [ ] Add Playwright viewport coverage that attribution remains visible on mobile.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
