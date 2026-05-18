# Aurora Layer Tasks

## Purpose

Provide an illustrative polar aurora effect for education without using an external aurora API.

## Dependencies

- [x] Layer adapter interface is available.
- [x] Learning content includes aurora disclaimer.
- [x] Quality profile type is available.
- [x] Reduced-motion state is available.

## Implementation Checklist

- [x] Create `src/layers/auroraLayer.ts`.
- [x] Implement aurora adapter using `CesiumLayerAdapter`.
- [x] Render aurora near polar regions.
- [x] Avoid external aurora API calls.
- [x] Implement aurora toggle on.
- [x] Implement aurora toggle off.
- [x] Use static or minimal effect when reduced motion is active.
- [x] Simplify aurora in balanced fallback if needed.
- [x] Disable aurora in low quality.
- [x] Ensure aurora does not obscure controls, labels, or attribution.
- [x] Report initialization failure as recoverable failed availability.

## Tests

- [x] Add Vitest coverage for independent toggle behavior.
- [x] Add Vitest coverage that no external API is called.
- [x] Add Vitest coverage for low-quality off behavior.
- [x] Add Vitest coverage for reduced-motion behavior.
- [x] Add component/content test that aurora learning content includes illustrative disclaimer.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
