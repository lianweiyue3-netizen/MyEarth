# Accessibility Tasks

## Purpose

Provide reduced-motion detection, live region announcements, focus management, and reusable accessible control patterns.

## Dependencies

- [x] React app scaffold exists.
- [x] CSS token system includes focus styles.

## Implementation Checklist

- [x] Create `src/accessibility/reducedMotion.ts`.
- [x] Create `src/accessibility/liveRegion.ts`.
- [x] Create `src/accessibility/focusManagement.ts`.
- [x] Implement `useReducedMotion`.
- [x] Implement `announceStatus`.
- [x] Implement `moveFocusToPanel`.
- [x] Add global live region mount point.
- [x] Add visible focus token styles.
- [x] Add helper for icon-only accessible names.
- [x] Add helper or pattern for toggle pressed state.
- [x] Ensure reduced motion affects camera transitions.
- [x] Ensure reduced motion affects overlay entrance animation.
- [x] Ensure reduced motion affects aurora animation.
- [x] Ensure reduced motion affects cloud animation.
- [x] Provide semantic alternatives for search, tour, reset, locations, and layer toggles.

## Tests

- [x] Add Vitest coverage for reduced-motion media query true.
- [x] Add Vitest coverage for reduced-motion media query false.
- [x] Add Vitest coverage for missing media query fallback.
- [x] Add Vitest coverage for live region message update.
- [x] Add Vitest coverage for focus target success.
- [x] Add Vitest coverage for missing focus target behavior.
- [x] Add component accessibility checks for icon-only controls.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
