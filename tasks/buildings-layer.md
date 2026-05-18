# Buildings Layer Tasks

## Purpose

Load Cesium OSM Buildings opportunistically for secondary city descents without blocking city fly-to behavior.

## Dependencies

- [x] Layer adapter interface is available.
- [x] Cesium ion token handling is available.
- [x] Attribution module interface is available.
- [x] Location content marks city records with building descent preference.

## Implementation Checklist

- [x] Create `src/layers/buildingsLayer.ts`.
- [x] Implement buildings adapter using `CesiumLayerAdapter`.
- [x] Keep buildings disabled during first render.
- [x] Lazy load buildings when toggle is enabled.
- [x] Lazy load buildings when city fly-to requests them.
- [x] Use Cesium OSM Buildings where available.
- [x] Set OpenStreetMap attribution active when buildings are enabled.
- [x] Disable buildings when quality profile sets buildings off.
- [x] Report missing token as disabled buildings availability.
- [x] Report load failure as recoverable failed availability.
- [x] Keep city fly-to independent from buildings success.

## Tests

- [x] Add Vitest coverage that buildings are lazy loaded.
- [x] Add Vitest coverage that city request triggers buildings load.
- [x] Add Vitest coverage that buildings failure does not reject city transition.
- [x] Add Vitest coverage that attribution state updates when buildings are active.
- [x] Add Vitest coverage that low quality disables buildings.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
