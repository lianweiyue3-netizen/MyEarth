# Layer Controller Tasks

## Purpose

Coordinate all Cesium visual layer adapters through a uniform interface and isolate optional layer failures.

## Dependencies

- [ ] Cesium viewer lifecycle is available.
- [ ] Visual mode definitions are available.
- [ ] Quality profile type is available.
- [ ] Individual layer adapters are available or stubbed.

## Implementation Checklist

- [ ] Create `src/layers/layerController.ts`.
- [ ] Create `src/layers/layerDefinitions.ts`.
- [ ] Define `CesiumLayerAdapter`.
- [ ] Define `LayerController`.
- [ ] Register atmosphere adapter.
- [ ] Register terrain adapter.
- [ ] Register labels adapter.
- [ ] Register buildings adapter.
- [ ] Register weather radar adapter.
- [ ] Register procedural clouds adapter.
- [ ] Register aurora adapter.
- [ ] Register night lights internal adapter.
- [ ] Initialize baseline layers before optional layers.
- [ ] Lazy initialize expensive optional layers.
- [ ] Implement `setVisualMode`.
- [ ] Implement `setLayerEnabled`.
- [ ] Implement `getLayerAvailability`.
- [ ] Implement `applyQualityProfile`.
- [ ] Implement adapter disposal.
- [ ] Route adapter failures to layer availability state.

## Tests

- [ ] Add Vitest coverage that toggling one layer does not affect unrelated layers.
- [ ] Add Vitest coverage that optional adapter failure is isolated.
- [ ] Add Vitest coverage that visual mode changes call adapters without recreating viewer.
- [ ] Add Vitest coverage that quality profile disables layers in fallback order.
- [ ] Add Vitest coverage that disposal calls each initialized adapter.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
