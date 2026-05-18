# Search Control Tasks

## Purpose

Provide accessible global search UI with debounced results, keyboard navigation, and status announcements.

## Dependencies

- [x] Search service is available.
- [x] Camera command dispatch is available.
- [x] Accessibility live region helper is available.
- [x] CSS Modules setup is available.

## Implementation Checklist

- [x] Create `src/ui/SearchControl.tsx`.
- [x] Create `src/ui/SearchControl.module.css`.
- [x] Add accessible input label.
- [x] Add debounced query state.
- [x] Call search service after debounce.
- [x] Render loading state.
- [x] Render empty state.
- [x] Render error state.
- [x] Render results as keyboard-navigable listbox.
- [x] Implement ArrowDown active result movement.
- [x] Implement ArrowUp active result movement.
- [x] Implement Enter to select active result.
- [x] Implement Escape to close results.
- [x] Announce search errors through live region.
- [x] Emit camera command on selection.
- [x] Avoid persisting query text.

## Tests

- [x] Add React Testing Library coverage for accessible input name.
- [x] Add React Testing Library coverage for debounced service call.
- [x] Add React Testing Library coverage for arrow key navigation.
- [x] Add React Testing Library coverage for Enter selection.
- [x] Add React Testing Library coverage for Escape close.
- [x] Add React Testing Library coverage for live-region error announcement.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
