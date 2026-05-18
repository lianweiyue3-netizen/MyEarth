# Viewer Lifecycle Tasks

## Purpose

Create, configure, and destroy the Cesium `Viewer` with token handling, WebGL checks, base imagery, lighting, and credits.

## Dependencies

- [ ] Configuration module is available.
- [ ] Shared `AppError` type is available.
- [ ] Cesium dependency is installed.

## Implementation Checklist

- [ ] Create `src/cesium/viewerLifecycle.ts`.
- [ ] Create `src/cesium/createViewer.ts`.
- [ ] Define `ViewerCreateOptions`.
- [ ] Define `ViewerCreateResult`.
- [ ] Implement WebGL availability check.
- [ ] Return `missingToken` when Cesium ion token is absent.
- [ ] Assign `Cesium.Ion.defaultAccessToken` only when token exists.
- [ ] Configure Cesium viewer with custom UI shell defaults.
- [ ] Disable Cesium widgets duplicated by custom UI.
- [ ] Preserve Cesium credit display.
- [ ] Enable lighting and live sun behavior.
- [ ] Configure base imagery provider.
- [ ] Configure terrain provider when token and terrain access are available.
- [ ] Map Cesium constructor failures to `cesium-init-failed`.
- [ ] Implement idempotent `destroyMyEarthViewer`.

## Tests

- [ ] Add Vitest coverage for missing token result.
- [ ] Add Vitest coverage for WebGL failure mapping.
- [ ] Add Vitest coverage for token assignment.
- [ ] Add Vitest coverage for widget option defaults.
- [ ] Add Vitest coverage for idempotent destroy.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
