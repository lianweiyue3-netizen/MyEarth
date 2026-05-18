# Jotai App State Tasks

## Purpose

Store serializable UI and domain state in Jotai atoms while keeping Cesium and Web Audio objects out of app state.

## Dependencies

- [x] Shared domain types are defined.
- [x] Jotai dependency is installed.

## Implementation Checklist

- [x] Create `src/app/appAtoms.ts`.
- [x] Create `src/app/appActions.ts`.
- [x] Define `loadingPhaseAtom` with initial phase `boot`.
- [x] Define `cameraModeAtom` with initial mode `introOrbit`.
- [x] Define `selectedLocationIdAtom`.
- [x] Define `visualModeAtom` with initial mode `satellite`.
- [x] Define `qualityModeAtom` with initial mode `auto`.
- [x] Define `effectiveQualityAtom` using the default quality profile.
- [x] Define `layerVisibilityAtom` with required layer defaults.
- [x] Define `layerAvailabilityAtom` with default availability values.
- [x] Define `tourStateAtom` with idle state.
- [x] Define `soundStateAtom` with `notPrompted`.
- [x] Define `weatherStateAtom` with `idle`.
- [x] Define `accessibilityAtom` with reduced motion and reduced UI flags.
- [x] Add action helper to update one layer visibility without mutating others.
- [x] Add action helper to update one layer availability without mutating others.
- [x] Add action helper to select a valid location id.
- [x] Add action helper to clear selected location.

## Tests

- [x] Add Vitest coverage for default atom values.
- [x] Add Vitest coverage for layer visibility update isolation.
- [x] Add Vitest coverage for layer availability update isolation.
- [x] Add Vitest coverage for invalid location selection rejection.
- [x] Add a type-level guard or test helper proving Cesium objects are not stored in atoms.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
