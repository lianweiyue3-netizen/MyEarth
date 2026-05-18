# Location Content Tasks

## Purpose

Define curated natural wonders and secondary city shortcuts as typed, validated static content.

## Dependencies

- [x] Shared `LayerId` type is available.
- [x] Camera presets are available.
- [x] Educational source notes are available.

## Implementation Checklist

- [x] Create `src/content/contentTypes.ts`.
- [x] Create `src/content/locations.ts`.
- [x] Create `src/content/validateContent.ts`.
- [x] Define `LearningTopic`.
- [x] Define `EarthLocation`.
- [x] Add Mount Everest record with at least three facts.
- [x] Add Grand Canyon record with at least three facts.
- [x] Add Amazon Rainforest record with at least three facts.
- [x] Add Great Barrier Reef record with at least three facts.
- [x] Add Sahara Desert record with at least three facts.
- [x] Add Antarctica record with at least three facts.
- [x] Add Himalayas record with at least three facts.
- [x] Add Aurora region record with at least three facts.
- [x] Add New York City record.
- [x] Add Tokyo record.
- [x] Add London record.
- [x] Add Paris record.
- [x] Add Dubai record.
- [x] Add San Francisco record.
- [x] Add Singapore record.
- [x] Set `buildingDescentPreferred` to true for all city records.
- [x] Add valid coordinates for every location.
- [x] Add valid `cameraPresetId` for every location.
- [x] Add valid `suggestedLayers` for every location.
- [x] Add source note references for every factual record.
- [x] Export ordered wonder list.
- [x] Export ordered city list.
- [x] Export location lookup by id.

## Tests

- [x] Add Vitest coverage that all eight wonders exist exactly once.
- [x] Add Vitest coverage that all seven cities exist exactly once.
- [x] Add Vitest coverage that wonders have at least three facts.
- [x] Add Vitest coverage for coordinate bounds.
- [x] Add Vitest coverage for camera preset references.
- [x] Add Vitest coverage for source note references.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
