# Command Overlay UI Tasks

## Purpose

Compose all visible controls over the globe without owning Cesium behavior.

## Dependencies

- [x] Jotai app state atoms are available.
- [x] UI child components are available or stubbed.
- [x] CSS Modules setup is available.
- [x] Accessibility helpers are available.

## Implementation Checklist

- [x] Create `src/ui/CommandOverlay.tsx`.
- [x] Create `src/ui/CommandOverlay.module.css`.
- [x] Render top app/title cluster.
- [x] Render search control.
- [x] Render primary wonder tour control.
- [x] Render visual mode selector.
- [x] Render layer toggle panel.
- [x] Render learning panel.
- [x] Render location quick list.
- [x] Render reset view button.
- [x] Render quality indicator.
- [x] Render sound consent control.
- [x] Render attribution bar.
- [x] Fade or slide overlay in after first frame.
- [x] Keep desktop center globe visible.
- [x] Collapse side panels for tablet layout.
- [x] Use compact top and bottom controls for mobile layout.
- [x] Respect safe-area insets.
- [x] Avoid nested cards.
- [x] Keep attribution unblocked.
- [x] Render disabled states before viewer ready.

## Tests

- [x] Add React Testing Library coverage that all required controls render.
- [x] Add React Testing Library coverage for disabled pre-viewer state.
- [x] Add React Testing Library coverage that reset emits command.
- [x] Add Playwright viewport test for mobile panel behavior.
- [x] Add Playwright viewport test that controls do not cover attribution.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
