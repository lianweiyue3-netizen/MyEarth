# Location List Tasks

## Purpose

Provide quick access to primary wonders and secondary city shortcuts.

## Dependencies

- [x] Location content is available.
- [x] Camera command dispatch is available.
- [x] Buildings request action is available.
- [x] CSS Modules setup is available.

## Implementation Checklist

- [x] Create `src/ui/LocationList.tsx`.
- [x] Create `src/ui/LocationList.module.css`.
- [x] Render eight wonders in primary group.
- [x] Render seven cities in secondary group.
- [x] Place wonders before cities in DOM order.
- [x] Apply stronger visual hierarchy to wonders.
- [x] Apply secondary visual hierarchy to cities.
- [x] Emit selected location id on wonder selection.
- [x] Emit wonder fly-to command on wonder selection.
- [x] Emit selected location id on city selection.
- [x] Emit city fly-to command on city selection.
- [x] Request buildings opportunistically on city selection.
- [x] Keep city selection successful if buildings fail.
- [x] Provide accessible labels for grouped lists.

## Tests

- [x] Add React Testing Library coverage that all eight wonders render.
- [x] Add React Testing Library coverage that all seven cities render.
- [x] Add React Testing Library coverage that wonders appear before cities.
- [x] Add React Testing Library coverage for wonder selection.
- [x] Add React Testing Library coverage for city selection.
- [x] Add React Testing Library coverage that city selection does not require buildings success.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
