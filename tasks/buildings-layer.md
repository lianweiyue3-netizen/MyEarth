# Buildings Layer Tasks

## Purpose

Load Cesium OSM Buildings opportunistically for secondary city descents without blocking city fly-to behavior.

## Dependencies

- [ ] Layer adapter interface is available.
- [ ] Cesium ion token handling is available.
- [ ] Attribution module interface is available.
- [ ] Location content marks city records with building descent preference.

## Implementation Checklist

- [ ] Create `src/layers/buildingsLayer.ts`.
- [ ] Implement buildings adapter using `CesiumLayerAdapter`.
- [ ] Keep buildings disabled during first render.
- [ ] Lazy load buildings when toggle is enabled.
- [ ] Lazy load buildings when city fly-to requests them.
- [ ] Use Cesium OSM Buildings where available.
- [ ] Set OpenStreetMap attribution active when buildings are enabled.
- [ ] Disable buildings when quality profile sets buildings off.
- [ ] Report missing token as disabled buildings availability.
- [ ] Report load failure as recoverable failed availability.
- [ ] Keep city fly-to independent from buildings success.

## Tests

- [ ] Add Vitest coverage that buildings are lazy loaded.
- [ ] Add Vitest coverage that city request triggers buildings load.
- [ ] Add Vitest coverage that buildings failure does not reject city transition.
- [ ] Add Vitest coverage that attribution state updates when buildings are active.
- [ ] Add Vitest coverage that low quality disables buildings.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
