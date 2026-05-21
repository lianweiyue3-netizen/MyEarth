# Layer Controller News Integration Tasks

## Purpose

Expose `newsHeatmap` through the existing layer controller and layer availability contract.

## Dependencies

- [x] Jotai news state has added `newsHeatmap`.
- [x] Cesium news heatmap layer adapter is available.
- [x] Existing layer controller tests are understood.

## Implementation Checklist

- [x] Register the news heatmap layer adapter.
- [x] Route `setLayerVisibility("newsHeatmap", true)` to the adapter.
- [x] Route `setLayerVisibility("newsHeatmap", false)` to the adapter.
- [x] Publish availability updates for `newsHeatmap`.
- [x] Keep news heatmap out of visual mode defaults.
- [x] Keep news heatmap independent from radar.
- [x] Keep news heatmap independent from labels.
- [x] Keep news heatmap independent from terrain.
- [x] Mark missing data as disabled with reason.
- [x] Mark adapter failure as recoverable failed availability.

## Tests

- [x] Add Vitest coverage that controller routes news visibility.
- [x] Add Vitest coverage that news availability is published.
- [x] Add Vitest coverage that missing data disables the layer.
- [x] Add Vitest coverage that adapter failure is recoverable.
- [x] Add Vitest coverage that toggling news does not mutate radar, labels, terrain, or sound.

## Done Criteria

- [x] Layer controller public behavior remains consistent.
- [x] News layer can be toggled without viewer recreation.
- [x] Independent tests for this module pass.
