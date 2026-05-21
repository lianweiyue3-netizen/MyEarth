# Layer Toggle News Integration Tasks

## Purpose

Expose News in the existing Layers panel as the `newsHeatmap` layer toggle.

## Dependencies

- [x] `newsHeatmap` layer id exists.
- [x] Jotai layer defaults include `newsHeatmap`.
- [x] Layer controller news integration is available.

## Implementation Checklist

- [x] Add `newsHeatmap` to visible layer toggle ids.
- [x] Add visible label `News`.
- [x] Read `newsHeatmap` layer visibility.
- [x] Read `newsHeatmap` layer availability.
- [x] Disable News toggle when availability is disabled.
- [x] Disable News toggle when availability is failed.
- [x] Show disabled or failed reason below toggle grid.
- [x] Route News toggle through normal `onToggle`.
- [x] Ensure News toggle does not call `onSoundToggle`.
- [x] Keep existing Radar toggle behavior.
- [x] Keep existing Sound toggle behavior.

## Tests

- [x] Add React Testing Library coverage that News toggle appears.
- [x] Add React Testing Library coverage that News starts off.
- [x] Add React Testing Library coverage for disabled reason.
- [x] Add React Testing Library coverage that enabled News calls `onToggle("newsHeatmap", true)`.
- [x] Add React Testing Library coverage that News does not call sound toggle.

## Done Criteria

- [x] News layer appears consistently with existing layer controls.
- [x] Existing layer toggle tests still pass.
- [x] Independent tests for this component integration pass.
