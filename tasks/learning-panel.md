# Learning Panel Tasks

## Purpose

Display selected location education and general Earth-science content with accessible, collapsible presentation.

## Dependencies

- [x] Learning content is available.
- [x] Location content is available.
- [x] Layer action dispatch is available.
- [x] Accessibility focus helper is available.
- [x] CSS Modules setup is available.

## Implementation Checklist

- [x] Create `src/ui/LearningPanel.tsx`.
- [x] Create `src/ui/LearningPanel.module.css`.
- [x] Render selected wonder title.
- [x] Render selected wonder summary.
- [x] Render selected wonder facts.
- [x] Render selected wonder learning sections.
- [x] Render city title and shorter city content.
- [x] Render general topic fallback content.
- [x] Render suggested layer actions.
- [x] Emit layer command from suggested layer action.
- [x] Add mobile collapsed state.
- [x] Add accessible expanded/collapsed state.
- [x] Move focus to panel when opened from keyboard action.
- [x] Avoid focus trap.
- [x] Do not show inline citations in main UI.
- [x] Show aurora illustrative copy when aurora region is selected.

## Tests

- [x] Add React Testing Library coverage for wonder content rendering.
- [x] Add React Testing Library coverage for city content rendering.
- [x] Add React Testing Library coverage for fallback content.
- [x] Add React Testing Library coverage for suggested layer action.
- [x] Add React Testing Library coverage for collapse accessibility state.
- [x] Add React Testing Library coverage for keyboard-open focus behavior.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
