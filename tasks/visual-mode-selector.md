# Visual Mode Selector Tasks

## Purpose

Provide accessible mutually exclusive selection among satellite, labels, night, terrain, and clean visual modes.

## Dependencies

- [ ] Visual mode definitions are available.
- [ ] Jotai visual mode atom is available.
- [ ] CSS Modules setup is available.

## Implementation Checklist

- [ ] Create `src/ui/VisualModeSelector.tsx`.
- [ ] Create `src/ui/VisualModeSelector.module.css`.
- [ ] Render all five visual modes.
- [ ] Use segmented control or tab semantics.
- [ ] Expose active selected state through ARIA.
- [ ] Add visible active state.
- [ ] Implement click selection.
- [ ] Implement keyboard navigation.
- [ ] Emit selected `VisualModeId`.
- [ ] Use short labels: Satellite, Labels, Night, Terrain, Clean.
- [ ] Prevent multiple active modes.

## Tests

- [ ] Add React Testing Library coverage that all modes render.
- [ ] Add React Testing Library coverage for click selection.
- [ ] Add React Testing Library coverage for keyboard selection.
- [ ] Add React Testing Library coverage for accessible selected state.
- [ ] Add React Testing Library coverage that only one mode is active.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
