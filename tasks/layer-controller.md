# Layer Controller Tasks

## Purpose

Coordinate all Cesium visual layer adapters through a uniform interface and isolate optional layer failures.

## Dependencies

- [x] Cesium viewer lifecycle is available.
- [x] Visual mode definitions are available.
- [x] Quality profile type is available.
- [x] Individual layer adapters are available or stubbed.

## Implementation Checklist

- [x] Create `src/layers/layerController.ts`.
- [x] Create `src/layers/layerDefinitions.ts`.
- [x] Define `CesiumLayerAdapter`.
- [x] Define `LayerController`.
- [x] Register atmosphere adapter.
- [x] Register terrain adapter.
- [x] Register labels adapter.
- [x] Register buildings adapter.
- [x] Register weather radar adapter.
- [x] Register procedural clouds adapter.
- [x] Register aurora adapter.
- [x] Register night lights internal adapter.
- [x] Initialize baseline layers before optional layers.
- [x] Lazy initialize expensive optional layers.
- [x] Implement `setVisualMode`.
- [x] Implement `setLayerEnabled`.
- [x] Implement `getLayerAvailability`.
- [x] Implement `applyQualityProfile`.
- [x] Implement adapter disposal.
- [x] Route adapter failures to layer availability state.

## Tests

- [x] Add Vitest coverage that toggling one layer does not affect unrelated layers.
- [x] Add Vitest coverage that optional adapter failure is isolated.
- [x] Add Vitest coverage that visual mode changes call adapters without recreating viewer.
- [x] Add Vitest coverage that quality profile disables layers in fallback order.
- [x] Add Vitest coverage that disposal calls each initialized adapter.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
