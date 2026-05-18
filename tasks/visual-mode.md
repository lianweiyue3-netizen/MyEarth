# Visual Mode Tasks

## Purpose

Define mutually exclusive visual modes and map each mode to imagery, labels, night lights, terrain emphasis, and overlay defaults.

## Dependencies

- [x] Shared `VisualModeId` and `LayerId` types are available.
- [x] Night lights layer interface is available.
- [x] Layer controller interface is available.

## Implementation Checklist

- [x] Create `src/layers/visualModes.ts`.
- [x] Define `VisualModeDefinition`.
- [x] Add satellite mode definition.
- [x] Add political/labeled mode definition.
- [x] Add night lights mode definition.
- [x] Add terrain emphasis mode definition.
- [x] Add clean globe mode definition.
- [x] Set labels default to true for political/labeled mode.
- [x] Enable Cesium Black Marble strategy for night lights mode.
- [x] Enable terrain emphasis flag for terrain emphasis mode.
- [x] Disable clutter layers by default for clean globe mode.
- [x] Set radar opacity between 0.45 and 0.7 where appropriate.
- [x] Export mode lookup by id.
- [x] Export ordered mode list for UI.

## Tests

- [x] Add Vitest coverage that all five modes exist.
- [x] Add Vitest coverage that mode ids are unique.
- [x] Add Vitest coverage that radar opacity is between 0 and 1.
- [x] Add Vitest coverage that night lights mode enables night lights.
- [x] Add Vitest coverage that clean globe disables nonessential overlays.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
