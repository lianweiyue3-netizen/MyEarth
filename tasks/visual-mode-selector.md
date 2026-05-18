# Visual Mode Selector Tasks

## Purpose

Provide accessible mutually exclusive selection among satellite, labels, night, terrain, and clean visual modes.

## Dependencies

- [x] Visual mode definitions are available.
- [x] Jotai visual mode atom is available.
- [x] CSS Modules setup is available.

## Implementation Checklist

- [x] Create `src/ui/VisualModeSelector.tsx`.
- [x] Create `src/ui/VisualModeSelector.module.css`.
- [x] Render all five visual modes.
- [x] Use segmented control or tab semantics.
- [x] Expose active selected state through ARIA.
- [x] Add visible active state.
- [x] Implement click selection.
- [x] Implement keyboard navigation.
- [x] Emit selected `VisualModeId`.
- [x] Use short labels: Satellite, Labels, Night, Terrain, Clean.
- [x] Prevent multiple active modes.

## Tests

- [x] Add React Testing Library coverage that all modes render.
- [x] Add React Testing Library coverage for click selection.
- [x] Add React Testing Library coverage for keyboard selection.
- [x] Add React Testing Library coverage for accessible selected state.
- [x] Add React Testing Library coverage that only one mode is active.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
