# Learning Panel Tasks

## Purpose

Display selected location education and general Earth-science content with accessible, collapsible presentation.

## Dependencies

- [ ] Learning content is available.
- [ ] Location content is available.
- [ ] Layer action dispatch is available.
- [ ] Accessibility focus helper is available.
- [ ] CSS Modules setup is available.

## Implementation Checklist

- [ ] Create `src/ui/LearningPanel.tsx`.
- [ ] Create `src/ui/LearningPanel.module.css`.
- [ ] Render selected wonder title.
- [ ] Render selected wonder summary.
- [ ] Render selected wonder facts.
- [ ] Render selected wonder learning sections.
- [ ] Render city title and shorter city content.
- [ ] Render general topic fallback content.
- [ ] Render suggested layer actions.
- [ ] Emit layer command from suggested layer action.
- [ ] Add mobile collapsed state.
- [ ] Add accessible expanded/collapsed state.
- [ ] Move focus to panel when opened from keyboard action.
- [ ] Avoid focus trap.
- [ ] Do not show inline citations in main UI.
- [ ] Show aurora illustrative copy when aurora region is selected.

## Tests

- [ ] Add React Testing Library coverage for wonder content rendering.
- [ ] Add React Testing Library coverage for city content rendering.
- [ ] Add React Testing Library coverage for fallback content.
- [ ] Add React Testing Library coverage for suggested layer action.
- [ ] Add React Testing Library coverage for collapse accessibility state.
- [ ] Add React Testing Library coverage for keyboard-open focus behavior.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
