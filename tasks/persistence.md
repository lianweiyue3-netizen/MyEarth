# Persistence Tasks

## Purpose

Persist only allowed local browser preferences and reject corrupt or disallowed stored values.

## Dependencies

- [x] Shared `QualityMode` and `VisualModeId` types are available.
- [x] Jotai app state action helpers are available.

## Implementation Checklist

- [x] Create `src/persistence/preferences.ts`.
- [x] Define `UserPreferences`.
- [x] Define `PreferencesStore`.
- [x] Implement `load`.
- [x] Implement `save`.
- [x] Implement `clear`.
- [x] Persist `myearth.soundPreference`.
- [x] Persist `myearth.qualityMode`.
- [x] Persist `myearth.visualMode`.
- [x] Persist `myearth.reducedUi`.
- [x] Validate stored sound preference values.
- [x] Validate stored quality mode values.
- [x] Validate stored visual mode values.
- [x] Validate stored reduced UI value.
- [x] Ignore corrupt JSON.
- [x] Handle unavailable local storage.
- [x] Do not expose any API for search query persistence.
- [x] Do not expose any API for precise location persistence.
- [x] Do not expose any API for telemetry identifiers.

## Tests

- [x] Add Vitest coverage for loading valid preferences.
- [x] Add Vitest coverage for saving valid preferences.
- [x] Add Vitest coverage for invalid enum rejection.
- [x] Add Vitest coverage for corrupt JSON fallback.
- [x] Add Vitest coverage for unavailable local storage.
- [x] Add Vitest coverage that disallowed keys are not supported.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
