# Aurora Layer Tasks

## Purpose

Provide an illustrative polar aurora effect for education without using an external aurora API.

## Dependencies

- [ ] Layer adapter interface is available.
- [ ] Learning content includes aurora disclaimer.
- [ ] Quality profile type is available.
- [ ] Reduced-motion state is available.

## Implementation Checklist

- [ ] Create `src/layers/auroraLayer.ts`.
- [ ] Implement aurora adapter using `CesiumLayerAdapter`.
- [ ] Render aurora near polar regions.
- [ ] Avoid external aurora API calls.
- [ ] Implement aurora toggle on.
- [ ] Implement aurora toggle off.
- [ ] Use static or minimal effect when reduced motion is active.
- [ ] Simplify aurora in balanced fallback if needed.
- [ ] Disable aurora in low quality.
- [ ] Ensure aurora does not obscure controls, labels, or attribution.
- [ ] Report initialization failure as recoverable failed availability.

## Tests

- [ ] Add Vitest coverage for independent toggle behavior.
- [ ] Add Vitest coverage that no external API is called.
- [ ] Add Vitest coverage for low-quality off behavior.
- [ ] Add Vitest coverage for reduced-motion behavior.
- [ ] Add component/content test that aurora learning content includes illustrative disclaimer.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
