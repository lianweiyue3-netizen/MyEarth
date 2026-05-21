# Cesium News Heatmap Layer Tasks

## Purpose

Render country-level news heatmap geometry on the Cesium globe and emit selected country codes.

## Dependencies

- [x] News domain types are available.
- [x] Country boundary data is available.
- [x] Layer adapter interface is available.
- [x] App shell selection handler is available.

## Implementation Checklist

- [x] Create `newsHeatmapLayer` module.
- [x] Define `NewsHeatmapLayerInput`.
- [x] Define `NewsCountryPick`.
- [x] Add Cesium entity or primitive creation for country polygons.
- [x] Render only countries with `headlineCount > 0`.
- [x] Skip countries with no boundary.
- [x] Compute heatmap alpha from headline count relative to max count.
- [x] Use readable fill color over satellite imagery.
- [x] Add selected country outline or stronger fill.
- [x] Add click or pick handling for country entities.
- [x] Emit selected country code on pick.
- [x] Hide or remove only news entities on layer disable.
- [x] Reuse current snapshot on layer re-enable.
- [x] Avoid network fetches from the Cesium layer.
- [x] Request Cesium render after layer changes.

## Tests

- [x] Add Cesium test double for entity creation.
- [x] Add Vitest coverage for creating entities for countries with headlines.
- [x] Add Vitest coverage for skipping zero-headline countries.
- [x] Add Vitest coverage for skipping missing-boundary countries.
- [x] Add Vitest coverage for alpha scaling.
- [x] Add Vitest coverage for selected country styling.
- [x] Add Vitest coverage for removing or hiding entities.
- [x] Add Vitest coverage for emitting selected country code on pick.
- [x] Add Vitest coverage that viewer is not recreated when news data changes.

## Done Criteria

- [x] Heatmap layer is independent from provider and cache modules.
- [x] Heatmap failure is recoverable.
- [x] Independent tests for this module pass.
