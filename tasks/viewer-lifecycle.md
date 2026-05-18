# Viewer Lifecycle Tasks

## Purpose

Create, configure, and destroy the Cesium `Viewer` with token handling, WebGL checks, base imagery, lighting, and credits.

## Dependencies

- [x] Configuration module is available.
- [x] Shared `AppError` type is available.
- [x] Cesium dependency is installed.

## Implementation Checklist

- [x] Create `src/cesium/viewerLifecycle.ts`.
- [x] Create `src/cesium/createViewer.ts`.
- [x] Define `ViewerCreateOptions`.
- [x] Define `ViewerCreateResult`.
- [x] Implement WebGL availability check.
- [x] Return `missingToken` when Cesium ion token is absent.
- [x] Assign `Cesium.Ion.defaultAccessToken` only when token exists.
- [x] Configure Cesium viewer with custom UI shell defaults.
- [x] Disable Cesium widgets duplicated by custom UI.
- [x] Preserve Cesium credit display.
- [x] Enable lighting and live sun behavior.
- [x] Configure base imagery provider.
- [x] Configure terrain provider when token and terrain access are available.
- [x] Map Cesium constructor failures to `cesium-init-failed`.
- [x] Implement idempotent `destroyMyEarthViewer`.

## Tests

- [x] Add Vitest coverage for missing token result.
- [x] Add Vitest coverage for WebGL failure mapping.
- [x] Add Vitest coverage for token assignment.
- [x] Add Vitest coverage for widget option defaults.
- [x] Add Vitest coverage for idempotent destroy.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
