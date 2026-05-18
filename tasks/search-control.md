# Search Control Tasks

## Purpose

Provide accessible global search UI with debounced results, keyboard navigation, and status announcements.

## Dependencies

- [ ] Search service is available.
- [ ] Camera command dispatch is available.
- [ ] Accessibility live region helper is available.
- [ ] CSS Modules setup is available.

## Implementation Checklist

- [ ] Create `src/ui/SearchControl.tsx`.
- [ ] Create `src/ui/SearchControl.module.css`.
- [ ] Add accessible input label.
- [ ] Add debounced query state.
- [ ] Call search service after debounce.
- [ ] Render loading state.
- [ ] Render empty state.
- [ ] Render error state.
- [ ] Render results as keyboard-navigable listbox.
- [ ] Implement ArrowDown active result movement.
- [ ] Implement ArrowUp active result movement.
- [ ] Implement Enter to select active result.
- [ ] Implement Escape to close results.
- [ ] Announce search errors through live region.
- [ ] Emit camera command on selection.
- [ ] Avoid persisting query text.

## Tests

- [ ] Add React Testing Library coverage for accessible input name.
- [ ] Add React Testing Library coverage for debounced service call.
- [ ] Add React Testing Library coverage for arrow key navigation.
- [ ] Add React Testing Library coverage for Enter selection.
- [ ] Add React Testing Library coverage for Escape close.
- [ ] Add React Testing Library coverage for live-region error announcement.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
