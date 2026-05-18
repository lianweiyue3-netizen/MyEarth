# Camera Presets Tasks

## Purpose

Define validated named camera presets for global views, wonders, cities, and search fallback behavior.

## Dependencies

- [x] Shared camera types are available.
- [x] Location content ids are finalized.

## Implementation Checklist

- [x] Create `src/camera/cameraPresets.ts`.
- [x] Define `CameraPreset` type.
- [x] Add `initial-global` preset.
- [x] Add `reset-global` preset.
- [x] Add search-result fallback preset.
- [x] Add Mount Everest preset.
- [x] Add Grand Canyon preset.
- [x] Add Amazon Rainforest preset.
- [x] Add Great Barrier Reef preset.
- [x] Add Sahara Desert preset.
- [x] Add Antarctica preset.
- [x] Add Himalayas preset.
- [x] Add Aurora region preset.
- [x] Add New York City preset.
- [x] Add Tokyo preset.
- [x] Add London preset.
- [x] Add Paris preset.
- [x] Add Dubai preset.
- [x] Add San Francisco preset.
- [x] Add Singapore preset.
- [x] Implement preset lookup by id.
- [x] Implement preset validation helper.

## Tests

- [x] Add Vitest coverage that every preset validates.
- [x] Add Vitest coverage that initial and reset presets exist.
- [x] Add Vitest coverage that reduced-motion duration is not longer than default.
- [x] Add Vitest coverage that heights are finite positive numbers.
- [x] Add Vitest coverage that pitch and heading are finite.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
