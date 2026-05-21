# Attribution News Integration Tasks

## Purpose

Show GNews and article source attribution without breaking existing attribution behavior.

## Dependencies

- [x] News state is available.
- [x] `newsHeatmap` layer visibility is available.
- [x] Existing attribution bar behavior is understood.

## Implementation Checklist

- [x] Add GNews attribution when `newsHeatmap` is enabled and news snapshot is ready.
- [x] Hide GNews attribution when `newsHeatmap` is off.
- [x] Keep RainViewer attribution unchanged.
- [x] Keep NASA Black Marble attribution unchanged.
- [x] Keep OpenStreetMap attribution unchanged.
- [x] Keep Cesium credits text unchanged.
- [x] Ensure News panel displays article source names.
- [x] Ensure attribution bar stays visible with News panel open.

## Tests

- [x] Add React Testing Library coverage that GNews attribution appears when News is active.
- [x] Add React Testing Library coverage that GNews attribution is hidden when News is off.
- [x] Add React Testing Library coverage that RainViewer attribution still appears for radar.
- [x] Add React Testing Library coverage that source names appear in News panel.
- [x] Add Playwright coverage that attribution remains visible in viewport.

## Done Criteria

- [x] GNews/source attribution is visible where required.
- [x] Existing attribution behavior is unchanged.
- [x] Independent tests for this integration pass.
