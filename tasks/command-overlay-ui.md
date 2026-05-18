# Command Overlay UI Tasks

## Purpose

Compose all visible controls over the globe without owning Cesium behavior.

## Dependencies

- [ ] Jotai app state atoms are available.
- [ ] UI child components are available or stubbed.
- [ ] CSS Modules setup is available.
- [ ] Accessibility helpers are available.

## Implementation Checklist

- [ ] Create `src/ui/CommandOverlay.tsx`.
- [ ] Create `src/ui/CommandOverlay.module.css`.
- [ ] Render top app/title cluster.
- [ ] Render search control.
- [ ] Render primary wonder tour control.
- [ ] Render visual mode selector.
- [ ] Render layer toggle panel.
- [ ] Render learning panel.
- [ ] Render location quick list.
- [ ] Render reset view button.
- [ ] Render quality indicator.
- [ ] Render sound consent control.
- [ ] Render attribution bar.
- [ ] Fade or slide overlay in after first frame.
- [ ] Keep desktop center globe visible.
- [ ] Collapse side panels for tablet layout.
- [ ] Use compact top and bottom controls for mobile layout.
- [ ] Respect safe-area insets.
- [ ] Avoid nested cards.
- [ ] Keep attribution unblocked.
- [ ] Render disabled states before viewer ready.

## Tests

- [ ] Add React Testing Library coverage that all required controls render.
- [ ] Add React Testing Library coverage for disabled pre-viewer state.
- [ ] Add React Testing Library coverage that reset emits command.
- [ ] Add Playwright viewport test for mobile panel behavior.
- [ ] Add Playwright viewport test that controls do not cover attribution.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
