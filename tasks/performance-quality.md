# Performance Quality Tasks

## Purpose

Select initial quality, monitor frame health, and apply fallback while preserving globe readability and smooth interaction.

## Dependencies

- [ ] Layer controller interface is available.
- [ ] Jotai quality atoms are available.
- [ ] Accessibility reduced-motion state is available.

## Implementation Checklist

- [ ] Create `src/performance/qualityController.ts`.
- [ ] Create `src/performance/frameHealthMonitor.ts`.
- [ ] Create `src/performance/deviceProfile.ts`.
- [ ] Define `QualityProfile`.
- [ ] Implement device memory detection with fallback.
- [ ] Implement hardware concurrency detection with fallback.
- [ ] Implement mobile/touch context detection.
- [ ] Implement WebGL capability bucket detection.
- [ ] Compute high, balanced, and low profiles.
- [ ] Compute auto effective tier.
- [ ] Apply transition scale from reduced motion.
- [ ] Monitor frame timing.
- [ ] Add hysteresis for runtime downgrade.
- [ ] Reduce cinematic extras first.
- [ ] Disable or simplify clouds second.
- [ ] Disable aurora third.
- [ ] Reduce or disable radar fourth.
- [ ] Disable buildings fifth.
- [ ] Reduce terrain detail sixth.
- [ ] Update quality indicator state after changes.

## Tests

- [ ] Add Vitest coverage for initial tier mapping.
- [ ] Add Vitest coverage for missing device API fallback.
- [ ] Add Vitest coverage for fallback order.
- [ ] Add Vitest coverage for user-selected low profile.
- [ ] Add Vitest coverage for hysteresis.
- [ ] Add Vitest coverage for reduced-motion transition scaling.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
