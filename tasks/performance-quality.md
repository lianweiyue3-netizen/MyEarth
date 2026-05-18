# Performance Quality Tasks

## Purpose

Select initial quality, monitor frame health, and apply fallback while preserving globe readability and smooth interaction.

## Dependencies

- [x] Layer controller interface is available.
- [x] Jotai quality atoms are available.
- [x] Accessibility reduced-motion state is available.

## Implementation Checklist

- [x] Create `src/performance/qualityController.ts`.
- [x] Create `src/performance/frameHealthMonitor.ts`.
- [x] Create `src/performance/deviceProfile.ts`.
- [x] Define `QualityProfile`.
- [x] Implement device memory detection with fallback.
- [x] Implement hardware concurrency detection with fallback.
- [x] Implement mobile/touch context detection.
- [x] Implement WebGL capability bucket detection.
- [x] Compute high, balanced, and low profiles.
- [x] Compute auto effective tier.
- [x] Apply transition scale from reduced motion.
- [x] Monitor frame timing.
- [x] Add hysteresis for runtime downgrade.
- [x] Reduce cinematic extras first.
- [x] Disable or simplify clouds second.
- [x] Disable aurora third.
- [x] Reduce or disable radar fourth.
- [x] Disable buildings fifth.
- [x] Reduce terrain detail sixth.
- [x] Update quality indicator state after changes.

## Tests

- [x] Add Vitest coverage for initial tier mapping.
- [x] Add Vitest coverage for missing device API fallback.
- [x] Add Vitest coverage for fallback order.
- [x] Add Vitest coverage for user-selected low profile.
- [x] Add Vitest coverage for hysteresis.
- [x] Add Vitest coverage for reduced-motion transition scaling.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
