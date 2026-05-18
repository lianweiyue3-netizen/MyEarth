# Procedural Cloud Layer Tasks

## Purpose

Provide lightweight optional cloud visuals without external data dependencies.

## Dependencies

- [x] Layer adapter interface is available.
- [x] Quality profile type is available.
- [x] Reduced-motion state is available.

## Implementation Checklist

- [x] Create `src/layers/proceduralCloudLayer.ts`.
- [x] Implement cloud adapter using `CesiumLayerAdapter`.
- [x] Generate or create transparent procedural cloud texture.
- [x] Add cloud overlay to Cesium without external network requests.
- [x] Keep clouds from blocking first frame.
- [x] Implement clouds toggle on.
- [x] Implement clouds toggle off.
- [x] Add subtle animation only when quality and motion settings allow.
- [x] Use static clouds when reduced motion is active.
- [x] Simplify clouds in balanced fallback if needed.
- [x] Disable clouds in low quality.
- [x] Report initialization failure as recoverable failed availability.

## Tests

- [x] Add Vitest coverage that no network source is required.
- [x] Add Vitest coverage for toggle behavior.
- [x] Add Vitest coverage for low-quality off behavior.
- [x] Add Vitest coverage for reduced-motion static behavior.
- [x] Add Vitest coverage that failure does not block globe rendering.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
