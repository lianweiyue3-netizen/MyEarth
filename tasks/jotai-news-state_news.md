# Jotai News State Tasks

## Purpose

Store serializable news UI state and integrate the `newsHeatmap` layer with existing app state.

## Dependencies

- [x] News domain types are available.
- [x] Existing Jotai app state patterns are understood.
- [x] Existing layer visibility and availability actions are understood.

## Implementation Checklist

- [x] Add `newsHeatmap` to `LayerId`.
- [x] Add `newsHeatmap` to ordered layer ids.
- [x] Add default layer visibility `newsHeatmap: false`.
- [x] Add default layer availability disabled reason for unloaded news.
- [x] Add `newsStateAtom`.
- [x] Add selected news country state through `NewsState`.
- [x] Add select news country action.
- [x] Reject unknown selected country codes.
- [x] Clear selected country when a new snapshot does not contain it.
- [x] Ensure news state stores no Cesium objects.
- [x] Ensure news state stores no provider client objects.

## Tests

- [x] Add Vitest coverage that defaults are serializable.
- [x] Add Vitest coverage that news heatmap is off by default.
- [x] Add Vitest coverage for selecting a known country.
- [x] Add Vitest coverage for rejecting unknown country.
- [x] Add Vitest coverage that news state updates do not mutate unrelated layer state.
- [x] Add Vitest coverage that Cesium-like objects are rejected by serializability checks.

## Done Criteria

- [x] Jotai state remains serializable.
- [x] Existing layer state behavior remains unchanged.
- [x] Independent tests for this module pass.
