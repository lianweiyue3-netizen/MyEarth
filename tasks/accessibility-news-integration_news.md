# Accessibility News Integration Tasks

## Purpose

Make the news feature usable without relying only on the Cesium canvas heatmap.

## Dependencies

- [x] News panel component is available.
- [x] Command overlay news integration is available.
- [x] Existing live-region and focus-management patterns are understood.

## Implementation Checklist

- [x] Make News button keyboard operable.
- [x] Make News layer toggle keyboard operable.
- [x] Make country list keyboard operable.
- [x] Make article links keyboard operable.
- [x] Use semantic heading structure in News panel.
- [x] Use semantic list structure for countries.
- [x] Use semantic list structure for articles.
- [x] Announce News loading state.
- [x] Announce News unavailable state.
- [x] Announce selected country state.
- [x] Provide country headline counts in HTML.
- [x] Provide country list alternative to canvas picking.
- [x] Move focus to News panel after country selection.
- [x] Preserve reduced-motion behavior for camera movement where existing camera command handling supports it.

## Tests

- [x] Add React Testing Library coverage for keyboard opening News panel.
- [x] Add React Testing Library coverage for keyboard country selection.
- [x] Add React Testing Library coverage for accessible News status text.
- [x] Add React Testing Library coverage for article link accessible names.
- [x] Add React Testing Library coverage for focus move after country selection.
- [x] Add Playwright smoke coverage for keyboard-accessible News control.

## Done Criteria

- [x] Canvas heatmap has an HTML equivalent for browsing.
- [x] News UI follows existing accessibility patterns.
- [x] Independent tests for accessibility pass.
